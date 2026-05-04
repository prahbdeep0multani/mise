// ============================================================
// lib/types/models.ts
// Application-level model types (richer than raw DB rows).
// ============================================================

import type {
  Recipe,
  Meal,
  GroceryList,
  GroceryItem,
  NutritionLog,
  StorePrice,
} from './database';

// ----------------------------------------------------------------
// Enums
// ----------------------------------------------------------------

export enum DayOfWeek {
  Sunday    = 0,
  Monday    = 1,
  Tuesday   = 2,
  Wednesday = 3,
  Thursday  = 4,
  Friday    = 5,
  Saturday  = 6,
}

export enum CategoryType {
  Produce   = 'produce',
  Dairy     = 'dairy',
  Meat      = 'meat',
  Pantry    = 'pantry',
  Frozen    = 'frozen',
  Canned    = 'canned',
  Bakery    = 'bakery',
  Beverages = 'beverages',
}

export enum StoreType {
  WholeFoods   = 'WholeFoods',
  TradersJoes  = 'TradersJoes',
  Kroger       = 'Kroger',
  Costco       = 'Costco',
  AmazonFresh  = 'AmazonFresh',
  Instacart    = 'Instacart',
  Local        = 'Local',
}

// ----------------------------------------------------------------
// Primitive domain types
// ----------------------------------------------------------------

export type DietaryPreferences = {
  vegan: boolean;
  keto: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  nutFree: boolean;
};

export type Location = {
  zipCode: string;
  lat: number;
  lng: number;
};

export type Ingredient = {
  item: string;
  qty: number;
  unit: string;
  calories?: number;
  protein?: number;
};

export type Nutrition = {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium?: number;
  calories?: number;
};

// ----------------------------------------------------------------
// Enriched recipe / meal types
// ----------------------------------------------------------------

export type RecipeWithIngredients = Recipe & {
  parsedIngredients: Ingredient[];
  parsedNutrition: Nutrition;
};

export type MealWithRecipe = Meal & {
  recipe: Recipe;
};

export type WeekPlan = {
  weekStarting: string;
  /** Keyed by DayOfWeek (0–6). */
  meals: Record<number, MealWithRecipe>;
};

// ----------------------------------------------------------------
// Grocery / shopping types
// ----------------------------------------------------------------

export type ConsolidatedIngredient = {
  name: string;
  totalQty: number;
  unit: string;
  category: string;
  /** Recipe names that contribute this ingredient. */
  sources: string[];
  inPantry: boolean;
  pantryQty?: number;
};

export type PriceComparison = {
  ingredient: string;
  stores: Array<{
    storeName: string;
    price: number;
    unit: string;
    salePrice?: number;
    total: number;
  }>;
  cheapestStore: string;
  savings: number;
};

export type GroceryListWithItems = GroceryList & {
  items: GroceryItem[];
};

// ----------------------------------------------------------------
// AI / suggestion types
// ----------------------------------------------------------------

export type AIMessage = {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

export type MealSuggestion = {
  day: number;
  dayName: string;
  meal: string;
  description: string;
  ingredients: Ingredient[];
  estimatedCost: number;
  prepTime: number;
  nutrition: Nutrition;
};

export type WeekPlanSuggestion = {
  meals: MealSuggestion[];
  totalCost: number;
  avgCaloriesPerDay: number;
  shoppingList: ConsolidatedIngredient[];
};

// ----------------------------------------------------------------
// Store / pricing types
// ----------------------------------------------------------------

export type StoreBasket = {
  storeName: string;
  items: Array<{
    ingredient: string;
    price: number;
    qty: number;
  }>;
  total: number;
};

export type PriceAlert = {
  ingredient: string;
  store: string;
  oldPrice: number;
  newPrice: number;
  savings: number;
};

// Re-export DB row types that are commonly used at the model layer
// so callers only need a single import path.
export type { Recipe, Meal, GroceryList, GroceryItem, NutritionLog, StorePrice };
