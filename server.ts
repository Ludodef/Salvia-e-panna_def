import express, { Request, Response } from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Allow payloads for PDF base64 uploads
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy initialized GenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is not set. Requests will fail if AI features are called without API key.");
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey || "",
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Call Gemini with multi-model fallback and exponential retry.
 * Handles 503 UNAVAILABLE (high demand), 429, and transient server overload.
 */
async function callGeminiWithFallback(
  ai: GoogleGenAI,
  params: {
    contents: any;
    config?: any;
  }
) {
  // Ordered fallback models: gemini-3.8-flash -> gemini-3.1-flash-lite -> gemini-flash-latest
  const candidateModels = [
    "gemini-3.8-flash",
    "gemini-3.1-flash-lite",
    "gemini-flash-latest",
  ];

  let lastError: any = null;

  for (let m = 0; m < candidateModels.length; m++) {
    const model = candidateModels[m];
    // Try up to 2 attempts per candidate model
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        console.log(`[Gemini] Calling ${model} (attempt ${attempt})...`);
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: params.config,
        });
        console.log(`[Gemini] Success using model ${model}`);
        return response;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || String(err);
        const isTransient =
          errMsg.includes("503") ||
          errMsg.includes("high demand") ||
          errMsg.includes("UNAVAILABLE") ||
          errMsg.includes("Resource has been exhausted") ||
          errMsg.includes("429") ||
          err?.status === 503 ||
          err?.status === 429;

        console.warn(`[Gemini] Model ${model} attempt ${attempt} warning: ${errMsg}`);

        if (isTransient) {
          if (attempt < 2) {
            // Wait 1.5s before second attempt on same model
            await new Promise((resolve) => setTimeout(resolve, 1500));
          } else {
            // Next model in fallback list
            break;
          }
        } else {
          // If it's a non-transient error, throw immediately
          throw err;
        }
      }
    }
  }

  throw lastError;
}

// Health check
app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper to format friendly error messages
function formatAiErrorMessage(error: any): string {
  const msg = error?.message || String(error);
  if (
    msg.includes("503") ||
    msg.includes("high demand") ||
    msg.includes("UNAVAILABLE") ||
    msg.includes("Resource has been exhausted")
  ) {
    return "I server AI stanno registrando un momentaneo picco di traffico globale. I tentativi automatici sui modelli alternativi sono falliti: per favore attendi qualche secondo e clicca su 'Riprova', oppure prova a incollare il testo della dieta.";
  }
  return "Errore durante l'analisi con AI: " + msg;
}

// 1. PDF DIET PARSER ENDPOINT
app.post("/api/diet/parse-pdf", async (req: Request, res: Response) => {
  try {
    const { pdfBase64, fileName, textContent } = req.body;

    if (!pdfBase64 && !textContent) {
      return res.status(400).json({ error: "Nessun PDF o testo fornito." });
    }

    const ai = getGenAI();
    const prompt = `Sei un esperto biologo nutrizionista e chef specializzato in diete personalizzate.
Analizza accuratamente questo documento di dieta / piano alimentare (in lingua italiana).
Estrai con massima precisione:
1. Un titolo descrittivo del piano (es. "Piano Alimentare Ipocalorico Personalizzato")
2. Obiettivo principale o tipologia (es. Dimagrimento, Mantenimento, Antinfiammatorio, Tonificazione)
3. Stima o indicazione delle calorie giornaliere (se indicata o deducibile, es. "1500-1600 kcal")
4. Regole generali fondamentali (es. olio max 2 cucchiai, acqua 2L, cotture consigliate, alimenti da limitare)
5. Categorie di alimenti concessi con relative porzioni/grammature tipiche:
   - Proteine (carni bianche, pesce, legumi, uova, formaggi magri, etc.)
   - Carboidrati (riso, pasta integrale, pane di segale, patate, fiocchi d'avena, etc.)
   - Verdure (zucchine, finocchi, spinaci, pomodorini, etc.)
   - Grassi e condimenti (olio EVO, frutta secca, semi)
   - Frutta consentita
   - Latticini o bevande vegetali
   - Erbe aromatiche e spezie libere (salvia, rosmarino, limone, etc.)
6. Piano settimanale giorno per giorno (Lunedì a Domenica) con i pasti previsti (colazione, spuntino_mattina, pranzo, merenda, cena)
7. Regole di sostituzione (es. 150g carne = 180g pesce = 150g legumi)
8. Un breve riassunto chiaro e incoraggiante per il paziente.

Rispondi rigorosamente in formato JSON valido secondo questo schema:
{
  "title": string,
  "goalOrTarget": string,
  "dailyCalories": string,
  "generalRules": string[],
  "allowedFoods": {
    "proteins": string[],
    "carbs": string[],
    "vegetables": string[],
    "fatsAndCondiments": string[],
    "fruits": string[],
    "dairyOrPlantMilks": string[],
    "freeSpicesAndHerbs": string[]
  },
  "weeklySchedule": [
    {
      "dayName": string,
      "meals": {
        "colazione": string[],
        "spuntino_mattina": string[],
        "pranzo": string[],
        "merenda": string[],
        "cena": string[]
      }
    }
  ],
  "substitutionsRules": string[],
  "rawSummary": string
}`;

    const contents: any[] = [];
    if (pdfBase64) {
      // Clean base64 string if it contains data URI prefix
      const cleanBase64 = pdfBase64.replace(/^data:application\/pdf;base64,/, "");
      contents.push({
        inlineData: {
          mimeType: "application/pdf",
          data: cleanBase64,
        },
      });
    }

    contents.push({
      text: textContent
        ? `${prompt}\n\nTesto o piano alimentare fornito:\n${textContent}`
        : prompt,
    });

    const response = await callGeminiWithFallback(ai, {
      contents: { parts: contents },
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text || "{}";
    const parsedData = JSON.parse(responseText);

    const fullDietPlan = {
      id: "diet-" + Date.now(),
      title: parsedData.title || "Piano Alimentare Personalizzato",
      goalOrTarget: parsedData.goalOrTarget || "Alimentazione sana e bilanciata",
      dailyCalories: parsedData.dailyCalories || "Personalizzato",
      fileName: fileName || "piano_alimentare.pdf",
      dateUploaded: "Oggi",
      generalRules: parsedData.generalRules || [
        "Privilegiare cibi freschi e non processati",
        "Controllo dell'olio extravergine d'oliva",
        "Abbondanti verdure di stagione ad ogni pasto principale",
      ],
      allowedFoods: {
        proteins: parsedData.allowedFoods?.proteins || [],
        carbs: parsedData.allowedFoods?.carbs || [],
        vegetables: parsedData.allowedFoods?.vegetables || [],
        fatsAndCondiments: parsedData.allowedFoods?.fatsAndCondiments || [],
        fruits: parsedData.allowedFoods?.fruits || [],
        dairyOrPlantMilks: parsedData.allowedFoods?.dairyOrPlantMilks || [],
        freeSpicesAndHerbs: parsedData.allowedFoods?.freeSpicesAndHerbs || [
          "Salvia fresca",
          "Rosmarino",
          "Origano",
          "Succo di limone",
        ],
      },
      weeklySchedule: parsedData.weeklySchedule || [],
      substitutionsRules: parsedData.substitutionsRules || [],
      rawSummary: parsedData.rawSummary || "Piano alimentare analizzato con successo.",
    };

    res.json({ success: true, dietPlan: fullDietPlan });
  } catch (error: any) {
    console.error("Error parsing diet PDF:", error);
    res.status(500).json({
      error: formatAiErrorMessage(error),
    });
  }
});

// 2. DAILY RECIPE GENERATOR
app.post("/api/recipes/generate-daily", async (req: Request, res: Response) => {
  try {
    const {
      dayName,
      mealType,
      commitmentLevel,
      availableMinutes,
      dietPlan,
      fridgeIngredients,
      customPreferences,
    } = req.body;

    const ai = getGenAI();

    const commitmentDescriptions: Record<string, string> = {
      easy: "Facile e veloce: pochissimi passaggi, zero sporco (padella unica o insalatiera tiepida), cottura immediata, massima semplicità.",
      medium: "Equilibrato e curato: una cottura corretta (es. vapore + marinatura, padella con erbe aromatiche, forno rapido), presentazione gradevole, sapore bilanciato.",
      elaborate: "Gourmet e creativo: tecniche che esaltano gli ingredienti della dieta senza calorie inutili (es. emulsioni leggere alle erbe, cotture al cartoccio aromatizzato, tartare cotte, consistenze a contrasto).",
    };

    const targetMinutes = Number(availableMinutes) || 20;
    const effortText = commitmentDescriptions[commitmentLevel] || commitmentDescriptions.medium;

    const prompt = `Sei un maestro di cucina naturale italiana e biologo nutrizionista.
Crea UNA ricetta deliziosa, sana, invitante e rigorosamente fedele al piano alimentare della persona.

PARAMETRI RICHIESTI DALL'UTENTE:
- Giorno selezionato: ${dayName || "Oggi"}
- Tipo di pasto: ${mealType || "pranzo"}
- Grado di impegno: ${commitmentLevel} (${effortText})
- TEMPO MASSIMO A DISPOSIZIONE PER LA PREPARAZIONE: ${targetMinutes} minuti in totale (rispetta scrupolosamente questo tempo!)
${fridgeIngredients && fridgeIngredients.length > 0 ? `- Ingredienti che l'utente ha già a disposizione e vorrebbe preferibilmente valorizzare: ${fridgeIngredients.join(", ")}` : ""}
${customPreferences ? `- Note o desideri dell'utente: ${customPreferences}` : ""}

CONTESTO PIANO ALIMENTARE DELL'UTENTE:
${dietPlan ? JSON.stringify({
  title: dietPlan.title,
  rules: dietPlan.generalRules,
  allowedFoods: dietPlan.allowedFoods,
  substitutions: dietPlan.substitutionsRules,
  scheduledMeal: dietPlan.weeklySchedule?.find((d: any) => d.dayName?.toLowerCase() === (dayName || "").toLowerCase())?.meals?.[mealType] || "Pasto libero bilanciato secondo le regole della dieta"
}, null, 2) : "Segui i principi della sana dieta mediterranea: porzioni equilibrate di proteine magre, carboidrati complessi a basso indice glicemico, abbondanti verdure di stagione, olio EVO a crudo e ricchezza di erbe aromatiche come salvia fresca e timo."}

REGOLE TASSATIVE PER LA RICETTA:
1. Tempo totale effettivo di preparazione + cottura NON deve superare ${targetMinutes} minuti!
2. Usa solo ingredienti ammessi nella dieta (specifica per ciascun ingrediente se è un ingrediente approvato della dieta, la quantità esatta e la sua categoria).
3. L'aspetto deve essere appetitoso, naturale e fresco (stile verde salvia e bianco panna: profumo di erbe, colori vivi delle verdure, cotture pulite).
4. Fornisci passaggi di preparazione numerati, chiarissimi, cronometrati.
5. Includi un "Consiglio dello Chef" che spiega come rendere il piatto speciale risparmiando tempo o esaltando il sapore naturale.
6. Includi una stima nutrizionale realistica (calorie stimate, grammi di proteine, carboidrati, grassi e fibre).

Rispondi rigorosamente in JSON con questa struttura:
{
  "title": string,
  "subtitle": string,
  "mealType": string,
  "prepTimeMinutes": number,
  "cookTimeMinutes": number,
  "totalTimeMinutes": number,
  "commitmentLevel": "${commitmentLevel}",
  "portions": 1,
  "ingredients": [
    {
      "name": string,
      "amount": string,
      "isDietApproved": true,
      "dietCategory": string,
      "isFromPantryOrFridge": boolean
    }
  ],
  "steps": string[],
  "chefTip": string,
  "dietAlignmentNote": string,
  "nutritionalInfo": {
    "estimatedCalories": number,
    "proteinGrams": number,
    "carbsGrams": number,
    "fatGrams": number,
    "fiberGrams": number
  },
  "tags": string[]
}`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const rawRecipe = JSON.parse(response.text || "{}");
    const recipe = {
      ...rawRecipe,
      id: "recipe-" + Date.now(),
      createdAt: "Oggi",
      isFavorite: false,
    };

    res.json({ success: true, recipe });
  } catch (error: any) {
    console.error("Error generating daily recipe:", error);
    res.status(500).json({
      error: formatAiErrorMessage(error),
    });
  }
});

// 3. ANTI-WASTE (SVUOTAFRIGO & DISPENSA) GENERATOR
app.post("/api/recipes/anti-waste", async (req: Request, res: Response) => {
  try {
    const { fridgeAndPantryItems, availableMinutes, commitmentLevel, dietPlan } = req.body;

    if (!fridgeAndPantryItems || fridgeAndPantryItems.length === 0) {
      return res.status(400).json({
        error: "Inserisci almeno un ingrediente presente in frigo o dispensa.",
      });
    }

    const ai = getGenAI();
    const targetMinutes = Number(availableMinutes) || 15;

    const expiringItems = fridgeAndPantryItems.filter((i: any) => i.isExpiringSoon).map((i: any) => i.name);
    const allItems = fridgeAndPantryItems.map((i: any) => `${i.name} (${i.category}, ${i.quantity || "q.b."}${i.isExpiringSoon ? " - IN SCADENZA" : ""})`);

    const prompt = `Sei lo chef esperto in cucina anti-spreco ("Svuotafrigo & Dispensa") naturale e sostenibile.
L'utente vuole evitare qualsiasi spreco alimentare preparando un piatto VELOCISSIMO, sano e gustoso basato su quello che ha ORA in casa.

INGREDIENTI DISPONIBILI IN FRIGO E DISPENSA:
${allItems.join("\n")}

${expiringItems.length > 0 ? `PRIORITÀ ASSOLUTA ANTISPRECO: Utilizza preferibilmente questi alimenti in scadenza: ${expiringItems.join(", ")}!` : ""}

VINCOLI DI PREPARAZIONE:
- Tempo massimo a disposizione: ${targetMinutes} minuti! (Deve essere un piatto espresso e rapido)
- Grado di impegno: ${commitmentLevel || "easy"} (minimo sporco, massima efficacia)
${dietPlan ? `- Piano alimentare attivo: mantieni il piatto sano, leggero e coerente con la filosofia nutrizionale (${dietPlan.title}).` : "- Cucina sana, leggera e naturale."}

Genera 2 alternative di ricette anti-spreco veloci e deliziose che utilizzano al meglio questi ingredienti.
Rispondi RIGOROSAMENTE in JSON con questo formato:
{
  "recipes": [
    {
      "title": string,
      "subtitle": string,
      "mealType": "pranzo o cena o spuntino",
      "prepTimeMinutes": number,
      "cookTimeMinutes": number,
      "totalTimeMinutes": number,
      "commitmentLevel": "${commitmentLevel || "easy"}",
      "portions": 1,
      "ingredients": [
        {
          "name": string,
          "amount": string,
          "isDietApproved": true,
          "dietCategory": string,
          "isFromPantryOrFridge": true
        }
      ],
      "steps": string[],
      "chefTip": string,
      "dietAlignmentNote": string,
      "antiWasteSavedIngredients": string[],
      "nutritionalInfo": {
        "estimatedCalories": number,
        "proteinGrams": number,
        "carbsGrams": number,
        "fatGrams": number,
        "fiberGrams": number
      },
      "tags": string[]
    }
  ]
}`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || '{"recipes": []}');
    const recipes = (parsed.recipes || []).map((r: any, idx: number) => ({
      ...r,
      id: `antiwaste-${Date.now()}-${idx}`,
      createdAt: "Oggi",
      isFavorite: false,
    }));

    res.json({ success: true, recipes });
  } catch (error: any) {
    console.error("Error generating anti-waste recipe:", error);
    res.status(500).json({
      error: formatAiErrorMessage(error),
    });
  }
});

// 4. DIET SUBSTITUTION ADVICE
app.post("/api/diet/substitute", async (req: Request, res: Response) => {
  try {
    const { ingredientToReplace, dietPlan, pantryItems } = req.body;
    const ai = getGenAI();

    const prompt = `Sei un nutrizionista. L'utente non ha o non vuole mangiare "${ingredientToReplace}".
Piano alimentare: ${dietPlan ? dietPlan.title : "Dieta Mediterranea Equilibrata"}
Regole di sostituzione note: ${dietPlan?.substitutionsRules?.join("; ") || "standard"}
${pantryItems && pantryItems.length > 0 ? `Ingredienti attualmente in frigo/dispensa: ${pantryItems.map((p: any) => p.name).join(", ")}` : ""}

Suggerisci 3 alternative nutrizionalmente equivalenti che rispettino la dieta, specificando le grammature sostitutive e se sono già disponibili nella dispensa dell'utente.
Rispondi in JSON:
{
  "ingredientToReplace": "${ingredientToReplace}",
  "substitutions": [
    {
      "name": string,
      "amount": string,
      "reason": string,
      "alreadyInPantry": boolean
    }
  ],
  "dietitianNote": string
}`;

    const response = await callGeminiWithFallback(ai, {
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    res.json({ success: true, data: JSON.parse(response.text || "{}") });
  } catch (error: any) {
    console.error("Error suggesting substitution:", error);
    res.status(500).json({ error: formatAiErrorMessage(error) });
  }
});

// Vite middleware & Static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Piano Dieta & Ricette server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
