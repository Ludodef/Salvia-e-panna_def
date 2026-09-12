import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DailyRecipeView } from './components/DailyRecipeView';
import { DietUploadView } from './components/DietUploadView';
import { PantryWasteView } from './components/PantryWasteView';
import { SavedRecipesView } from './components/SavedRecipesView';
import {
  DietPlan,
  PantryItem,
  Recipe,
} from './types';
import {
  SAMPLE_MEDITERRANEAN_DIET,
  INITIAL_PANTRY_ITEMS,
  INITIAL_FEATURED_RECIPE,
} from './data/sampleDiets';
import { Leaf, Heart, Sparkles } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'daily' | 'diet' | 'pantry' | 'saved'>('daily');

  // 1. Diet Plan State with LocalStorage
  const [dietPlan, setDietPlan] = useState<DietPlan | null>(() => {
    try {
      const saved = localStorage.getItem('salvia_diet_plan');
      return saved ? JSON.parse(saved) : SAMPLE_MEDITERRANEAN_DIET;
    } catch {
      return SAMPLE_MEDITERRANEAN_DIET;
    }
  });

  useEffect(() => {
    try {
      if (dietPlan) {
        localStorage.setItem('salvia_diet_plan', JSON.stringify(dietPlan));
      }
    } catch (e) {
      console.error(e);
    }
  }, [dietPlan]);

  // 2. Pantry & Fridge Items State with LocalStorage
  const [pantryItems, setPantryItems] = useState<PantryItem[]>(() => {
    try {
      const saved = localStorage.getItem('salvia_pantry_items');
      return saved ? JSON.parse(saved) : INITIAL_PANTRY_ITEMS;
    } catch {
      return INITIAL_PANTRY_ITEMS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('salvia_pantry_items', JSON.stringify(pantryItems));
    } catch (e) {
      console.error(e);
    }
  }, [pantryItems]);

  // 3. Current Featured Daily Recipe
  const [currentRecipe, setCurrentRecipe] = useState<Recipe | null>(() => {
    try {
      const saved = localStorage.getItem('salvia_current_recipe');
      return saved ? JSON.parse(saved) : INITIAL_FEATURED_RECIPE;
    } catch {
      return INITIAL_FEATURED_RECIPE;
    }
  });

  useEffect(() => {
    try {
      if (currentRecipe) {
        localStorage.setItem('salvia_current_recipe', JSON.stringify(currentRecipe));
      }
    } catch (e) {
      console.error(e);
    }
  }, [currentRecipe]);

  // 4. Saved Favorite Recipes
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>(() => {
    try {
      const saved = localStorage.getItem('salvia_saved_recipes');
      return saved ? JSON.parse(saved) : [INITIAL_FEATURED_RECIPE];
    } catch {
      return [INITIAL_FEATURED_RECIPE];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('salvia_saved_recipes', JSON.stringify(savedRecipes));
    } catch (e) {
      console.error(e);
    }
  }, [savedRecipes]);

  const handleToggleFavorite = (recipe: Recipe) => {
    setSavedRecipes((prev) => {
      const exists = prev.some((r) => r.title === recipe.title);
      if (exists) {
        return prev.filter((r) => r.title !== recipe.title);
      } else {
        return [{ ...recipe, isFavorite: true }, ...prev];
      }
    });
  };

  const handleRemoveSavedRecipe = (recipeId: string) => {
    setSavedRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  const handleSelectRecipeForCooking = (recipe: Recipe) => {
    setCurrentRecipe(recipe);
    setActiveTab('daily');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2C3E30] flex flex-col font-sans selection:bg-[#849B87]/20 selection:text-[#2C3E30]">
      {/* Top Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dietPlan={dietPlan}
        pantryItems={pantryItems}
        savedRecipes={savedRecipes}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 pt-6 pb-16">
        {activeTab === 'daily' && (
          <DailyRecipeView
            currentRecipe={currentRecipe}
            setCurrentRecipe={setCurrentRecipe}
            dietPlan={dietPlan}
            pantryItems={pantryItems}
            savedRecipes={savedRecipes}
            onToggleFavorite={handleToggleFavorite}
            onOpenPantry={() => setActiveTab('pantry')}
            onOpenDiet={() => setActiveTab('diet')}
          />
        )}

        {activeTab === 'diet' && (
          <DietUploadView
            dietPlan={dietPlan}
            setDietPlan={setDietPlan}
            onNavigateToDaily={() => setActiveTab('daily')}
          />
        )}

        {activeTab === 'pantry' && (
          <PantryWasteView
            pantryItems={pantryItems}
            setPantryItems={setPantryItems}
            dietPlan={dietPlan}
            savedRecipes={savedRecipes}
            onToggleFavorite={handleToggleFavorite}
            onSelectRecipeForCooking={handleSelectRecipeForCooking}
          />
        )}

        {activeTab === 'saved' && (
          <SavedRecipesView
            savedRecipes={savedRecipes}
            onRemoveRecipe={handleRemoveSavedRecipe}
            onSelectRecipeForCooking={handleSelectRecipeForCooking}
            pantryItems={pantryItems}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E8E5DD] bg-[#FAF8F5] py-6 text-center text-xs text-[#637966]">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[#4A6B50]">
            <Leaf className="w-4 h-4" />
            <span className="font-semibold font-serif-natural">Salvia & Panna</span>
            <span>— Cucina naturale, sana e antispreco</span>
          </div>
          <div className="text-[11px] text-[#788C7B]">
            Ricette armonizzate con il tuo piano alimentare e gli alimenti che hai in casa.
          </div>
        </div>
      </footer>
    </div>
  );
}
