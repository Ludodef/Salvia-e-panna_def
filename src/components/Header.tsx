import React from 'react';
import { Leaf, BookOpen, Utensils, Refrigerator, Bookmark, FileText } from 'lucide-react';
import { DietPlan, PantryItem, Recipe } from '../types';

interface HeaderProps {
  activeTab: 'daily' | 'diet' | 'pantry' | 'saved';
  setActiveTab: (tab: 'daily' | 'diet' | 'pantry' | 'saved') => void;
  dietPlan: DietPlan | null;
  pantryItems: PantryItem[];
  savedRecipes: Recipe[];
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  dietPlan,
  pantryItems,
  savedRecipes,
}) => {
  const expiringCount = pantryItems.filter((i) => i.isExpiringSoon).length;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/90 backdrop-blur-md border-b border-[#E8E5DD] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between py-3.5 gap-3">
          {/* Brand & Active Diet Indicator */}
          <div className="flex items-center justify-between">
            <div
              onClick={() => setActiveTab('daily')}
              className="flex items-center gap-2.5 cursor-pointer group"
              id="brand-logo-btn"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E8EFE9] text-[#4A6B50] flex items-center justify-center shadow-xs group-hover:bg-[#D7E4D9] transition-colors border border-[#D3E1D5]">
                <Leaf className="w-5 h-5 text-[#4A6B50]" />
              </div>
              <div>
                <span className="text-xl font-semibold tracking-tight text-[#233527] font-serif-natural">
                  Salvia & Panna
                </span>
                <span className="block text-[11px] text-[#637966] font-medium -mt-1 tracking-wide">
                  Piano Dieta & Ricette Antispreco
                </span>
              </div>
            </div>

            {/* Quick mobile badges */}
            <div className="flex md:hidden items-center gap-2 text-xs">
              {expiringCount > 0 && (
                <button
                  onClick={() => setActiveTab('pantry')}
                  className="px-2 py-1 bg-[#FDE8E4] text-[#B84232] rounded-full font-medium text-[11px] flex items-center gap-1 border border-[#F8C8C0]"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#B84232] animate-pulse" />
                  {expiringCount} in scadenza
                </button>
              )}
            </div>
          </div>

          {/* Navigation Categories */}
          <nav className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none" id="main-nav-bar">
            <button
              id="nav-tab-daily"
              onClick={() => setActiveTab('daily')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'daily'
                  ? 'bg-[#4A6B50] text-[#FFFFFF] shadow-sm'
                  : 'text-[#47584A] hover:bg-[#EAE6DE] hover:text-[#233527]'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>Ricetta del Giorno</span>
            </button>

            <button
              id="nav-tab-diet"
              onClick={() => setActiveTab('diet')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'diet'
                  ? 'bg-[#4A6B50] text-[#FFFFFF] shadow-sm'
                  : 'text-[#47584A] hover:bg-[#EAE6DE] hover:text-[#233527]'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Piano Dieta</span>
              {dietPlan && (
                <span className="w-2 h-2 rounded-full bg-[#82B98E] ml-0.5" title="Dieta caricata" />
              )}
            </button>

            <button
              id="nav-tab-pantry"
              onClick={() => setActiveTab('pantry')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'pantry'
                  ? 'bg-[#4A6B50] text-[#FFFFFF] shadow-sm'
                  : 'text-[#47584A] hover:bg-[#EAE6DE] hover:text-[#233527]'
              }`}
            >
              <Refrigerator className="w-4 h-4" />
              <span>Svuotafrigo & Dispensa</span>
              {expiringCount > 0 ? (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#E85D4A] text-white">
                  {expiringCount}
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E8EFE9] text-[#4A6B50]">
                  {pantryItems.length}
                </span>
              )}
            </button>

            <button
              id="nav-tab-saved"
              onClick={() => setActiveTab('saved')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === 'saved'
                  ? 'bg-[#4A6B50] text-[#FFFFFF] shadow-sm'
                  : 'text-[#47584A] hover:bg-[#EAE6DE] hover:text-[#233527]'
              }`}
            >
              <Bookmark className="w-4 h-4" />
              <span>Salvate</span>
              {savedRecipes.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-[#E8EFE9] text-[#4A6B50]">
                  {savedRecipes.length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Sub-bar contextual hint */}
        {dietPlan && activeTab !== 'diet' && (
          <div className="hidden sm:flex items-center justify-between py-1.5 border-t border-[#EAE6DE] text-xs text-[#5C7260]">
            <div className="flex items-center gap-2 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-[#64906B]" />
              <span className="font-medium text-[#384E3C]">Dieta attiva:</span>
              <span className="truncate text-[#4F6453]">{dietPlan.title}</span>
              {dietPlan.dailyCalories && (
                <span className="px-2 py-0.5 rounded bg-[#E8EFE9] text-[#3D5642] text-[11px] font-medium">
                  {dietPlan.dailyCalories}
                </span>
              )}
            </div>
            <button
              onClick={() => setActiveTab('diet')}
              className="text-[#3F5D44] hover:underline font-medium flex items-center gap-1 text-[11px]"
            >
              <BookOpen className="w-3 h-3" />
              Vedi regole & alimenti ammessi
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
