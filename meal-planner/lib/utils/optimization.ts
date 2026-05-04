import type {
  ConsolidatedIngredient,
  PriceComparison,
  StoreBasket,
  CategoryType,
} from '../types/models';
import type { PantryItem, Recipe, StorePrice } from '../types/database';

// ── consolidateIngredients ────────────────────────────────────────────────────

/**
 * Groups ingredients from multiple recipes, subtracts pantry quantities, and
 * assigns store aisle categories.
 */
export function consolidateIngredients(
  recipes: Recipe[],
  pantry: PantryItem[],
): ConsolidatedIngredient[] {
  const map = new Map<
    string,
    { totalQty: number; unit: string; sources: string[] }
  >();

  for (const recipe of recipes) {
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
        existing.totalQty += existing.unit === unit ? qty : qty; // same-system conversion omitted for brevity
        if (!existing.sources.includes(recipe.name)) {
          existing.sources.push(recipe.name);
        }
      } else {
        map.set(name, { totalQty: qty, unit, sources: [recipe.name] });
      }
    }
  }

  const result: ConsolidatedIngredient[] = [];

  for (const [name, info] of map) {
    const pantryItem = pantry.find(
      (p) => p.ingredient_name.toLowerCase().trim() === name,
    );
    const pantryQty = pantryItem?.quantity ?? 0;
    const needed = Math.max(0, info.totalQty - pantryQty);

    result.push({
      name,
      totalQty: needed,
      unit: info.unit,
      category: assignCategory(name),
      sources: info.sources,
      inPantry: pantryQty > 0,
      pantryQty: pantryQty > 0 ? pantryQty : undefined,
    });
  }

  return result;
}

// ── sortByAisle ───────────────────────────────────────────────────────────────

const AISLE_ORDER: string[] = [
  'produce',
  'dairy',
  'meat',
  'bakery',
  'frozen',
  'canned',
  'pantry',
  'beverages',
];

/**
 * Sorts consolidated ingredients in standard grocery store aisle order.
 */
export function sortByAisle(
  items: ConsolidatedIngredient[],
): ConsolidatedIngredient[] {
  return [...items].sort((a, b) => {
    const ai = AISLE_ORDER.indexOf(a.category.toLowerCase());
    const bi = AISLE_ORDER.indexOf(b.category.toLowerCase());
    const aIdx = ai === -1 ? AISLE_ORDER.length : ai;
    const bIdx = bi === -1 ? AISLE_ORDER.length : bi;
    if (aIdx !== bIdx) return aIdx - bIdx;
    return a.name.localeCompare(b.name);
  });
}

// ── findCheapestBasket ────────────────────────────────────────────────────────

/**
 * For each ingredient in the comparisons, selects the cheapest available
 * store. Returns a StoreBasket representing the minimum-cost single store that
 * covers the most items (ties broken by total cost).
 *
 * If splitting across stores is acceptable, callers should use each comparison's
 * `cheapestStore` field directly.
 */
export function findCheapestBasket(comparisons: PriceComparison[]): StoreBasket {
  // Tally: for each store how much the full list would cost if purchased there
  const storeTotals = new Map<
    string,
    { total: number; items: Array<{ ingredient: string; price: number; qty: number }> }
  >();

  for (const comparison of comparisons) {
    for (const store of comparison.stores) {
      const entry = storeTotals.get(store.storeName) ?? { total: 0, items: [] };
      entry.total += store.total;
      entry.items.push({
        ingredient: comparison.ingredient,
        price: store.price,
        qty: store.total / Math.max(store.price, 0.01),
      });
      storeTotals.set(store.storeName, entry);
    }
  }

  // Pick the store with the lowest total
  let cheapestStore = '';
  let cheapestTotal = Infinity;

  for (const [storeName, data] of storeTotals) {
    if (data.total < cheapestTotal) {
      cheapestTotal = data.total;
      cheapestStore = storeName;
    }
  }

  const best = storeTotals.get(cheapestStore);

  return {
    storeName: cheapestStore,
    items: best?.items ?? [],
    total: best?.total ?? 0,
  };
}

// ── calculateSplitShoppingSavings ─────────────────────────────────────────────

/**
 * Returns the amount saved (in the same currency unit as the prices) by
 * buying each ingredient from its cheapest store rather than purchasing
 * everything from the single cheapest overall store.
 */
export function calculateSplitShoppingSavings(
  comparisons: PriceComparison[],
): number {
  if (comparisons.length === 0) return 0;

  // Cost when buying optimally split across stores
  const splitCost = comparisons.reduce((sum, c) => {
    const minTotal = Math.min(...c.stores.map((s) => s.total));
    return sum + minTotal;
  }, 0);

  // Cost when buying everything from the single cheapest store
  const singleBasket = findCheapestBasket(comparisons);
  const singleCost = singleBasket.total;

  return Math.max(0, singleCost - splitCost);
}

// ── suggestBulkBuying ─────────────────────────────────────────────────────────

type BulkSuggestion = {
  item: string;
  saving: number;
  store: string;
};

/**
 * Compares per-unit prices for each consolidated ingredient against any bulk
 * (larger pack) prices in storePrices and surfaces items where buying in bulk
 * is cheaper per unit.
 */
export function suggestBulkBuying(
  items: ConsolidatedIngredient[],
  storePrices: StorePrice[],
): BulkSuggestion[] {
  const suggestions: BulkSuggestion[] = [];

  for (const item of items) {
    const normalizedName = item.name.toLowerCase().trim();

    // Find all price records for this ingredient
    const matches = storePrices.filter(
      (sp) =>
        sp.ingredient_name?.toLowerCase().trim() === normalizedName,
    );

    if (matches.length === 0) continue;

    // Split into regular and bulk entries (bulk identified by quantity_unit like "bulk" or larger pack sizes)
    const regular = matches.filter(
      (sp) => !sp.quantity_unit?.toLowerCase().includes('bulk'),
    );
    const bulk = matches.filter((sp) =>
      sp.quantity_unit?.toLowerCase().includes('bulk'),
    );

    if (regular.length === 0 || bulk.length === 0) continue;

    // Best regular unit price
    const bestRegularUnitPrice = Math.min(
      ...regular.map((sp) => sp.price ?? Infinity),
    );

    // Best bulk unit price
    const bestBulk = bulk.reduce(
      (best, sp) => {
        const price = sp.price ?? Infinity;
        return price < best.price ? { price, store: sp.store_name ?? '' } : best;
      },
      { price: Infinity, store: '' },
    );

    if (bestBulk.price < bestRegularUnitPrice) {
      const savingPerUnit = bestRegularUnitPrice - bestBulk.price;
      suggestions.push({
        item: item.name,
        saving: parseFloat((savingPerUnit * item.totalQty).toFixed(2)),
        store: bestBulk.store,
      });
    }
  }

  // Sort by savings descending
  return suggestions.sort((a, b) => b.saving - a.saving);
}

// ── Internal helpers ──────────────────────────────────────────────────────────

const CATEGORY_MAP: Array<{ keywords: string[]; category: CategoryType }> = [
  {
    keywords: [
      'apple', 'banana', 'berry', 'broccoli', 'carrot', 'celery',
      'cucumber', 'garlic', 'grape', 'lemon', 'lettuce', 'lime', 'mango',
      'mushroom', 'onion', 'orange', 'pepper', 'potato', 'spinach', 'tomato',
      'zucchini', 'herb', 'basil', 'cilantro', 'parsley', 'ginger', 'kale',
      'avocado',
    ],
    category: 'produce' as CategoryType,
  },
  {
    keywords: ['milk', 'cheese', 'butter', 'cream', 'yogurt', 'egg'],
    category: 'dairy' as CategoryType,
  },
  {
    keywords: [
      'chicken', 'beef', 'pork', 'lamb', 'turkey', 'salmon', 'tuna',
      'shrimp', 'fish', 'bacon', 'sausage',
    ],
    category: 'meat' as CategoryType,
  },
  {
    keywords: ['frozen', 'ice cream'],
    category: 'frozen' as CategoryType,
  },
  {
    keywords: ['bread', 'roll', 'bagel', 'muffin', 'tortilla', 'bun'],
    category: 'bakery' as CategoryType,
  },
  {
    keywords: ['canned', 'tomato sauce', 'tomato paste', 'coconut milk'],
    category: 'canned' as CategoryType,
  },
  {
    keywords: ['juice', 'soda', 'water', 'wine', 'beer', 'coffee', 'tea'],
    category: 'beverages' as CategoryType,
  },
];

function assignCategory(name: string): string {
  const n = name.toLowerCase();
  for (const { keywords, category } of CATEGORY_MAP) {
    if (keywords.some((k) => n.includes(k))) return category;
  }
  return 'pantry';
}
