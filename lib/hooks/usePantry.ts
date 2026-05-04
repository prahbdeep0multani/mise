'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createClient } from '../supabase/client';
import type { PantryItem } from '../types/database';

// ── Query keys ──────────────────────────────────────────────────────────────

export const pantryKeys = {
  all: ['pantry'] as const,
  items: () => ['pantry', 'items'] as const,
};

// ── usePantry ─────────────────────────────────────────────────────────────────

export function usePantry(): UseQueryResult<PantryItem[], Error> {
  const supabase = createClient();

  return useQuery({
    queryKey: pantryKeys.items(),
    queryFn: async (): Promise<PantryItem[]> => {
      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .order('category', { ascending: true })
        .order('ingredient_name', { ascending: true });

      if (error) throw error;
      return (data ?? []) as PantryItem[];
    },
  });
}

// ── useAddPantryItem ──────────────────────────────────────────────────────────

type AddPantryItemInput = {
  ingredient_name: string;
  quantity: number;
  unit?: string;
  category?: string;
  expires_at?: string;
};

export function useAddPantryItem(): UseMutationResult<
  PantryItem,
  Error,
  AddPantryItemInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddPantryItemInput): Promise<PantryItem> => {
      const res = await fetch('/api/pantry/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to add pantry item: ${body}`);
      }

      const data = await res.json();
      return data as PantryItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pantryKeys.all });
    },
  });
}

// ── useUpdatePantryItem ───────────────────────────────────────────────────────

type UpdatePantryItemInput = {
  id: string;
  updates: Partial<
    Pick<PantryItem, 'ingredient_name' | 'quantity' | 'unit' | 'category' | 'expires_at'>
  >;
};

export function useUpdatePantryItem(): UseMutationResult<
  PantryItem,
  Error,
  UpdatePantryItemInput
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: UpdatePantryItemInput): Promise<PantryItem> => {
      const res = await fetch(`/api/pantry/items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to update pantry item: ${body}`);
      }

      const data = await res.json();
      return data as PantryItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pantryKeys.all });
    },
  });
}

// ── useDeletePantryItem ───────────────────────────────────────────────────────

export function useDeletePantryItem(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const res = await fetch(`/api/pantry/items/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to delete pantry item: ${body}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pantryKeys.all });
    },
  });
}

// ── useExpiringItems ──────────────────────────────────────────────────────────

export function useExpiringItems(days: number): UseQueryResult<PantryItem[], Error> {
  const supabase = createClient();

  return useQuery({
    queryKey: ['pantry', 'expiring', days],
    queryFn: async (): Promise<PantryItem[]> => {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + days);

      const { data, error } = await supabase
        .from('pantry_items')
        .select('*')
        .not('expires_at', 'is', null)
        .lte('expires_at', cutoff.toISOString())
        .gte('expires_at', new Date().toISOString())
        .order('expires_at', { ascending: true });

      if (error) throw error;
      return (data ?? []) as PantryItem[];
    },
    enabled: days > 0,
  });
}
