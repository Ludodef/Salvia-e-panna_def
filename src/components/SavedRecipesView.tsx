import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  Clock,
  Heart,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Share2,
  ArrowRight,
  Flame,
  Search
} from 'lucide-react';
import { PantryItem, Recipe } from '../types';

interface SavedRecipesViewProps {
  savedRecipes: Recipe[];
  onRemoveRecipe: (recipeId: string) => void;
  onSelectRecipeForCooking: (recipe: Recipe) => void;
  pantryItems: PantryItem[];
}

export const SavedRecipesView: React.FC<SavedRecipesViewProps> = ({
  savedRecipes,
  onRemoveRecipe,
  onSelectRecipeForCooking,
  pantryItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMealFilter, setActiveMealFilter] = useState<string>('all');
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [checkedShoppingItems, setCheckedShoppingItems] = useState<Record<string, boolean>>({});

  const filteredRecipes = savedRecipes.filter((recipe) => {
    const matchesMeal = activeMealFilter === 'all' || recipe.mealType.toLowerCase() === activeMealFilter.toLowerCase();
    const matchesSearch =
      recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      recipe.ingredients.some((ing) => ing.name.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesMeal && matchesSearch;
  });

  // Calculate missing shopping list items across all saved recipes
  const shoppingListItems: { name: string; amount: string; forRecipe: string }[] = [];
  savedRecipes.forEach((recipe) => {
    recipe.ingredients.forEach((ing) => {
      const alreadyInPantry = pantryItems.some(
        (p) => p.name.toLowerCase().includes(ing.name.toLowerCase()) || ing.name.toLowerCase().includes(p.name.toLowerCase())
      );
      if (!alreadyInPantry) {
        shoppingListItems.push({
          name: ing.name,
          amount: ing.amount,
          forRecipe: recipe.title,
        });
      }
    });
  });

  const toggleShoppingItem = (itemKey: string) => {
    setCheckedShoppingItems((prev) => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header and Controls */}
      <div className="bg-[#FFFFFF] border border-[#E8E5DD] rounded-2xl p-6 sm:p-8 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#F0ECE1]">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8EFE9] text-[#345239] text-xs font-semibold">
              <Bookmark className="w-3.5 h-3.5" />
              <span>Ricettario Personale</span>
            </div>
            <h1 className="font-serif-natural text-2xl sm:text-3xl text-[#233527] font-semibold mt-1">
              Ricette Salvate & Lista della Spesa
            </h1>
            <p className="text-xs sm:text-sm text-[#5C7260] mt-0.5">
              Conserva le tue creazioni preferite approvate dalla dieta e genera automaticamente la spesa.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowShoppingList(!showShoppingList)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                showShoppingList
                  ? 'bg-[#4A6B50] text-white border-[#4A6B50]'
                  : 'bg-[#FAF8F5] text-[#3D5241] border-[#EAE6DE] hover:bg-[#EAE6DE]'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Lista della Spesa ({shoppingListItems.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Filter bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#8AA28F] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cerca per titolo o ingrediente..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-[#DDD9CD] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#4A6B50]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
            {['all', 'pranzo', 'cena', 'colazione', 'spuntino'].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setActiveMealFilter(m)}
                className={`px-3 py-1.5 rounded-xl capitalize font-medium transition-all ${
                  activeMealFilter === m
                    ? 'bg-[#4A6B50] text-white'
                    : 'bg-[#FAF8F5] text-[#556958] border border-[#EAE6DE] hover:bg-[#EAE6DE]'
                }`}
              >
                {m === 'all' ? 'Tutti i pasti' : m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Shopping List Drawer / View */}
      {showShoppingList && (
        <section className="bg-[#FAF8F5] border border-[#DDD9CD] rounded-2xl p-6 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E5DD]">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#4A6B50]" />
              <h2 className="font-serif-natural text-xl text-[#233527] font-semibold">
                Lista della Spesa Intelligente
              </h2>
            </div>
            <span className="text-xs text-[#5C7260]">
              Ingredienti necessari non ancora presenti in frigo/dispensa
            </span>
          </div>

          {shoppingListItems.length === 0 ? (
            <p className="text-center py-6 text-xs text-[#637966]">
              Tutti gli ingredienti delle tue ricette salvate sono già disponibili in frigo o dispensa!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {shoppingListItems.map((item, idx) => {
                const key = `${item.name}-${idx}`;
                const isChecked = checkedShoppingItems[key];
                return (
                  <div
                    key={key}
                    onClick={() => toggleShoppingItem(key)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                      isChecked
                        ? 'bg-[#E8EFE9] border-[#B5D0B9] opacity-60'
                        : 'bg-white border-[#EAE6DE] hover:border-[#98B89E]'
                    }`}
                  >
                    <button type="button" className="mt-0.5 text-[#4A6B50] shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-4 h-4 text-[#4A6B50]" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#B4C4B7]" />
                      )}
                    </button>
                    <div className="text-xs">
                      <span className={`font-semibold text-[#233527] block ${isChecked ? 'line-through' : ''}`}>
                        {item.name}
                      </span>
                      <span className="text-[#4A6B50] font-medium block mt-0.5">{item.amount}</span>
                      <span className="text-[10px] text-[#6E8071] block mt-0.5 italic truncate">
                        Per: {item.forRecipe}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Grid of Saved Recipes */}
      {filteredRecipes.length === 0 ? (
        <div className="bg-white border border-[#E8E5DD] rounded-2xl p-12 text-center space-y-3">
          <Bookmark className="w-10 h-10 text-[#C1D2C4] mx-auto" />
          <h3 className="font-serif-natural text-lg font-semibold text-[#233527]">
            Nessuna ricetta salvata al momento
          </h3>
          <p className="text-xs text-[#637966] max-w-sm mx-auto">
            Quando trovi una ricetta del giorno o una proposta svuotafrigo che ti piace,
            premi sul cuore per conservarla qui.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredRecipes.map((recipe) => (
            <article
              key={recipe.id}
              className="bg-white border border-[#E6E2D8] rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col justify-between space-y-4 hover:border-[#98B89E] transition-all"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#E8EFE9] text-[#2F4E34] uppercase">
                    {recipe.mealType}
                  </span>

                  <div className="flex items-center gap-1">
                    <span className="text-xs text-[#637966] flex items-center gap-1 mr-2">
                      <Clock className="w-3 h-3 text-[#4A6B50]" />
                      {recipe.totalTimeMinutes} min
                    </span>

                    <button
                      onClick={() => onRemoveRecipe(recipe.id)}
                      className="text-[#A5B8A8] hover:text-[#B83E2C] p-1 transition-colors"
                      title="Rimuovi dai preferiti"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="font-serif-natural text-lg font-bold text-[#1F2F22]">
                    {recipe.title}
                  </h3>
                  <p className="text-xs text-[#576B5A] mt-1 line-clamp-2 leading-relaxed">
                    {recipe.subtitle}
                  </p>
                </div>

                {/* Macro pill summary */}
                <div className="flex items-center gap-3 text-xs text-[#4F6453] bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EAE6DE]">
                  <span><strong>{recipe.nutritionalInfo.estimatedCalories}</strong> kcal</span>
                  <span>•</span>
                  <span><strong>{recipe.nutritionalInfo.proteinGrams}g</strong> proteine</span>
                  <span>•</span>
                  <span><strong>{recipe.nutritionalInfo.carbsGrams}g</strong> carbo</span>
                </div>

                {/* Key ingredients */}
                <div className="text-xs text-[#526856]">
                  <span className="font-semibold block mb-1">Ingredienti:</span>
                  <p className="line-clamp-2 text-[#637966]">
                    {recipe.ingredients.map((i) => `${i.name} (${i.amount})`).join(', ')}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-[#F0ECE1] flex items-center justify-end">
                <button
                  onClick={() => onSelectRecipeForCooking(recipe)}
                  className="px-4 py-2 bg-[#4A6B50] hover:bg-[#3D5A43] text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <span>Cucina ora</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
