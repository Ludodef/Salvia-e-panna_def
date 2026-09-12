import React, { useState } from 'react';
import {
  Refrigerator,
  Sparkles,
  Clock,
  AlertTriangle,
  Plus,
  Trash2,
  CheckCircle2,
  Leaf,
  Timer,
  ChefHat,
  ArrowRight,
  Heart,
  HelpCircle,
  Package,
  Layers
} from 'lucide-react';
import { CommitmentLevel, DietPlan, PantryItem, Recipe } from '../types';

interface PantryWasteViewProps {
  pantryItems: PantryItem[];
  setPantryItems: (items: PantryItem[]) => void;
  dietPlan: DietPlan | null;
  savedRecipes: Recipe[];
  onToggleFavorite: (recipe: Recipe) => void;
  onSelectRecipeForCooking: (recipe: Recipe) => void;
}

const COMMON_SUGGESTIONS = {
  frigo: [
    'Zucchine',
    'Ricotta fresca',
    'Petto di pollo',
    'Uova bio',
    'Pomodorini',
    'Spinaci freschi',
    'Finocchi',
    'Salvia fresca',
    'Parmigiano',
    'Carote',
    'Filetto di merluzzo',
    'Yogurt greco'
  ],
  dispensa: [
    'Pasta integrale',
    'Ceci in vetro',
    'Riso basmati',
    'Lenticchie cotte',
    'Quinoa',
    'Avena',
    'Olio EVO',
    'Mandorle'
  ]
};

export const PantryWasteView: React.FC<PantryWasteViewProps> = ({
  pantryItems,
  setPantryItems,
  dietPlan,
  savedRecipes,
  onToggleFavorite,
  onSelectRecipeForCooking,
}) => {
  const [activeCategory, setActiveCategory] = useState<'tutti' | 'frigo' | 'dispensa'>('tutti');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<'frigo' | 'dispensa'>('frigo');
  const [newItemQuantity, setNewItemQuantity] = useState('');
  const [newItemIsExpiring, setNewItemIsExpiring] = useState(false);

  // Anti-waste generator options
  const [targetMinutes, setTargetMinutes] = useState<number>(15);
  const [effort, setEffort] = useState<CommitmentLevel>('easy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [antiWasteRecipes, setAntiWasteRecipes] = useState<Recipe[]>([]);
  const [lastGeneratedAt, setLastGeneratedAt] = useState<string | null>(null);

  const expiringCount = pantryItems.filter((i) => i.isExpiringSoon).length;

  const handleAddItem = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newItemName.trim()) return;

    const item: PantryItem = {
      id: 'pantry-' + Date.now(),
      name: newItemName.trim(),
      category: newItemCategory,
      quantity: newItemQuantity.trim() || undefined,
      isExpiringSoon: newItemIsExpiring,
      addedAt: 'Oggi',
    };

    setPantryItems([item, ...pantryItems]);
    setNewItemName('');
    setNewItemQuantity('');
    setNewItemIsExpiring(false);
  };

  const handleAddQuickSuggestion = (name: string, category: 'frigo' | 'dispensa') => {
    // Check if already exists
    if (pantryItems.some((i) => i.name.toLowerCase() === name.toLowerCase())) {
      return;
    }
    const item: PantryItem = {
      id: 'pantry-' + Date.now(),
      name,
      category,
      quantity: '1 porzione',
      isExpiringSoon: category === 'frigo', // default fresh fridge to attention
      addedAt: 'Oggi',
    };
    setPantryItems([item, ...pantryItems]);
  };

  const handleToggleExpiring = (id: string) => {
    setPantryItems(
      pantryItems.map((item) =>
        item.id === id ? { ...item, isExpiringSoon: !item.isExpiringSoon } : item
      )
    );
  };

  const handleRemoveItem = (id: string) => {
    setPantryItems(pantryItems.filter((item) => item.id !== id));
  };

  const handleGenerateAntiWaste = async () => {
    if (pantryItems.length === 0) {
      alert("Inserisci almeno un ingrediente disponibile in casa prima di generare!");
      return;
    }

    setIsGenerating(true);
    try {
      const res = await fetch('/api/recipes/anti-waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fridgeAndPantryItems: pantryItems,
          availableMinutes: targetMinutes,
          commitmentLevel: effort,
          dietPlan,
        }),
      });

      const data = await res.json();
      if (data.success && data.recipes) {
        setAntiWasteRecipes(data.recipes);
        setLastGeneratedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } else {
        alert("Errore nella proposta ricette: " + (data.error || "Riprova tra poco."));
      }
    } catch (err: any) {
      console.error(err);
      alert("Errore di connessione: " + err?.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredItems = pantryItems.filter((item) => {
    if (activeCategory === 'tutti') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header section */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DD] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#F0ECE1]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF2DE] text-[#915B17] text-xs font-semibold border border-[#FDE1B8]">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Zero Sprechi in Cucina</span>
            </div>
            <h1 className="font-serif-natural text-2xl sm:text-3xl text-[#233527] font-semibold">
              Svuotafrigo & Dispensa Intelligente
            </h1>
            <p className="text-xs sm:text-sm text-[#5C7260] max-w-2xl leading-relaxed">
              Registra quello che hai aperto nel frigorifero o negli scaffali. L'AI combinerà
              gli ingredienti in scadenza per crearti ricette lampo buone, nutrienti e salva-spesa.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE6DE] text-center shrink-0">
              <span className="text-[10px] uppercase font-semibold text-[#6E8071] block">
                Totale Alimenti
              </span>
              <span className="text-xl font-bold text-[#233527] font-serif-natural">
                {pantryItems.length}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#FFF5F2] border border-[#F8D2CA] text-center shrink-0">
              <span className="text-[10px] uppercase font-semibold text-[#B83E2C] block">
                In Scadenza
              </span>
              <span className="text-xl font-bold text-[#B83E2C] font-serif-natural">
                {expiringCount}
              </span>
            </div>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#526856] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#4A6B50]" />
              Suggeritore Piatti Veloci Antispreco
            </h3>
            {dietPlan && (
              <span className="text-[11px] text-[#4A6B50] font-medium flex items-center gap-1">
                <Leaf className="w-3 h-3" /> Conforme a: {dietPlan.title}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#526856]">Tempo Massimo</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[10, 15, 20].map((mins) => (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => setTargetMinutes(mins)}
                    className={`py-2 text-xs rounded-xl border text-center transition-all ${
                      targetMinutes === mins
                        ? 'bg-[#E8EFE9] border-[#97B89D] text-[#243929] font-bold shadow-xs'
                        : 'bg-[#FAF8F5] border-[#EAE6DE] text-[#4F6453] hover:bg-[#F2EFE9]'
                    }`}
                  >
                    {mins} min
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-[#526856]">Stile di Preparazione</label>
              <div className="grid grid-cols-2 gap-1.5">
                <button
                  type="button"
                  onClick={() => setEffort('easy')}
                  className={`py-2 text-xs rounded-xl border text-center transition-all ${
                    effort === 'easy'
                      ? 'bg-[#E8EFE9] border-[#97B89D] text-[#243929] font-bold shadow-xs'
                      : 'bg-[#FAF8F5] border-[#EAE6DE] text-[#4F6453] hover:bg-[#F2EFE9]'
                  }`}
                >
                  ⚡ Una Padella
                </button>
                <button
                  type="button"
                  onClick={() => setEffort('medium')}
                  className={`py-2 text-xs rounded-xl border text-center transition-all ${
                    effort === 'medium'
                      ? 'bg-[#E8EFE9] border-[#97B89D] text-[#243929] font-bold shadow-xs'
                      : 'bg-[#FAF8F5] border-[#EAE6DE] text-[#4F6453] hover:bg-[#F2EFE9]'
                  }`}
                >
                  🥗 Piatto Ricco
                </button>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleGenerateAntiWaste}
                disabled={isGenerating || pantryItems.length === 0}
                id="generate-antiwaste-btn"
                className="w-full py-2.5 px-4 rounded-xl bg-[#4A6B50] hover:bg-[#3D5A43] text-white font-semibold text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin" />
                    <span>Cerco combinazioni...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Crea Piatti Antispreco</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Generated Anti-Waste Recipe Suggestions */}
      {antiWasteRecipes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif-natural text-xl text-[#233527] font-semibold flex items-center gap-2">
              <span>🌿 Piatti Rapidi Proposti con il tuo Frigo</span>
              {lastGeneratedAt && (
                <span className="text-xs font-sans font-normal text-[#6E8071]">
                  (Generati alle {lastGeneratedAt})
                </span>
              )}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {antiWasteRecipes.map((recipe) => {
              const isFav = savedRecipes.some((r) => r.title === recipe.title);
              return (
                <article
                  key={recipe.id}
                  className="bg-[#FFFFFF] border border-[#E5E1D7] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#98B89E] transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8EFE9] text-[#2F4E34]">
                        ⏱️ Pronta in {recipe.totalTimeMinutes} min
                      </span>

                      <button
                        onClick={() => onToggleFavorite(recipe)}
                        className="text-[#637966] hover:text-[#B83E2C] transition-colors p-1"
                        title="Salva tra i preferiti"
                      >
                        <Heart className={`w-4 h-4 ${isFav ? 'fill-current text-[#B83E2C]' : ''}`} />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-serif-natural text-lg font-bold text-[#1F2F22]">
                        {recipe.title}
                      </h3>
                      <p className="text-xs text-[#576B5A] mt-1 leading-relaxed">
                        {recipe.subtitle}
                      </p>
                    </div>

                    {/* Rescued Ingredients Badges */}
                    {recipe.antiWasteSavedIngredients && recipe.antiWasteSavedIngredients.length > 0 && (
                      <div className="p-2.5 rounded-xl bg-[#FFF8EE] border border-[#F7E2C6] text-xs space-y-1">
                        <span className="font-semibold text-[#8C5216] block text-[11px]">
                          ♻️ Ingredienti recuperati dal tuo frigo:
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {recipe.antiWasteSavedIngredients.map((saved, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#FFE4C4] text-[#7A3F09] text-[10px] font-medium"
                            >
                              {saved}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quick Steps Preview */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[11px] font-semibold text-[#526856] block">
                        Preparazione Lampo:
                      </span>
                      <ol className="space-y-1 text-xs text-[#3D5241]">
                        {recipe.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-semibold text-[#4A6B50]">{idx + 1}.</span>
                            <span className="leading-snug">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>

                  {/* Bottom bar & Action */}
                  <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-between gap-2">
                    <div className="text-xs text-[#637966]">
                      <span className="font-semibold text-[#233527]">
                        {recipe.nutritionalInfo?.estimatedCalories || 300}
                      </span>{' '}
                      kcal • {recipe.nutritionalInfo?.proteinGrams || 25}g proteine
                    </div>

                    <button
                      onClick={() => onSelectRecipeForCooking(recipe)}
                      className="px-3 py-1.5 bg-[#4A6B50] hover:bg-[#3D5A43] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <span>Cucina questa</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* Inventory & Quick Add Section */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DD] rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0ECE1]">
          <h2 className="font-serif-natural text-xl text-[#233527] font-semibold flex items-center gap-2">
            <Package className="w-5 h-5 text-[#4A6B50]" />
            <span>Inventario Frigo & Dispensa</span>
          </h2>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl border border-[#EAE6DE] text-xs">
            <button
              type="button"
              onClick={() => setActiveCategory('tutti')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeCategory === 'tutti'
                  ? 'bg-white text-[#233527] shadow-xs'
                  : 'text-[#637966] hover:text-[#233527]'
              }`}
            >
              Tutti ({pantryItems.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('frigo')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeCategory === 'frigo'
                  ? 'bg-white text-[#233527] shadow-xs'
                  : 'text-[#637966] hover:text-[#233527]'
              }`}
            >
              Frigo ({pantryItems.filter((i) => i.category === 'frigo').length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategory('dispensa')}
              className={`px-3 py-1 rounded-lg font-medium transition-all ${
                activeCategory === 'dispensa'
                  ? 'bg-white text-[#233527] shadow-xs'
                  : 'text-[#637966] hover:text-[#233527]'
              }`}
            >
              Dispensa ({pantryItems.filter((i) => i.category === 'dispensa').length})
            </button>
          </div>
        </div>

        {/* Form to Add New Food */}
        <form onSubmit={handleAddItem} className="space-y-3 p-4 bg-[#FAF8F5] rounded-xl border border-[#EAE6DE]">
          <span className="text-xs font-semibold text-[#384E3C] block">
            + Aggiungi un alimento che hai in casa
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
            <div className="sm:col-span-5">
              <input
                type="text"
                placeholder="Nome alimento (es. Zucchine, Ricotta, Salmone...)"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                id="food-name-input"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD9CD] bg-white text-[#233527] focus:outline-none focus:ring-1 focus:ring-[#4A6B50]"
              />
            </div>

            <div className="sm:col-span-3">
              <input
                type="text"
                placeholder="Quantità (es. 2 pezzi, 150g)"
                value={newItemQuantity}
                onChange={(e) => setNewItemQuantity(e.target.value)}
                id="food-qty-input"
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD9CD] bg-white text-[#233527] focus:outline-none focus:ring-1 focus:ring-[#4A6B50]"
              />
            </div>

            <div className="sm:col-span-2">
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value as 'frigo' | 'dispensa')}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#DDD9CD] bg-white text-[#233527] focus:outline-none focus:ring-1 focus:ring-[#4A6B50]"
              >
                <option value="frigo">Frigo</option>
                <option value="dispensa">Dispensa</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                id="submit-food-btn"
                className="w-full py-2 px-3 bg-[#4A6B50] hover:bg-[#3D5A43] text-white text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-1 shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Aggiungi</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-[#B83E2C] font-medium">
              <input
                type="checkbox"
                checked={newItemIsExpiring}
                onChange={(e) => setNewItemIsExpiring(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#B83E2C] focus:ring-[#B83E2C] border-[#DDD9CD] accent-[#B83E2C]"
              />
              <span>Segna come "In scadenza / Da finire subito"</span>
            </label>
          </div>
        </form>

        {/* Quick Add Chips */}
        <div className="space-y-2">
          <span className="text-[11px] font-semibold text-[#637966] uppercase tracking-wider block">
            Aggiunta rapida con 1 click:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COMMON_SUGGESTIONS.frigo.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleAddQuickSuggestion(item, 'frigo')}
                className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#E8EFE9] border border-[#EAE6DE] text-xs text-[#384E3C] transition-colors flex items-center gap-1"
              >
                <span>+</span>
                <span>{item}</span>
              </button>
            ))}
            {COMMON_SUGGESTIONS.dispensa.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => handleAddQuickSuggestion(item, 'dispensa')}
                className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] hover:bg-[#EAE6DE] border border-[#EAE6DE] text-xs text-[#384E3C] transition-colors flex items-center gap-1"
              >
                <span>+</span>
                <span>{item}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Items List */}
        <div className="space-y-2 pt-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#526856] block">
            Alimenti Attuali ({filteredItems.length})
          </span>

          {filteredItems.length === 0 ? (
            <div className="p-8 text-center bg-[#FAF8F5] rounded-xl border border-[#EAE6DE] text-xs text-[#6E8071]">
              Nessun alimento in questa categoria. Aggiungine uno con il form o con i suggerimenti veloci!
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                    item.isExpiringSoon
                      ? 'bg-[#FFF9F7] border-[#F5C7BE]'
                      : 'bg-[#FFFFFF] border-[#EAE6DE] hover:border-[#B5CCB9]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <button
                      type="button"
                      onClick={() => handleToggleExpiring(item.id)}
                      title={item.isExpiringSoon ? 'In scadenza! Clicca per togliere avviso' : 'Clicca per segnare in scadenza'}
                      className={`w-3 h-3 rounded-full shrink-0 transition-transform hover:scale-125 ${
                        item.isExpiringSoon ? 'bg-[#E85D4A] animate-pulse' : 'bg-[#C1D2C4]'
                      }`}
                    />

                    <div className="truncate">
                      <span className="font-medium text-xs text-[#233527] block truncate">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-1.5 text-[10px] text-[#6E8071]">
                        <span>{item.category}</span>
                        {item.quantity && <span>• {item.quantity}</span>}
                        {item.isExpiringSoon && (
                          <span className="text-[#B83E2C] font-semibold">
                            • In scadenza!
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(item.id)}
                    className="text-[#96A899] hover:text-[#B83E2C] p-1 transition-colors shrink-0"
                    title="Rimuovi alimento"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
