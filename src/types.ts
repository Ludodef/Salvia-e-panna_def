export type CommitmentLevel = 'easy' | 'medium' | 'elaborate';

export type MealType = 'colazione' | 'pranzo' | 'cena' | 'spuntino';

export interface DietMealItem {
  mealType: string;
  name: string;
  alternatives: string[];
  notes?: string;
}

export interface DietDay {
  dayName: string;
  meals: {
    colazione?: string[];
    spuntino_mattina?: string[];
    pranzo?: string[];
    merenda?: string[];
    cena?: string[];
  };
}

export interface DietAllowedFoods {
  proteins: string[];
  carbs: string[];
  vegetables: string[];
  fatsAndCondiments: string[];
  fruits: string[];
  dairyOrPlantMilks: string[];
  freeSpicesAndHerbs: string[];
}

export interface DietPlan {
  id: string;
  title: string;
  goalOrTarget: string;
  dailyCalories?: string;
  generalRules: string[];
  allowedFoods: DietAllowedFoods;
  weeklySchedule: DietDay[];
  substitutionsRules: string[];
  rawSummary: string;
  dateUploaded: string;
  fileName?: string;
}

export interface RecipeIngredient {
  name: string;
  amount: string;
  isDietApproved: boolean;
  dietCategory?: string;
  isFromPantryOrFridge?: boolean;
}

export interface NutritionalInfo {
  estimatedCalories: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  fiberGrams?: number;
}

export interface Recipe {
  id: string;
  title: string;
  subtitle: string;
  mealType: MealType | string;
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  totalTimeMinutes: number;
  commitmentLevel: CommitmentLevel;
  portions: number;
  ingredients: RecipeIngredient[];
  steps: string[];
  chefTip: string;
  dietAlignmentNote: string;
  nutritionalInfo: NutritionalInfo;
  antiWasteSavedIngredients?: string[];
  tags: string[];
  isFavorite?: boolean;
  createdAt: string;
}

export interface PantryItem {
  id: string;
  name: string;
  category: 'frigo' | 'dispensa';
  quantity?: string;
  isExpiringSoon: boolean;
  addedAt: string;
}

export interface GenerateRecipeRequest {
  dayName?: string;
  mealType: MealType | string;
  commitmentLevel: CommitmentLevel;
  availableMinutes: number;
  dietPlan?: DietPlan | null;
  fridgeIngredients?: string[];
  customPreferences?: string;
}

export interface AntiWasteRecipeRequest {
  fridgeAndPantryItems: PantryItem[];
  availableMinutes: number;
  commitmentLevel: CommitmentLevel;
  dietPlan?: DietPlan | null;
}
