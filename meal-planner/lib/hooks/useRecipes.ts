'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query';
import { createClient } from '../supabase/client';
import type { RecipeWithIngredients, Nutrition } from '../types/models';
import type { Recipe } from '../types/database';

// ── Query keys ──────────────────────────────────────────────────────────────

export const recipeKeys = {
  all: ['recipes'] as const,
  search: (params: RecipeSearchParams) => ['recipes', 'search', params] as const,
  detail: (id: string) => ['recipes', id] as const,
  nutrition: (id: string) => ['recipes', id, 'nutrition'] as const,
};

// ── Types ────────────────────────────────────────────────────────────────────

export type RecipeSearchParams = {
  query?: string;
  cuisine?: string;
  dietaryTags?: string[];
  maxPrepTime?: number;
  maxCost?: number;
  difficulty?: string;
  page?: number;
  pageSize?: number;
};

// ── useRecipeSearch ───────────────────────────────────────────────────────────

export function useRecipeSearch(
  params: RecipeSearchParams,
): UseQueryResult<Recipe[], Error> {
  return useQuery({
    queryKey: recipeKeys.search(params),
    queryFn: async (): Promise<Recipe[]> => {
      const searchParams = new URLSearchParams();

      if (params.query) searchParams.set('query', params.query);
      if (params.cuisine) searchParams.set('cuisine', params.cuisine);
      if (params.dietaryTags?.length)
        searchParams.set('dietaryTags', params.dietaryTags.join(','));
      if (params.maxPrepTime != null)
        searchParams.set('maxPrepTime', String(params.maxPrepTime));
      if (params.maxCost != null)
        searchParams.set('maxCost', String(params.maxCost));
      if (params.difficulty) searchParams.set('difficulty', params.difficulty);
      if (params.page != null)
        searchParams.set('page', String(params.page));
      if (params.pageSize != null)
        searchParams.set('pageSize', String(params.pageSize));

      const res = await fetch(
        `/api/recipes/search?${searchParams.toString()}`,
      );

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Recipe search failed: ${body}`);
      }

      const data = await res.json();
      return data.recipes as Recipe[];
    },
    // Only run when at least one search param is provided
    enabled: Object.values(params).some((v) =>
      Array.isArray(v) ? v.length > 0 : v != null && v !== '',
    ),
  });
}

// ── useRecipe ─────────────────────────────────────────────────────────────────

export function useRecipe(
  id: string,
): UseQueryResult<RecipeWithIngredients, Error> {
  const supabase = createClient();

  return useQuery({
    queryKey: recipeKeys.detail(id),
    queryFn: async (): Promise<RecipeWithIngredients> => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      const recipe = data as Recipe;

      // Parse ingredients JSON array into typed Ingredient[]
      const parsedIngredients = Array.isArray(recipe.ingredients)
        ? (recipe.ingredients as unknown[]).map((ing) => {
            const i = ing as Record<string, unknown>;
            return {
              item: String(i.item ?? ''),
              qty: Number(i.qty ?? 0),
              unit: String(i.unit ?? ''),
              calories: i.calories != null ? Number(i.calories) : undefined,
              protein: i.protein != null ? Number(i.protein) : undefined,
            };
          })
        : [];

      // Parse nutrition JSON object
      const rawNutrition = (recipe.nutrition ?? {}) as Record<string, unknown>;
      const parsedNutrition: Nutrition = {
        protein: Number(rawNutrition.protein ?? 0),
        carbs: Number(rawNutrition.carbs ?? 0),
        fat: Number(rawNutrition.fat ?? 0),
        fiber: Number(rawNutrition.fiber ?? 0),
        sodium: rawNutrition.sodium != null ? Number(rawNutrition.sodium) : undefined,
        calories:
          rawNutrition.calories != null
            ? Number(rawNutrition.calories)
            : recipe.total_calories ?? undefined,
      };

      return { ...recipe, parsedIngredients, parsedNutrition };
    },
    enabled: Boolean(id),
  });
}

// ── useRecipeNutrition ────────────────────────────────────────────────────────

export function useRecipeNutrition(
  id: string,
): UseQueryResult<Nutrition, Error> {
  return useQuery({
    queryKey: recipeKeys.nutrition(id),
    queryFn: async (): Promise<Nutrition> => {
      const res = await fetch(`/api/recipes/${id}/nutrition`);

      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to fetch recipe nutrition: ${body}`);
      }

      const data = await res.json();
      return data as Nutrition;
    },
    enabled: Boolean(id),
  });
}

// ── useSaveRecipe ─────────────────────────────────────────────────────────────

type SaveRecipeInput = Omit<
  Recipe,
  'id' | 'created_at' | 'updated_at' | 'is_public' | 'search_text'
>;

export function useSaveRecipe(): UseMutationResult<
  Recipe,
  Error,
  SaveRecipeInput
> {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SaveRecipeInput): Promise<Recipe> => {
      const { data, error } = await supabase
        .from('recipes')
        .insert({ ...input, is_public: false })
        .select()
        .single();

      if (error) throw error;
      return data as Recipe;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: recipeKeys.all });
      queryClient.setQueryData(recipeKeys.detail(data.id), data);
    },
  });
}
