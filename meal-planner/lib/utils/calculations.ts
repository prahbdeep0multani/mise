import type { MealWithRecipe, ConsolidatedIngredient, Nutrition } from '../types/models';
import type { PantryItem, Recipe } from '../types/database';

// ── getWeekDates ──────────────────────────────────────────────────────────────

/**
 * Returns an array of 7 Date objects starting on the Monday of the given week.
 */
export function getWeekDates(weekStarting: string): Date[] {
  const monday = new Date(weekStarting);
  // Correct for timezone offset so the date does not shift
  monday.setMinutes(monday.getMinutes() + monday.getTimezoneOffset());
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

// ── formatCurrency ────────────────────────────────────────────────────────────

/**
 * Converts a price stored as cents (integer) to a "$X.XX" string.
 */
export function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

// ── calculateServingCost ──────────────────────────────────────────────────────

/**
 * Returns the estimated cost in cents for `servings` servings of a recipe.
 * estimated_cost on the recipe is assumed to be the cost for the default
 * recipe.servings count.
 */
export function calculateServingCost(recipe: Recipe, servings: number): number {
  const totalCost = recipe.estimated_cost ?? 0;
  if (recipe.servings <= 0) return 0;
  return (totalCost / recipe.servings) * servings;
}

// ── consolidateIngredients ────────────────────────────────────────────────────

/**
 * Merges ingredient lists from all provided meals, normalises units where
 * possible, subtracts available pantry quantities, and flags items that are
 * already fully covered.
 */
export function consolidateIngredients(
  meals: MealWithRecipe[],
  pantryItems: PantryItem[],
): ConsolidatedIngredient[] {
  const map = new Map<
    string,
    {
      totalQty: number;
      unit: string;
      category: string;
      sources: string[];
    }
  >();

  for (const meal of meals) {
    const recipe = meal.recipe;
    const ingredients = Array.isArray(recipe.ingredients)
      ? (recipe.ingredients as unknown[])
      : [];

    for (const raw of ingredients) {
      const ing = raw as Record<string, unknown>;
      const name = String(ing.item ?? '').toLowerCase().trim();
      if (!name) continue;

      const qty = Number(ing.qty ?? 0);
      const unit = String(ing.unit ?? '').toLowerCase().trim();

      const existing = map.get(name);
      if (existing) {
        // Same unit → add directly; different unit → keep first unit and add anyway
        existing.totalQty +=
          existing.unit === unit
            ? qty
            : standardizeUnit(qty, unit, existing.unit);
        if (!existing.sources.includes(recipe.name)) {
          existing.sources.push(recipe.name);
        }
      } else {
        map.set(name, {
          totalQty: qty,
          unit,
          category: guessCategory(name),
          sources: [recipe.name],
        });
      }
    }
  }

  const result: ConsolidatedIngredient[] = [];

  for (const [name, info] of map) {
    const pantry = pantryItems.find(
      (p) => p.ingredient_name.toLowerCase().trim() === name,
    );
    const pantryQty = pantry?.quantity ?? 0;
    const needed = Math.max(0, info.totalQty - pantryQty);

    result.push({
      name,
      totalQty: needed,
      unit: info.unit,
      category: info.category,
      sources: info.sources,
      inPantry: pantryQty > 0,
      pantryQty: pantryQty > 0 ? pantryQty : undefined,
    });
  }

  return result;
}

// ── standardizeUnit ───────────────────────────────────────────────────────────

const UNIT_TO_ML: Record<string, number> = {
  ml: 1,
  milliliter: 1,
  milliliters: 1,
  l: 1000,
  liter: 1000,
  liters: 1000,
  litre: 1000,
  litres: 1000,
  tsp: 4.929,
  teaspoon: 4.929,
  teaspoons: 4.929,
  tbsp: 14.787,
  tablespoon: 14.787,
  tablespoons: 14.787,
  'fl oz': 29.574,
  cup: 236.588,
  cups: 236.588,
  pt: 473.176,
  pint: 473.176,
  pints: 473.176,
  qt: 946.353,
  quart: 946.353,
  quarts: 946.353,
  gal: 3785.41,
  gallon: 3785.41,
  gallons: 3785.41,
};

const UNIT_TO_G: Record<string, number> = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  kilograms: 1000,
  oz: 28.3495,
  ounce: 28.3495,
  ounces: 28.3495,
  lb: 453.592,
  lbs: 453.592,
  pound: 453.592,
  pounds: 453.592,
};

/**
 * Converts `qty` from `fromUnit` to `toUnit`. Returns original qty if
 * conversion is not supported (units in different measurement systems).
 */
export function standardizeUnit(
  qty: number,
  fromUnit: string,
  toUnit: string,
): number {
  const from = fromUnit.toLowerCase().trim();
  const to = toUnit.toLowerCase().trim();

  if (from === to) return qty;

  // Volume conversion
  if (UNIT_TO_ML[from] != null && UNIT_TO_ML[to] != null) {
    return (qty * UNIT_TO_ML[from]) / UNIT_TO_ML[to];
  }

  // Weight conversion
  if (UNIT_TO_G[from] != null && UNIT_TO_G[to] != null) {
    return (qty * UNIT_TO_G[from]) / UNIT_TO_G[to];
  }

  // Cannot convert between different systems; return original qty
  return qty;
}

// ── calculateWeeklyNutrition ──────────────────────────────────────────────────

/**
 * Sums nutrition across all meals for the week (scaled by servings).
 */
export function calculateWeeklyNutrition(meals: MealWithRecipe[]): Nutrition {
  const totals: Nutrition = {
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    sodium: 0,
    calories: 0,
  };

  for (const meal of meals) {
    const raw = (meal.recipe.nutrition ?? {}) as Record<string, unknown>;
    const scale = meal.servings / Math.max(meal.recipe.servings, 1);

    totals.protein += Number(raw.protein ?? 0) * scale;
    totals.carbs += Number(raw.carbs ?? 0) * scale;
    totals.fat += Number(raw.fat ?? 0) * scale;
    totals.fiber += Number(raw.fiber ?? 0) * scale;
    totals.sodium = (totals.sodium ?? 0) + Number(raw.sodium ?? 0) * scale;
    totals.calories =
      (totals.calories ?? 0) +
      (raw.calories != null
        ? Number(raw.calories) * scale
        : (meal.recipe.total_calories ?? 0) * scale);
  }

  return totals;
}

// ── getBudgetStatus ───────────────────────────────────────────────────────────

export function getBudgetStatus(
  spent: number,
  budget: number,
): 'under' | 'near' | 'over' {
  if (budget <= 0) return 'under';
  const ratio = spent / budget;
  if (ratio >= 1) return 'over';
  if (ratio >= 0.85) return 'near';
  return 'under';
}

// ── getExpiringItems ──────────────────────────────────────────────────────────

export function getExpiringItems(
  pantry: PantryItem[],
  daysAhead: number,
): PantryItem[] {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() + daysAhead);

  return pantry.filter((item) => {
    if (!item.expires_at) return false;
    const exp = new Date(item.expires_at);
    return exp >= now && exp <= cutoff;
  });
}

// ── getMealsForDay ────────────────────────────────────────────────────────────

export function getMealsForDay(
  meals: MealWithRecipe[],
  dayOfWeek: number,
): MealWithRecipe[] {
  return meals.filter((m) => m.day_of_week === dayOfWeek);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const PRODUCE_KEYWORDS = [
  'apple', 'banana', 'berry', 'broccoli', 'carrot', 'celery', 'cucumber',
  'garlic', 'grape', 'lemon', 'lettuce', 'lime', 'mango', 'mushroom', 'onion',
  'orange', 'pepper', 'potato', 'spinach', 'tomato', 'zucchini', 'herb',
  'basil', 'cilantro', 'parsley', 'ginger', 'kale', 'avocado',
];
const DAIRY_KEYWORDS = ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg'];
const MEAT_KEYWORDS = [
  'chicken', 'beef', 'pork', 'lamb', 'turkey', 'salmon', 'tuna', 'shrimp',
  'fish', 'bacon', 'sausage',
];
const FROZEN_KEYWORDS = ['frozen', 'ice cream'];
const BAKERY_KEYWORDS = ['bread', 'roll', 'bagel', 'muffin', 'tortilla', 'bun'];
const BEVERAGES_KEYWORDS = ['juice', 'soda', 'water', 'wine', 'beer', 'coffee', 'tea'];
const CANNED_KEYWORDS = ['canned', 'can of', 'tomato sauce', 'tomato paste', 'coconut milk'];

function guessCategory(name: string): string {
  const n = name.toLowerCase();
  if (PRODUCE_KEYWORDS.some((k) => n.includes(k))) return 'produce';
  if (DAIRY_KEYWORDS.some((k) => n.includes(k))) return 'dairy';
  if (MEAT_KEYWORDS.some((k) => n.includes(k))) return 'meat';
  if (FROZEN_KEYWORDS.some((k) => n.includes(k))) return 'frozen';
  if (BAKERY_KEYWORDS.some((k) => n.includes(k))) return 'bakery';
  if (BEVERAGES_KEYWORDS.some((k) => n.includes(k))) return 'beverages';
  if (CANNED_KEYWORDS.some((k) => n.includes(k))) return 'canned';
  return 'pantry';
}
