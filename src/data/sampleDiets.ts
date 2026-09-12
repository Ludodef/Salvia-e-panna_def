import { DietPlan, PantryItem } from '../types';

export const SAMPLE_MEDITERRANEAN_DIET: DietPlan = {
  id: 'mediterranean-default',
  title: 'Piano Mediterraneo Equilibrato (1600 kcal)',
  goalOrTarget: 'Benessere metabolico, mantenimento tonico e anti-infiammatorio',
  dailyCalories: 'Circa 1550 - 1650 kcal al giorno',
  fileName: 'piano_alimentare_dott_verdi.pdf',
  dateUploaded: 'Oggi',
  generalRules: [
    'Olio Extravergine di Oliva: massimo 2 cucchiai (20ml) totali al giorno a crudo',
    'Bevi almeno 2 litri di acqua oligominerale o tisane non zuccherate al giorno',
    'Verdure a volontà sia a pranzo che a cena (preferire cotture al vapore, forno o piastra)',
    'Pesce almeno 3 volte a settimana, prediligendo pesce azzurro (sgombro, alici, salmone)',
    'Legumi da 2 a 3 volte a settimana in sostituzione della carne o formaggi',
    'Evita fritture, cibi ultra-processati e zuccheri raffinati aggiunti'
  ],
  allowedFoods: {
    proteins: [
      'Petto di pollo o tacchino (150g)',
      'Merluzzo, orata, spigola o salmone (180g)',
      'Ricotta vaccina fresca o fiocchi di latte (120g)',
      'Uova biologiche (max 4 a settimana)',
      'Lenticchie, ceci, fagioli cannellini (cottura 150g o secchi 50g)',
      'Bresaola o fesa di tacchino (60g per spuntini o cene rapide)',
      'Tofu al naturale o tempeh (120g)'
    ],
    carbs: [
      'Riso basmati o integrale (70g)',
      'Pasta integrale o di farro (70g)',
      'Pane integrale di segale o lievito madre (50g)',
      'Patate dolci o novelle (180g in alternativa ai cereali)',
      'Fiocchi d\'avena integrali (40g per colazione)',
      'Quinoa o couscous integrale (70g)'
    ],
    vegetables: [
      'Zucchine, spinaci, bietole, finocchi, cetrioli (porzione libera)',
      'Pomodorini datterini, peperoni, melanzane',
      'Broccoli, cavolfiore, cavolo nero',
      'Insalata mista, rucola, valeriana',
      'Carote (100g max a pasto)'
    ],
    fatsAndCondiments: [
      'Olio extravergine d\'oliva extra vergine a crudo',
      'Mandorle o noci non salate (15g al giorno)',
      'Semi di chia o lino (1 cucchiaino)',
      'Avocado (40g)'
    ],
    fruits: [
      'Mele, pere, frutti di bosco (mirtilli, lamponi)',
      'Agrumi (arancia, pompelmo, limone)',
      'Kiwi, pesche o albicocche di stagione'
    ],
    dairyOrPlantMilks: [
      'Yogurt greco 0% o 2% di grassi',
      'Kefir naturale',
      'Bevanda di mandorla o soia senza zuccheri aggiunti'
    ],
    freeSpicesAndHerbs: [
      'Salvia fresca, rosmarino, basilico, timo',
      'Origano, maggiorana, menta',
      'Curcuma, zenzero fresco grattugiato, pepe nero',
      'Succo di limone, aceto di mele biologico'
    ]
  },
  weeklySchedule: [
    {
      dayName: 'Lunedì',
      meals: {
        colazione: ['Yogurt greco naturale con mirtilli e fiocchi d\'avena', 'Caffè o tè verde non zuccherato'],
        spuntino_mattina: ['Una mela verde e 3 noci'],
        pranzo: ['Pasta integrale al farro con zucchine trifolate e ricotta fresca vaccina', 'Insalata di finocchi e limone'],
        merenda: ['Frutti di bosco freschi o tisana drenante'],
        cena: ['Filetto di orata o merluzzo al cartoccio con erbe e pomodorini', 'Bietole al vapore con goccio di olio EVO e limone']
      }
    },
    {
      dayName: 'Martedì',
      meals: {
        colazione: ['Porridge d\'avena con bevanda vegetale, semi di chia e kiwi'],
        spuntino_mattina: ['Una spremuta d\'arancia fresca'],
        pranzo: ['Riso integrale saltato con pollo a cubetti, carote e salvia fresca', 'Verdure grigliate miste'],
        merenda: ['Yogurt magro bianco o mandorle (15g)'],
        cena: ['Crema di ceci e rosmarino con crostini integrali', 'Spinaci novelli all\'agro']
      }
    },
    {
      dayName: 'Mercoledì',
      meals: {
        colazione: ['Pane di segale tostato con ricotta magra e cannella', 'Tè verde'],
        spuntino_mattina: ['Una pera e una manciata di mandorle'],
        pranzo: ['Insalata tiepida di quinoa con lenticchie, pomodorini e menta', 'Cetrioli con origano'],
        merenda: ['Yogurt greco 0%'],
        cena: ['Trancio di salmone al forno con semi di papavero', 'Zucchine e cavolfiore al vapore']
      }
    },
    {
      dayName: 'Giovedì',
      meals: {
        colazione: ['Yogurt greco con fiocchi d\'avena e mela a fettine'],
        spuntino_mattina: ['Frutta fresca di stagione'],
        pranzo: ['Couscous integrale con straccetti di tacchino e peperoni stufati', 'Valeriana con pomodorini'],
        merenda: ['Tisana alla melissa o mandorle'],
        cena: ['Frittata al forno con 2 uova bio, spinaci e parmigiano', 'Insalata mista fresca']
      }
    },
    {
      dayName: 'Venerdì',
      meals: {
        colazione: ['Pancake leggeri d\'avena e albume con gocce di mirtillo'],
        spuntino_mattina: ['Kefir naturale'],
        pranzo: ['Spaghetti integrali con pomodorini freschi scottati, basilico e tofu marinato', 'Finocchi alla julienne'],
        merenda: ['Una mela o kiwi'],
        cena: ['Spigola alle erbe aromatiche (salvia e timo) con patate novelle al vapore', 'Broccoli saltati']
      }
    },
    {
      dayName: 'Sabato',
      meals: {
        colazione: ['Yogurt greco con frutti di bosco e semi di lino'],
        spuntino_mattina: ['Spremuta di pompelmo o limone caldo'],
        pranzo: ['Insalata di riso basmati con gamberetti o uova sode, cetrioli e rucola'],
        merenda: ['Frutta secca o tè bianco'],
        cena: ['Pollo alla griglia profumato al limone e rosmarino con contorno di zucchine e carote']
      }
    },
    {
      dayName: 'Domenica',
      meals: {
        colazione: ['Colazione con pane lievito madre, marmellata 100% frutta e caffè'],
        spuntino_mattina: ['Frutta fresca'],
        pranzo: ['Vellutata di zucca e carote con cannellini e un filo d\'olio EVO', 'Insalata di rucola e parmigiano'],
        merenda: ['Tisana speziata cannella e zenzero'],
        cena: ['Merluzzo in padella con capperi, origano e pomodorini', 'Cavolo nero scottato']
      }
    }
  ],
  substitutionsRules: [
    '150g di pollo = 180g di pesce bianco = 120g di ricotta = 2 uova = 150g di legumi cotti',
    '70g di riso = 70g di pasta integrale = 80g di pane di segale = 200g di patate novelle',
    'Le verdure a foglia verde e le zucchine possono essere scambiate liberamente tra loro'
  ],
  rawSummary: 'Piano nutrizionale mediterraneo antinfiammatorio, focalizzato su ingredienti freschi, carboidrati complessi integrali, proteine nobili magre e abbondanti erbe aromatiche e verdure di stagione.'
};

export const INITIAL_PANTRY_ITEMS: PantryItem[] = [
  { id: '1', name: 'Zucchine tonde', category: 'frigo', quantity: '2 pezzi', isExpiringSoon: true, addedAt: '2 giorni fa' },
  { id: '2', name: 'Ricotta vaccina fresca', category: 'frigo', quantity: '150g', isExpiringSoon: true, addedAt: '3 giorni fa' },
  { id: '3', name: 'Pomodorini datterini', category: 'frigo', quantity: '200g', isExpiringSoon: false, addedAt: 'Ieri' },
  { id: '4', name: 'Petto di pollo', category: 'frigo', quantity: '250g', isExpiringSoon: true, addedAt: 'Oggi' },
  { id: '5', name: 'Uova biologiche', category: 'frigo', quantity: '4 uova', isExpiringSoon: false, addedAt: '4 giorni fa' },
  { id: '6', name: 'Pasta integrale di farro', category: 'dispensa', quantity: '500g', isExpiringSoon: false, addedAt: 'Dispensa' },
  { id: '7', name: 'Ceci precotti in vetro', category: 'dispensa', quantity: '1 barattolo', isExpiringSoon: false, addedAt: 'Dispensa' },
  { id: '8', name: 'Salvia fresca & Rosmarino', category: 'frigo', quantity: '1 mazzetto', isExpiringSoon: false, addedAt: 'Fresco' },
  { id: '9', name: 'Riso Basmati', category: 'dispensa', quantity: '400g', isExpiringSoon: false, addedAt: 'Dispensa' },
  { id: '10', name: 'Olio EVO Biologico', category: 'dispensa', quantity: '1 bottiglia', isExpiringSoon: false, addedAt: 'Dispensa' },
];

export const INITIAL_FEATURED_RECIPE = {
  id: 'recipe-welcome-1',
  title: 'Straccetti di Pollo alla Salvia con Tagliatelle di Zucchine e Pomodorini',
  subtitle: 'Piatto unico fresco, aromatico e perfettamente bilanciato con gli ingredienti del tuo piano',
  mealType: 'pranzo',
  prepTimeMinutes: 10,
  cookTimeMinutes: 12,
  totalTimeMinutes: 22,
  commitmentLevel: 'easy' as const,
  portions: 1,
  ingredients: [
    { name: 'Petto di pollo a striscioline', amount: '150g', isDietApproved: true, dietCategory: 'Proteine', isFromPantryOrFridge: true },
    { name: 'Zucchine medie', amount: '2 pezzi (a nastro)', isDietApproved: true, dietCategory: 'Verdure', isFromPantryOrFridge: true },
    { name: 'Pomodorini datterini', amount: '8-10 pezzi', isDietApproved: true, dietCategory: 'Verdure', isFromPantryOrFridge: true },
    { name: 'Foglie di salvia fresca', amount: '5-6 foglie', isDietApproved: true, dietCategory: 'Erbe aromatiche', isFromPantryOrFridge: true },
    { name: 'Olio Extravergine d\'Oliva', amount: '1 cucchiaio (10g)', isDietApproved: true, dietCategory: 'Grassi buoni', isFromPantryOrFridge: true },
    { name: 'Succo di limone e scorzetta', amount: 'q.b.', isDietApproved: true, dietCategory: 'Condimenti liberi' },
    { name: 'Pepe nero macinato fresco e sale marino', amount: 'un pizzico', isDietApproved: true, dietCategory: 'Spezie' }
  ],
  steps: [
    'Lava le zucchine e, con l\'aiuto di un pelapatate, ricava dei nastri sottili tipo tagliatelle vegetali fino al cuore.',
    'Taglia il petto di pollo a bocconcini o striscioline regolari e asciugalo leggermente con carta assorbente.',
    'In una padella antiaderente scalda mezzo cucchiaio di olio EVO con le foglie di salvia fresca a fiamma moderata per 1 minuto, rilasciando l\'aroma balsamico.',
    'Aggiungi gli straccetti di pollo e rosola a fiamma vivace per 4-5 minuti fino a doratura uniforme.',
    'Unisci i pomodorini tagliati a metà e le tagliatelle di zucchine. Salta per soli 3 minuti per mantenere le verdure croccanti e ricche di vitamine.',
    'Spegni il fuoco, condisci con qualche goccia di succo di limone fresco, scorzetta grattugiata e il restante filo di olio a crudo. Servi caldo o tiepido.'
  ],
  chefTip: 'La cottura rapida delle zucchine a nastro conserva intatta la clorofilla e l\'acqua di vegetazione, rendendo il piatto succoso senza bisogno di salse grasse o burro.',
  dietAlignmentNote: 'Conforme al pasto pranzo: include esattamente la grammatura di petto di pollo indicata (150g), porzione libera di verdura fresca e 1 cucchiaio di olio EVO a crudo.',
  nutritionalInfo: {
    estimatedCalories: 335,
    proteinGrams: 36,
    carbsGrams: 11,
    fatGrams: 14,
    fiberGrams: 5
  },
  antiWasteSavedIngredients: ['Zucchine', 'Petto di pollo', 'Salvia fresca'],
  tags: ['Pasto Veloce', 'Proteico', 'Senza Glutine', 'Salvia & Limone', 'Svuotafrigo'],
  isFavorite: true,
  createdAt: 'Oggi'
};
