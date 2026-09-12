import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  Flame,
  ChefHat,
  Heart,
  CheckCircle2,
  Circle,
  Share2,
  Printer,
  RefreshCw,
  Sliders,
  Calendar,
  AlertCircle,
  HelpCircle,
  Refrigerator,
  Leaf,
  Timer
} from 'lucide-react';
import {
  CommitmentLevel,
  DietPlan,
  MealType,
  PantryItem,
  Recipe,
} from '../types';
import { SubstitutionModal } from './SubstitutionModal';

interface DailyRecipeViewProps {
  currentRecipe: Recipe | null;
  setCurrentRecipe: (recipe: Recipe) => void;
  dietPlan: DietPlan | null;
  pantryItems: PantryItem[];
  savedRecipes: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
  onOpenPantry: () => void;
  onOpenDiet: () => void;
}

const DAYS_OF_WEEK = [
  'Lunedì',
  'Martedì',
  'Mercoledì',
  'Giovedì',
  'Venerdì',
  'Sabato',
  'Domenica',
];

const MEAL_OPTIONS: { id: MealType; label: string; icon: string }[] = [
  { id: 'pranzo', label: 'Pranzo', icon: '☀️' },
  { id: 'cena', label: 'Cena', icon: '🌙' },
  { id: 'colazione', label: 'Colazione', icon: '☕' },
  { id: 'spuntino', label: 'Spuntino', icon: '🍏' },
];

export const DailyRecipeView: React.FC<DailyRecipeViewProps> = ({
  currentRecipe,
  setCurrentRecipe,
  dietPlan,
  pantryItems,
  savedRecipes,
  onToggleFavorite,
  onOpenPantry,
  onOpenDiet,
}) => {
  // Determine current day of week in Italian
  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0
  const [selectedDay, setSelectedDay] = useState<string>(DAYS_OF_WEEK[todayIndex]);
  const [selectedMeal, setSelectedMeal] = useState<MealType>('pranzo');
  const [commitmentLevel, setCommitmentLevel] = useState<CommitmentLevel>('easy');
  const [availableMinutes, setAvailableMinutes] = useState<number>(20);
  const [usePantryIngredients, setUsePantryIngredients] = useState<boolean>(true);
  const [customWish, setCustomWish] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});
  const [completedIngredients, setCompletedIngredients] = useState<Record<number, boolean>>({});
  const [ingredientToSubstitute, setIngredientToSubstitute] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<boolean>(false);

  const isFav = currentRecipe
    ? savedRecipes.some((r) => r.id === currentRecipe.id || r.title === currentRecipe.title)
    : false;

  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    setCompletedSteps({});
    setCompletedIngredients({});

    try {
      const expiringList = usePantryIngredients
        ? pantryItems.map((p) => p.name)
        : [];

      const res = await fetch('/api/recipes/generate-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dayName: selectedDay,
          mealType: selectedMeal,
          commitmentLevel,
          availableMinutes,
          dietPlan,
          fridgeIngredients: expiringList,
          customPreferences: customWish,
        }),
      });

      const data = await res.json();
      if (data.success && data.recipe) {
        setCurrentRecipe(data.recipe);
      } else {
        alert("Errore nella proposta ricetta: " + (data.error || "Riprova tra poco."));
      }
    } catch (err: any) {
      console.error(err);
      alert("Errore di connessione: " + err?.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleStep = (index: number) => {
    setCompletedSteps((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const toggleIngredient = (index: number) => {
    setCompletedIngredients((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleShare = () => {
    if (!currentRecipe) return;
    const text = `${currentRecipe.title}\n${currentRecipe.subtitle}\n\nTempo: ${currentRecipe.totalTimeMinutes} min | Calorie: ${currentRecipe.nutritionalInfo.estimatedCalories} kcal\n\nIngredienti:\n${currentRecipe.ingredients.map(i => `• ${i.name} (${i.amount})`).join('\n')}\n\nPreparazione:\n${currentRecipe.steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  // Scheduled meal preview from the current diet plan if available
  const currentDietDay = dietPlan?.weeklySchedule?.find(
    (d) => d.dayName.toLowerCase() === selectedDay.toLowerCase()
  );
  const scheduledDietMeals = currentDietDay?.meals as Record<string, string[]> | undefined;
  const currentScheduledItems = scheduledDietMeals?.[selectedMeal];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Controls Card: Day, Meal, Commitment, Time */}
      <section className="bg-[#FFFFFF] border border-[#E8E5DD] rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#F0ECE1]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#64906B]" />
              <h2 className="font-serif-natural text-xl text-[#233527] font-semibold">
                Personalizza la Ricetta di Oggi
              </h2>
            </div>
            <p className="text-xs text-[#5C7260] mt-0.5">
              Definisci impegno e tempo: Gemini creerà una ricetta armonizzata al tuo piano alimentare.
            </p>
          </div>

          {dietPlan ? (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#F2F6F3] rounded-lg border border-[#D7E6DA] text-xs text-[#39533D]">
              <Leaf className="w-3.5 h-3.5 text-[#4A6B50]" />
              <span className="font-medium truncate max-w-[200px]">{dietPlan.title}</span>
            </div>
          ) : (
            <button
              onClick={onOpenDiet}
              className="text-xs text-[#4A6B50] font-medium hover:underline flex items-center gap-1"
            >
              + Carica il tuo PDF dieta
            </button>
          )}
        </div>

        {/* 1. Day of Week Selector */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#526856] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#4A6B50]" /> Giorno della Settimana
            </span>
            <span className="text-[11px] text-[#637966]">Oggi è {selectedDay}</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
            {DAYS_OF_WEEK.map((day) => {
              const isSelected = selectedDay === day;
              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(day)}
                  id={`day-select-${day}`}
                  className={`py-2 px-1 text-center rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-[#4A6B50] text-white shadow-xs font-semibold'
                      : 'bg-[#FAF8F5] text-[#3D5241] border border-[#EAE6DE] hover:bg-[#EAE6DE]'
                  }`}
                >
                  {day.slice(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Meal Type Selector */}
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#526856] block mb-2">
            Tipo di Pasto
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {MEAL_OPTIONS.map((meal) => {
              const isSelected = selectedMeal === meal.id;
              return (
                <button
                  key={meal.id}
                  onClick={() => setSelectedMeal(meal.id)}
                  id={`meal-select-${meal.id}`}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-medium transition-all border ${
                    isSelected
                      ? 'bg-[#E8EFE9] border-[#97B89D] text-[#243929] font-semibold'
                      : 'bg-[#FFFFFF] border-[#EAE6DE] text-[#47584A] hover:bg-[#FAF8F5]'
                  }`}
                >
                  <span>{meal.icon}</span>
                  <span>{meal.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Diet Scheduled Hint if available */}
        {currentScheduledItems && currentScheduledItems.length > 0 && (
          <div className="p-3 bg-[#F7F9F7] rounded-xl border border-[#DDE7DF] text-xs text-[#354D39] flex items-start gap-2">
            <span className="text-base leading-none">🥗</span>
            <div className="flex-1">
              <span className="font-semibold">Previsto nella dieta per {selectedDay} ({selectedMeal}):</span>{' '}
              <span className="text-[#4F6753]">{currentScheduledItems.join(', ')}</span>
            </div>
          </div>
        )}

        {/* 3. Impegno & Tempo a Disposizione */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Grado di Impegno */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#526856] flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-[#4A6B50]" /> Grado di Impegno
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setCommitmentLevel('easy')}
                id="effort-easy-btn"
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  commitmentLevel === 'easy'
                    ? 'bg-[#E8EFE9] border-[#97B89D] text-[#243929] shadow-xs'
                    : 'bg-[#FAF8F5] border-[#EAE6DE] text-[#4F6453] hover:bg-[#F2EFE9]'
                }`}
              >
                <div className="font-semibold text-xs text-[#243929]">Facile</div>
                <div className="text-[10px] text-[#637966] leading-tight mt-0.5">Una padella, zero stress</div>
              </button>

              <button
                type="button"
                onClick={() => setCommitmentLevel('medium')}
                id="effort-medium-btn"
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  commitmentLevel === 'medium'
                    ? 'bg-[#E8EFE9] border-[#97B89D] text-[#243929] shadow-xs'
                    : 'bg-[#FAF8F5] border-[#EAE6DE] text-[#4F6453] hover:bg-[#F2EFE9]'
                }`}
              >
                <div className="font-semibold text-xs text-[#243929]">Medio</div>
                <div className="text-[10px] text-[#637966] leading-tight mt-0.5">Cottura equilibrata</div>
              </button>

              <button
                type="button"
                onClick={() => setCommitmentLevel('elaborate')}
                id="effort-elaborate-btn"
                className={`p-2.5 rounded-xl text-left border transition-all ${
                  commitmentLevel === 'elaborate'
                    ? 'bg-[#E8EFE9] border-[#97B89D] text-[#243929] shadow-xs'
                    : 'bg-[#FAF8F5] border-[#EAE6DE] text-[#4F6453] hover:bg-[#F2EFE9]'
                }`}
              >
                <div className="font-semibold text-xs text-[#243929]">Elaborato</div>
                <div className="text-[10px] text-[#637966] leading-tight mt-0.5">Gourmet & sfumature</div>
              </button>
            </div>
          </div>

          {/* Tempo a Disposizione */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#526856] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#4A6B50]" /> Tempo a Disposizione
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { min: 15, label: '10-15 min', hint: 'Super rapido' },
                { min: 25, label: '20-25 min', hint: 'Ideale' },
                { min: 45, label: '35-45+ min', hint: 'Con calma' },
              ].map((t) => (
                <button
                  key={t.min}
                  type="button"
                  onClick={() => setAvailableMinutes(t.min)}
                  id={`time-${t.min}-btn`}
                  className={`p-2.5 rounded-xl text-left border transition-all ${
                    availableMinutes === t.min
                      ? 'bg-[#E8EFE9] border-[#97B89D] text-[#243929] shadow-xs'
                      : 'bg-[#FAF8F5] border-[#EAE6DE] text-[#4F6453] hover:bg-[#F2EFE9]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#243929]">{t.label}</div>
                  <div className="text-[10px] text-[#637966] leading-tight mt-0.5">{t.hint}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Fridge Integration Toggle & Optional Notes */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-[#F0ECE1]">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={usePantryIngredients}
              onChange={(e) => setUsePantryIngredients(e.target.checked)}
              className="w-4 h-4 rounded text-[#4A6B50] focus:ring-[#4A6B50] border-[#DDD9CD] accent-[#4A6B50]"
            />
            <span className="text-xs text-[#384E3C] font-medium flex items-center gap-1">
              <Refrigerator className="w-3.5 h-3.5 text-[#4A6B50]" />
              Valorizza ingredienti presenti in frigo/dispensa ({pantryItems.length} salvati)
            </span>
          </label>

          <button
            onClick={handleGenerateRecipe}
            disabled={isGenerating}
            id="generate-daily-recipe-btn"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#4A6B50] hover:bg-[#3D5A43] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Creazione ricetta personalizzata...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Proponi Nuova Ricetta</span>
              </>
            )}
          </button>
        </div>
      </section>

      {/* Main Recipe Card */}
      {currentRecipe && (
        <article className="bg-[#FFFFFF] border border-[#E6E2D8] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6 transition-all">
          {/* Top Bar: Tags, Time, Difficulty, Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EFECE4]">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#E8EFE9] text-[#345239] border border-[#D0DFD2]">
                {currentRecipe.mealType.toUpperCase()}
              </span>

              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF8F5] text-[#556958] border border-[#EAE6DE] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#4A6B50]" />
                {currentRecipe.totalTimeMinutes} min
              </span>

              <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FAF8F5] text-[#556958] border border-[#EAE6DE] capitalize">
                Impegno: {currentRecipe.commitmentLevel}
              </span>

              {currentRecipe.antiWasteSavedIngredients && currentRecipe.antiWasteSavedIngredients.length > 0 && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#FFF3E8] text-[#9E5218] border border-[#F5DCBE] flex items-center gap-1">
                  🌿 Salva-Spreco: {currentRecipe.antiWasteSavedIngredients.join(', ')}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => onToggleFavorite(currentRecipe)}
                id="fav-recipe-btn"
                className={`p-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-colors ${
                  isFav
                    ? 'bg-[#FBEBE8] border-[#F2C5BD] text-[#B83E2C]'
                    : 'bg-[#FAF8F5] border-[#EAE6DE] text-[#47584A] hover:bg-[#EAE6DE]'
                }`}
                title="Salva tra i preferiti"
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-current text-[#B83E2C]' : ''}`} />
                <span>{isFav ? 'Salvata' : 'Salva'}</span>
              </button>

              <button
                onClick={handleShare}
                id="share-recipe-btn"
                className="p-2 rounded-xl bg-[#FAF8F5] border border-[#EAE6DE] text-[#47584A] hover:bg-[#EAE6DE] text-xs font-medium flex items-center gap-1.5 transition-colors"
                title="Copia testo ricetta"
              >
                <Share2 className="w-4 h-4" />
                <span>{copyFeedback ? 'Copiata!' : 'Condividi'}</span>
              </button>
            </div>
          </div>

          {/* Title & Subtitle */}
          <div>
            <h1 className="font-serif-natural text-2xl sm:text-3xl font-bold text-[#1E2E21] leading-tight">
              {currentRecipe.title}
            </h1>
            <p className="text-sm sm:text-base text-[#576B5A] mt-1.5 leading-relaxed">
              {currentRecipe.subtitle}
            </p>
          </div>

          {/* Diet Plan Alignment Banner */}
          {currentRecipe.dietAlignmentNote && (
            <div className="p-4 rounded-xl bg-[#F4F7F4] border border-[#D6E3D8] text-xs sm:text-sm text-[#2D4532] flex items-start gap-3">
              <div className="w-6 h-6 rounded-md bg-[#E2EBE3] text-[#345239] flex items-center justify-center shrink-0 mt-0.5">
                <Leaf className="w-4 h-4" />
              </div>
              <div className="space-y-0.5">
                <span className="font-semibold block text-[#243929]">Allineamento al Piano Alimentare:</span>
                <p className="text-[#4B634F] leading-relaxed">{currentRecipe.dietAlignmentNote}</p>
              </div>
            </div>
          )}

          {/* Nutritional Highlights Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DE] text-center">
              <span className="text-[11px] text-[#6E8071] uppercase tracking-wider block font-medium">
                Calorie Stimate
              </span>
              <span className="text-lg font-bold text-[#233527] font-serif-natural">
                {currentRecipe.nutritionalInfo.estimatedCalories} <span className="text-xs font-normal">kcal</span>
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DE] text-center">
              <span className="text-[11px] text-[#6E8071] uppercase tracking-wider block font-medium">
                Proteine Nobili
              </span>
              <span className="text-lg font-bold text-[#2E5E3B] font-serif-natural">
                {currentRecipe.nutritionalInfo.proteinGrams}g
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DE] text-center">
              <span className="text-[11px] text-[#6E8071] uppercase tracking-wider block font-medium">
                Carboidrati
              </span>
              <span className="text-lg font-bold text-[#233527] font-serif-natural">
                {currentRecipe.nutritionalInfo.carbsGrams}g
              </span>
            </div>

            <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE6DE] text-center">
              <span className="text-[11px] text-[#6E8071] uppercase tracking-wider block font-medium">
                Grassi Buoni & Olio
              </span>
              <span className="text-lg font-bold text-[#233527] font-serif-natural">
                {currentRecipe.nutritionalInfo.fatGrams}g
              </span>
            </div>
          </div>

          {/* Ingredients & Prep Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
            {/* Ingredients Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-natural text-lg font-semibold text-[#233527] flex items-center gap-2">
                  <span>Ingredienti</span>
                  <span className="text-xs font-sans font-normal text-[#6E8071]">
                    ({currentRecipe.portions} porzione)
                  </span>
                </h3>
                <span className="text-[11px] text-[#6E8071]">Spunta durante la spesa</span>
              </div>

              <div className="space-y-2">
                {currentRecipe.ingredients.map((ing, idx) => {
                  const isChecked = completedIngredients[idx];
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl border transition-all flex items-start justify-between gap-2.5 group ${
                        isChecked
                          ? 'bg-[#F7F9F7] border-[#DCE6DE] opacity-60'
                          : 'bg-[#FFFFFF] border-[#EAE6DE] hover:border-[#98B89E]'
                      }`}
                    >
                      <div
                        onClick={() => toggleIngredient(idx)}
                        className="flex items-start gap-2.5 cursor-pointer flex-1"
                      >
                        <button
                          type="button"
                          className="mt-0.5 text-[#4A6B50] shrink-0"
                          id={`check-ing-${idx}`}
                        >
                          {isChecked ? (
                            <CheckCircle2 className="w-4 h-4 text-[#4A6B50]" />
                          ) : (
                            <Circle className="w-4 h-4 text-[#B5C4B7]" />
                          )}
                        </button>
                        <div className="text-xs">
                          <span
                            className={`font-medium text-[#233527] block ${
                              isChecked ? 'line-through text-[#6F8072]' : ''
                            }`}
                          >
                            {ing.name}
                          </span>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[#4A6B50] font-semibold">{ing.amount}</span>
                            {ing.isDietApproved && (
                              <span className="text-[10px] bg-[#E8EFE9] text-[#2F4E34] px-1.5 py-0.2 rounded">
                                {ing.dietCategory || 'In Dieta'}
                              </span>
                            )}
                            {ing.isFromPantryOrFridge && (
                              <span className="text-[10px] bg-[#FFF2E0] text-[#8C5216] px-1.5 py-0.2 rounded">
                                Nel tuo frigo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Replace button */}
                      <button
                        onClick={() => setIngredientToSubstitute(ing.name)}
                        className="opacity-60 group-hover:opacity-100 text-[11px] text-[#4A6B50] hover:underline p-1 shrink-0"
                        title="Non hai questo ingrediente? Trova un'alternativa conforme alla dieta"
                      >
                        Sostituisci
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Preparation Steps Column (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-serif-natural text-lg font-semibold text-[#233527]">
                  Preparazione Passo-Passo
                </h3>
                <span className="text-[11px] text-[#6E8071]">
                  {Object.values(completedSteps).filter(Boolean).length} di {currentRecipe.steps.length} completati
                </span>
              </div>

              <div className="space-y-3">
                {currentRecipe.steps.map((step, idx) => {
                  const isDone = completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleStep(idx)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3.5 ${
                        isDone
                          ? 'bg-[#F8FAF8] border-[#DDE6DF] opacity-60'
                          : 'bg-[#FFFFFF] border-[#EAE6DE] hover:border-[#98B89E] hover:bg-[#FAFBF9]'
                      }`}
                      id={`step-card-${idx}`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 mt-0.5 transition-colors ${
                          isDone
                            ? 'bg-[#4A6B50] text-white'
                            : 'bg-[#E8EFE9] text-[#37523C]'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>
                      <p
                        className={`text-xs sm:text-sm text-[#2A3B2E] leading-relaxed flex-1 ${
                          isDone ? 'line-through text-[#6F8072]' : ''
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Chef's Natural Tip */}
              {currentRecipe.chefTip && (
                <div className="p-4 rounded-xl bg-[#FAF6EE] border border-[#E8DFCC] text-xs sm:text-sm text-[#4E412A] flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-[#EFE4CF] text-[#78591E] flex items-center justify-center shrink-0 mt-0.5">
                    <ChefHat className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-semibold block text-[#463920]">Il tocco naturale dello Chef:</span>
                    <p className="text-[#63553C] leading-relaxed mt-0.5">{currentRecipe.chefTip}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </article>
      )}

      {/* Ingredient Substitution Modal */}
      {ingredientToSubstitute && (
        <SubstitutionModal
          ingredientName={ingredientToSubstitute}
          isOpen={!!ingredientToSubstitute}
          onClose={() => setIngredientToSubstitute(null)}
          dietPlan={dietPlan}
          pantryItems={pantryItems}
          onApplySubstitution={(newIng) => {
            // Update recipe ingredient in-place
            if (currentRecipe) {
              const updatedIngredients = currentRecipe.ingredients.map((ing) =>
                ing.name === ingredientToSubstitute
                  ? { ...ing, name: newIng, isDietApproved: true }
                  : ing
              );
              setCurrentRecipe({ ...currentRecipe, ingredients: updatedIngredients });
            }
          }}
        />
      )}
    </div>
  );
};
