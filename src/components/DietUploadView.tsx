import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BookOpen,
  Calendar,
  Sparkles,
  RefreshCw,
  Trash2,
  Apple,
  Fish,
  Wheat,
  Droplet,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { DietPlan } from '../types';
import { SAMPLE_MEDITERRANEAN_DIET } from '../data/sampleDiets';

interface DietUploadViewProps {
  dietPlan: DietPlan | null;
  setDietPlan: (plan: DietPlan | null) => void;
  onNavigateToDaily: () => void;
}

const SAMPLE_DIET_PRESETS: { id: string; name: string; desc: string; plan: DietPlan }[] = [
  {
    id: 'mediterranean',
    name: 'Piano Mediterraneo Equilibrato (1600 kcal)',
    desc: 'Pesce azzurro, carni bianche, legumi, cereali integrali e verdure di stagione.',
    plan: SAMPLE_MEDITERRANEAN_DIET,
  },
  {
    id: 'lowcarb',
    name: 'Piano Low-Carb & Proteico (1700 kcal)',
    desc: 'Alto valore proteico, verdure a basso indice glicemico, grassi sani (olio EVO, noci, avocado).',
    plan: {
      ...SAMPLE_MEDITERRANEAN_DIET,
      id: 'lowcarb-preset',
      title: 'Piano Low-Carb & Proteico Tonificante',
      goalOrTarget: 'Definizione muscolare e controllo della glicemia',
      dailyCalories: '1700 kcal',
      fileName: 'dieta_low_carb_proteica.pdf',
      allowedFoods: {
        ...SAMPLE_MEDITERRANEAN_DIET.allowedFoods,
        proteins: [
          'Petto di pollo, tacchino o coniglio (180g)',
          'Salmone fresco o trancio di tonno (200g)',
          'Uova intere biologiche (max 6 a settimana)',
          'Ricotta magra o fiocchi di latte proteici (150g)',
          'Tofu grigliato alle erbe (150g)',
        ],
        carbs: [
          'Avena integrale (30g colazione)',
          'Quinoa o riso venere (50g)',
          'Patate novelle o zucca (150g max 2 volte a settimana)',
        ],
      },
    },
  },
  {
    id: 'vegetarian',
    name: 'Piano Vegetariano Salvia & Legumi (1550 kcal)',
    desc: 'Lenticchie, ceci, uova, formaggi magri freschi, semi oleosi e abbondanza di erbe aromatiche.',
    plan: {
      ...SAMPLE_MEDITERRANEAN_DIET,
      id: 'veg-preset',
      title: 'Piano Vegetariano Antinfiammatorio',
      goalOrTarget: 'Benessere intestinale e apporto bilanciato di proteine vegetali',
      dailyCalories: '1550 kcal',
      fileName: 'dieta_vegetariana_salvia.pdf',
      allowedFoods: {
        ...SAMPLE_MEDITERRANEAN_DIET.allowedFoods,
        proteins: [
          'Lenticchie rosse o verdi (cottura 180g)',
          'Ceci lessati (180g)',
          'Fagioli cannellini o borlotti (180g)',
          'Uova biologiche (3-4 a settimana)',
          'Ricotta vaccina fresca (130g)',
          'Tempeh o Tofu alle erbe (140g)',
        ],
      },
    },
  },
];

export const DietUploadView: React.FC<DietUploadViewProps> = ({
  dietPlan,
  setDietPlan,
  onNavigateToDaily,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [lastUploadedFile, setLastUploadedFile] = useState<File | null>(null);
  const [showPasteText, setShowPasteText] = useState(false);
  const [pastedText, setPastedText] = useState('');
  const [expandedDay, setExpandedDay] = useState<string | null>('Lunedì');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMsg('Per favore carica un file in formato PDF.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setErrorMsg('Il file supera la dimensione massima di 20 MB.');
      return;
    }

    setLastUploadedFile(file);
    setErrorMsg(null);
    setIsProcessing(true);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const base64String = (reader.result as string).split(',')[1];
          const res = await fetch('/api/diet/parse-pdf', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              pdfBase64: base64String,
              fileName: file.name,
            }),
          });

          const data = await res.json();
          if (data.success && data.dietPlan) {
            setDietPlan(data.dietPlan);
            setErrorMsg(null);
          } else {
            setErrorMsg(data.error || 'Errore nella lettura del PDF con AI. Riprova tra poco.');
          }
        } catch (err: any) {
          setErrorMsg('Errore di comunicazione con il server. Riprova tra poco.');
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      setErrorMsg('Errore lettura file: ' + err?.message);
      setIsProcessing(false);
    }
  };

  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) return;
    setIsProcessing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/diet/parse-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          textContent: pastedText,
          fileName: 'piano_incollato.txt',
        }),
      });

      const data = await res.json();
      if (data.success && data.dietPlan) {
        setDietPlan(data.dietPlan);
        setShowPasteText(false);
        setPastedText('');
      } else {
        setErrorMsg(data.error || 'Errore nell\'analisi del testo.');
      }
    } catch (err: any) {
      setErrorMsg('Errore: ' + err?.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Introduction Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] text-[#3B543F] text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Piano Alimentare del Nutrizionista</span>
        </div>
        <h1 className="font-serif-natural text-2xl sm:text-3xl text-[#233527] font-semibold">
          Carica la tua Dieta & Esplora le Regole
        </h1>
        <p className="text-xs sm:text-sm text-[#5C7260] leading-relaxed">
          Carica il PDF rilasciato dal tuo nutrizionista o medico. Gemini estrarrà automaticamente
          le grammature, gli ingredienti ammessi, il calendario settimanale e le regole di sostituzione.
        </p>
      </div>

      {/* Upload Box */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DD] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          id="drop-pdf-zone"
          className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
            isDragging
              ? 'border-[#4A6B50] bg-[#F2F7F3]'
              : 'border-[#DDD9CD] hover:border-[#8BAE92] bg-[#FAF8F5]'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#E8EFE9] text-[#4A6B50] mx-auto flex items-center justify-center shadow-xs">
              {isProcessing ? (
                <Loader2 className="w-7 h-7 animate-spin" />
              ) : (
                <UploadCloud className="w-7 h-7" />
              )}
            </div>

            <div>
              <h3 className="font-serif-natural text-lg font-semibold text-[#233527]">
                {isProcessing
                  ? 'Analisi della dieta in corso con Gemini AI...'
                  : 'Trascina qui il tuo PDF o clicca per sfogliare'}
              </h3>
              <p className="text-xs text-[#637966] mt-1">
                {isProcessing
                  ? 'Stiamo estraendo pasti, grammature proteiche, verdure consentite e linee guida...'
                  : 'Supporta qualsiasi piano alimentare in PDF (fino a 20 MB)'}
              </p>
            </div>

            {!isProcessing && (
              <div className="pt-2">
                <span className="inline-block px-4 py-2 rounded-xl bg-[#4A6B50] text-white text-xs font-semibold hover:bg-[#3D5A43] transition-colors shadow-xs">
                  Seleziona PDF dal tuo dispositivo
                </span>
              </div>
            )}
          </div>
        </div>

        {errorMsg && (
          <div className="mt-4 p-4 bg-[#FFF5F2] border border-[#F8C8C0] rounded-xl text-xs text-[#993425] space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-[#B84232] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-semibold block text-[#7D2619]">
                  Attenzione durante l'elaborazione del file
                </span>
                <span className="leading-relaxed block">{errorMsg}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-[#F8D2CA]">
              {lastUploadedFile && (
                <button
                  type="button"
                  onClick={() => handleFileUpload(lastUploadedFile)}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-[#B84232] hover:bg-[#993425] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
                  <span>Riprova con "{lastUploadedFile.name}"</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowPasteText(true)}
                className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E0BCB4] text-[#7D2619] hover:bg-[#FAECE8] text-xs font-medium rounded-lg transition-colors"
              >
                Incolla il testo del piano
              </button>
            </div>
          </div>
        )}

        {/* Alternative: Or paste text or choose preset */}
        <div className="mt-5 pt-4 border-t border-[#F0ECE1] flex flex-wrap items-center justify-between gap-3 text-xs text-[#5C7260]">
          <button
            type="button"
            onClick={() => setShowPasteText(!showPasteText)}
            className="text-[#4A6B50] font-medium hover:underline flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" />
            {showPasteText ? 'Nascondi inserimento testo' : 'Non hai il PDF? Incolla il testo del piano'}
          </button>

          <span className="text-[11px] text-[#869989]">oppure prova un modello pronto qui sotto ↓</span>
        </div>

        {showPasteText && (
          <div className="mt-4 space-y-3 p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE6DE]">
            <textarea
              rows={5}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              placeholder="Incolla qui il testo o l'email del tuo piano alimentare..."
              className="w-full p-3 rounded-lg border border-[#DDD9CD] text-xs bg-white focus:outline-none focus:ring-1 focus:ring-[#4A6B50]"
            />
            <button
              onClick={handlePasteSubmit}
              disabled={isProcessing || !pastedText.trim()}
              className="px-4 py-2 bg-[#4A6B50] text-white text-xs font-semibold rounded-lg hover:bg-[#3D5A43] disabled:opacity-50"
            >
              Analizza Testo Dieta
            </button>
          </div>
        )}
      </div>

      {/* Preset Plans for Quick Testing */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-[#526856] flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#4A6B50]" />
          Piani Alimentari di Esempio Pronti all'Uso
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {SAMPLE_DIET_PRESETS.map((preset) => {
            const isCurrent = dietPlan?.id === preset.plan.id || dietPlan?.title === preset.plan.title;
            return (
              <div
                key={preset.id}
                onClick={() => setDietPlan(preset.plan)}
                className={`p-4 rounded-xl border text-left cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-[#E8EFE9] border-[#97B89D] shadow-xs'
                    : 'bg-[#FFFFFF] border-[#E8E5DD] hover:border-[#B4C9B8] hover:bg-[#FAFBF9]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-xs text-[#243929]">{preset.name}</h4>
                  {isCurrent && <CheckCircle2 className="w-4 h-4 text-[#4A6B50]" />}
                </div>
                <p className="text-[11px] text-[#5C7260] mt-1 line-clamp-2 leading-relaxed">
                  {preset.desc}
                </p>
                <button
                  type="button"
                  className="mt-3 text-[11px] font-semibold text-[#4A6B50] hover:underline"
                >
                  {isCurrent ? 'Attivo' : 'Carica questo piano →'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Active Diet Plan Inspector */}
      {dietPlan && (
        <section className="bg-[#FFFFFF] border border-[#E8E5DD] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#EAE6DE]">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64906B]" />
                <h2 className="font-serif-natural text-xl text-[#233527] font-bold">
                  {dietPlan.title}
                </h2>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-[#5C7260]">
                <span>Obiettivo: <strong className="text-[#384E3C]">{dietPlan.goalOrTarget}</strong></span>
                {dietPlan.dailyCalories && (
                  <span>• Calorie: <strong className="text-[#384E3C]">{dietPlan.dailyCalories}</strong></span>
                )}
                {dietPlan.fileName && (
                  <span>• File: <span className="italic">{dietPlan.fileName}</span></span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onNavigateToDaily}
                id="generate-from-diet-btn"
                className="px-4 py-2 rounded-xl bg-[#4A6B50] hover:bg-[#3D5A43] text-white text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <span>Genera Ricetta del Giorno</span>
                <span>→</span>
              </button>
            </div>
          </div>

          {/* General Rules Pills */}
          {dietPlan.generalRules && dietPlan.generalRules.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#526856]">
                Regole Fondamentali del Piano
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {dietPlan.generalRules.map((rule, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DE] text-xs text-[#354839] flex items-start gap-2.5"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#6B8871] mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categorized Allowed Foods */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#526856]">
              Alimenti Ammessi & Porzioni di Riferimento
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* Proteine */}
              <div className="p-4 rounded-xl border border-[#EAE6DE] bg-[#FFFFFF] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2F4E34]">
                  <Fish className="w-4 h-4 text-[#4A6B50]" />
                  <span>Proteine Magre</span>
                </div>
                <ul className="text-xs text-[#526856] space-y-1">
                  {dietPlan.allowedFoods.proteins.map((p, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#849B87]">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Carboidrati */}
              <div className="p-4 rounded-xl border border-[#EAE6DE] bg-[#FFFFFF] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2F4E34]">
                  <Wheat className="w-4 h-4 text-[#4A6B50]" />
                  <span>Carboidrati Complessi</span>
                </div>
                <ul className="text-xs text-[#526856] space-y-1">
                  {dietPlan.allowedFoods.carbs.map((c, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#849B87]">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Verdure */}
              <div className="p-4 rounded-xl border border-[#EAE6DE] bg-[#FFFFFF] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2F4E34]">
                  <Apple className="w-4 h-4 text-[#4A6B50]" />
                  <span>Verdure & Ortaggi</span>
                </div>
                <ul className="text-xs text-[#526856] space-y-1">
                  {dietPlan.allowedFoods.vegetables.map((v, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#849B87]">•</span>
                      <span>{v}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Grassi & Condimenti */}
              <div className="p-4 rounded-xl border border-[#EAE6DE] bg-[#FFFFFF] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2F4E34]">
                  <Droplet className="w-4 h-4 text-[#4A6B50]" />
                  <span>Condimenti & Grassi Buoni</span>
                </div>
                <ul className="text-xs text-[#526856] space-y-1">
                  {dietPlan.allowedFoods.fatsAndCondiments.map((f, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#849B87]">•</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Erbe Aromatiche & Spezie */}
              <div className="p-4 rounded-xl border border-[#EAE6DE] bg-[#FFFFFF] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2F4E34]">
                  <Sparkles className="w-4 h-4 text-[#4A6B50]" />
                  <span>Erbe Libere (Salvia, etc.)</span>
                </div>
                <ul className="text-xs text-[#526856] space-y-1">
                  {dietPlan.allowedFoods.freeSpicesAndHerbs.map((h, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#849B87]">•</span>
                      <span>{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Frutta o Latticini */}
              <div className="p-4 rounded-xl border border-[#EAE6DE] bg-[#FFFFFF] space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#2F4E34]">
                  <Layers className="w-4 h-4 text-[#4A6B50]" />
                  <span>Frutta & Latticini</span>
                </div>
                <ul className="text-xs text-[#526856] space-y-1">
                  {[...dietPlan.allowedFoods.fruits, ...dietPlan.allowedFoods.dairyOrPlantMilks].map((o, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-[#849B87]">•</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Weekly Schedule Accordion */}
          {dietPlan.weeklySchedule && dietPlan.weeklySchedule.length > 0 && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#526856] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#4A6B50]" />
                Schema Settimanale della Dieta
              </h3>

              <div className="space-y-2">
                {dietPlan.weeklySchedule.map((day) => {
                  const isExpanded = expandedDay === day.dayName;
                  return (
                    <div
                      key={day.dayName}
                      className="border border-[#EAE6DE] rounded-xl overflow-hidden bg-[#FAF8F5]"
                    >
                      <button
                        type="button"
                        onClick={() => setExpandedDay(isExpanded ? null : day.dayName)}
                        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-[#F2EFE9] transition-colors"
                      >
                        <span className="font-semibold text-xs sm:text-sm text-[#233527]">
                          {day.dayName}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-[#637966]">
                          <span>
                            Pranzo & Cena
                          </span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-[#EAE6DE] bg-[#FFFFFF] space-y-2 text-xs">
                          {Object.entries(day.meals).map(([mealName, options]) => (
                            <div key={mealName} className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4 py-1.5 border-b border-[#F5F2EC] last:border-0">
                              <span className="font-medium text-[#4A6B50] capitalize w-28 shrink-0">
                                {mealName.replace('_', ' ')}:
                              </span>
                              <span className="text-[#3F5243] leading-relaxed">
                                {Array.isArray(options) ? options.join(' — ') : options}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Substitutions & Equivalence Table */}
          {dietPlan.substitutionsRules && dietPlan.substitutionsRules.length > 0 && (
            <div className="p-4 rounded-xl bg-[#F6F8F6] border border-[#D9E6DB] text-xs text-[#2F4A34] space-y-2">
              <span className="font-semibold text-sm text-[#233527] block">
                Regole di Sostituzione Ufficiali del Piano
              </span>
              <ul className="space-y-1 text-[#465E4B]">
                {dietPlan.substitutionsRules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-[#4A6B50] font-bold">⇄</span>
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
