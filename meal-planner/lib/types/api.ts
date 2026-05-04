// ============================================================
// lib/types/api.ts
// Request / response types for all API routes.
// ============================================================

import type { User, StorePrice, NutritionLog } from './database';
import type {
  DietaryPreferences,
  MealSuggestion,
  ConsolidatedIngredient,
  PriceComparison,
  StoreBasket,
  StoreType,
  Nutrition,
  Recipe,
} from './models';

// ----------------------------------------------------------------
// Meals
// ----------------------------------------------------------------

export type GenerateMealPlanRequest = {
  budget: number;
  dietary: DietaryPreferences;
  prepTimeMax: number;
  servings: number;
  dislikedIngredients: string[];
  weekStarting: string;
};

export type GenerateMealPlanResponse = {
  meals: MealSuggestion[];
  totalCost: number;
};

// ----------------------------------------------------------------
// Groceries
// ----------------------------------------------------------------

export type ConsolidateGroceriesRequest = {
  weekStarting: string;
};

export type ConsolidateGroceriesResponse = {
  items: ConsolidatedIngredient[];
  total: number;
};

export type ComparePricesRequest = {
  ingredients: string[];
  zipCode: string;
};

export type ComparePricesResponse = {
  comparisons: PriceComparison[];
  cheapestBasket: StoreBasket;
};

// ----------------------------------------------------------------
// Recipes
// ----------------------------------------------------------------

export type RecipeSearchParams = {
  q?: string;
  diet?: string;
  maxTime?: number;
  cuisine?: string;
  page?: number;
  limit?: number;
};

export type RecipeSearchResponse = {
  recipes: Recipe[];
  total: number;
  page: number;
};

// ----------------------------------------------------------------
// AI
// ----------------------------------------------------------------

export type AISuggestionsRequest = {
  budget: number;
  dietary: DietaryPreferences;
  pantryItems: string[];
  weekStarting: string;
  preferences?: string;
};

export type AIChatRequest = {
  message: string;
  conversationId?: string;
  context?: Record<string, unknown>;
};

// ----------------------------------------------------------------
// Pantry
// ----------------------------------------------------------------

export type PantryItemInput = {
  ingredient_name: string;
  quantity: number;
  unit: string;
  category: string;
  expires_at?: string;
};

export type UpdatePantryItemInput = Partial<PantryItemInput>;

// ----------------------------------------------------------------
// Auth
// ----------------------------------------------------------------

export type AuthCallbackResponse = {
  user: User | null;
  error?: string;
};

// ----------------------------------------------------------------
// Prices
// ----------------------------------------------------------------

export type PriceLookupRequest = {
  ingredient: string;
  stores: StoreType[];
  zipCode: string;
};

export type PriceLookupResponse = {
  prices: StorePrice[];
};

// ----------------------------------------------------------------
// Nutrition
// ----------------------------------------------------------------

export type WeeklyNutritionResponse = {
  days: NutritionLog[];
  weekTotal: Nutrition;
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
};

// ----------------------------------------------------------------
// Common / shared
// ----------------------------------------------------------------

export type APIError = {
  error: string;
  code: string;
  details?: unknown;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};
