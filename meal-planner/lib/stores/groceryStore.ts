import { create } from 'zustand';
import type {
  ConsolidatedIngredient,
  GroceryListWithItems,
  PriceComparison,
  StoreType,
} from '../types/models';
import type { PantryItem } from '../types/database';

interface GroceryStore {
  currentList: GroceryListWithItems | null;
  consolidatedItems: ConsolidatedIngredient[];
  pantryItems: PantryItem[];
  priceComparisons: PriceComparison[];
  selectedStores: StoreType[];
  zipCode: string;
  isLoadingPrices: boolean;

  setCurrentList: (list: GroceryListWithItems | null) => void;
  setConsolidatedItems: (items: ConsolidatedIngredient[]) => void;
  setPantryItems: (items: PantryItem[]) => void;
  addPantryItem: (item: PantryItem) => void;
  updatePantryItem: (id: string, updates: Partial<PantryItem>) => void;
  removePantryItem: (id: string) => void;
  setPriceComparisons: (comparisons: PriceComparison[]) => void;
  setSelectedStores: (stores: StoreType[]) => void;
  setZipCode: (zip: string) => void;
  setIsLoadingPrices: (val: boolean) => void;
  markItemPurchased: (itemId: string, store: string, cost: number) => void;
}

export const useGroceryStore = create<GroceryStore>((set) => ({
  currentList: null,
  consolidatedItems: [],
  pantryItems: [],
  priceComparisons: [],
  selectedStores: [],
  zipCode: '',
  isLoadingPrices: false,

  setCurrentList: (list) => set({ currentList: list }),

  setConsolidatedItems: (items) => set({ consolidatedItems: items }),

  setPantryItems: (items) => set({ pantryItems: items }),

  addPantryItem: (item) =>
    set((state) => ({ pantryItems: [...state.pantryItems, item] })),

  updatePantryItem: (id, updates) =>
    set((state) => ({
      pantryItems: state.pantryItems.map((p) =>
        p.id === id ? { ...p, ...updates } : p,
      ),
    })),

  removePantryItem: (id) =>
    set((state) => ({
      pantryItems: state.pantryItems.filter((p) => p.id !== id),
    })),

  setPriceComparisons: (comparisons) => set({ priceComparisons: comparisons }),

  setSelectedStores: (stores) => set({ selectedStores: stores }),

  setZipCode: (zip) => set({ zipCode: zip }),

  setIsLoadingPrices: (val) => set({ isLoadingPrices: val }),

  markItemPurchased: (itemId, store, cost) =>
    set((state) => {
      if (!state.currentList) return state;
      const updatedItems = state.currentList.items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              is_purchased: true,
              purchased_at: new Date().toISOString(),
              purchased_at_store: store,
              actual_cost: cost,
            }
          : item,
      );
      return {
        currentList: { ...state.currentList, items: updatedItems },
      };
    }),
}));
