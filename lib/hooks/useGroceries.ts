'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createClient } from '../supabase/client';
import type {
  GroceryListWithItems,
  ConsolidatedIngredient,
  PriceComparison,
} from '../types/models';
import type { GroceryItem } from '../types/database';

// ── Query keys ──────────────────────────────────────────────────────────────

export const groceryKeys = {
  all: ['groceries'] as const,
  list: (weekStarting: string) => ['groceries', 'list', weekStarting] as const,
};

// ── useGroceryList ────────────────────────────────────────────────────────────

export function useGroceryList(
  weekStarting: string,
): UseQueryResult<GroceryListWithItems | null, Error> {
  const supabase = createClient();

  return useQuery({
    queryKey: groceryKeys.list(weekStarting),
    queryFn: async (): Promise<GroceryListWithItems | null> => {
      const { data, error } = await supabase
        .from('grocery_lists')
        .select('*, items:grocery_items(*)')
        .eq('week_starting', weekStarting)
        .maybeSingle();

      if (error) throw error;
      return data as GroceryListWithItems | null;
    },
    enabled: Boolean(weekStarting),
  });
}

// ── useConsolidateGroceries ───────────────────────────────────────────────────

type ConsolidatePayload = {
  weekStarting: string;
  mealIds: string[];
};

export function useConsolidateGroceries(): UseMutationResult<
  ConsolidatedIngredient[],
  Error,
  ConsolidatePayload
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      payload: ConsolidatePayload,
    ): Promise<ConsolidatedIngredient[]> => {
      const res = await fetch('/api/groceries/consolidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to consolidate groceries: ${body}`);
      }

      const data = await res.json();
      return data.items as ConsolidatedIngredient[];
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: groceryKeys.list(variables.weekStarting),
      });
    },
  });
}

// ── useComparePrices ──────────────────────────────────────────────────────────

type ComparePricesPayload = {
  items: ConsolidatedIngredient[];
  zipCode: string;
  stores?: string[];
};

export function useComparePrices(): UseMutationResult<
  PriceComparison[],
  Error,
  ComparePricesPayload
> {
  return useMutation({
    mutationFn: async (
      payload: ComparePricesPayload,
    ): Promise<PriceComparison[]> => {
      const res = await fetch('/api/groceries/compare-prices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to compare prices: ${body}`);
      }

      const data = await res.json();
      return data.comparisons as PriceComparison[];
    },
  });
}

// ── useTogglePurchased ────────────────────────────────────────────────────────

type TogglePurchasedInput = {
  itemId: string;
  weekStarting: string;
  purchased: boolean;
  store?: string;
  cost?: number;
};

export function useTogglePurchased(): UseMutationResult<
  GroceryItem,
  Error,
  TogglePurchasedInput
> {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: TogglePurchasedInput): Promise<GroceryItem> => {
      const updatePayload: Partial<GroceryItem> = {
        is_purchased: input.purchased,
        purchased_at: input.purchased ? new Date().toISOString() : null,
        purchased_at_store: input.store ?? null,
        actual_cost: input.cost ?? null,
      };

      const { data, error } = await supabase
        .from('grocery_items')
        .update(updatePayload)
        .eq('id', input.itemId)
        .select()
        .single();

      if (error) throw error;
      return data as GroceryItem;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: groceryKeys.list(variables.weekStarting),
      });
    },
  });
}

// ── useExportList ─────────────────────────────────────────────────────────────

type ExportListInput = {
  weekStarting: string;
  format?: 'pdf' | 'csv';
};

export function useExportList(): UseMutationResult<
  Blob,
  Error,
  ExportListInput
> {
  return useMutation({
    mutationFn: async (input: ExportListInput): Promise<Blob> => {
      const params = new URLSearchParams({
        weekStarting: input.weekStarting,
        format: input.format ?? 'pdf',
      });

      const res = await fetch(`/api/groceries/export?${params.toString()}`, {
        method: 'GET',
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to export grocery list: ${body}`);
      }

      return res.blob();
    },
  });
}
