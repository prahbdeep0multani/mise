'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query';
import { createClient } from '../supabase/client';
import type { MealWithRecipe } from '../types/models';
import type { Meal, MealFeedback } from '../types/database';

// ── Query keys ──────────────────────────────────────────────────────────────

export const mealKeys = {
  all: ['meals'] as const,
  week: (weekStarting: string) => ['meals', weekStarting] as const,
  detail: (id: string) => ['meal', id] as const,
};

// ── useMeals ─────────────────────────────────────────────────────────────────

export function useMeals(weekStarting: string) {
  const supabase = createClient();

  return useQuery({
    queryKey: mealKeys.week(weekStarting),
    queryFn: async (): Promise<MealWithRecipe[]> => {
      const { data, error } = await supabase
        .from('meals')
        .select('*, recipe:recipes(*)')
        .eq('week_starting', weekStarting)
        .order('day_of_week', { ascending: true });

      if (error) throw error;
      return (data ?? []) as unknown as MealWithRecipe[];
    },
    enabled: Boolean(weekStarting),
  });
}

// ── useCreateMeal ─────────────────────────────────────────────────────────────

type CreateMealInput = Omit<
  Meal,
  'id' | 'created_at' | 'updated_at' | 'feedback_rating' | 'would_repeat'
>;

export function useCreateMeal(): UseMutationResult<
  MealWithRecipe,
  Error,
  CreateMealInput
> {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMealInput): Promise<MealWithRecipe> => {
      const { data, error } = await supabase
        .from('meals')
        .insert(input)
        .select('*, recipe:recipes(*)')
        .single();

      if (error) throw error;
      return data as unknown as MealWithRecipe;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealKeys.all });
    },
  });
}

// ── useDeleteMeal ─────────────────────────────────────────────────────────────

export function useDeleteMeal(): UseMutationResult<void, Error, string> {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (mealId: string): Promise<void> => {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mealKeys.all });
    },
  });
}

// ── useUpdateMeal ─────────────────────────────────────────────────────────────

type UpdateMealInput = {
  id: string;
  updates: Partial<Pick<Meal, 'servings' | 'notes' | 'day_of_week' | 'week_starting'>>;
};

export function useUpdateMeal(): UseMutationResult<
  MealWithRecipe,
  Error,
  UpdateMealInput
> {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: UpdateMealInput): Promise<MealWithRecipe> => {
      const { data, error } = await supabase
        .from('meals')
        .update(updates)
        .eq('id', id)
        .select('*, recipe:recipes(*)')
        .single();

      if (error) throw error;
      return data as unknown as MealWithRecipe;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: mealKeys.all });
      queryClient.invalidateQueries({ queryKey: mealKeys.detail(data.id) });
    },
  });
}

// ── useRateMeal ───────────────────────────────────────────────────────────────

type RateMealInput = {
  meal_id: string;
  recipe_id: string;
  user_id: string;
  feedback_rating: number;
  would_repeat: boolean;
  taste_notes?: string;
};

export function useRateMeal(): UseMutationResult<
  MealFeedback,
  Error,
  RateMealInput
> {
  const supabase = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RateMealInput): Promise<MealFeedback> => {
      // Insert feedback into meal_feedback table
      const { data: feedback, error: feedbackError } = await supabase
        .from('meal_feedback')
        .insert({
          meal_id: input.meal_id,
          recipe_id: input.recipe_id,
          user_id: input.user_id,
          rating: input.feedback_rating,
          would_repeat: input.would_repeat,
          taste_notes: input.taste_notes ?? null,
        })
        .select()
        .single();

      if (feedbackError) throw feedbackError;

      // Also update the denormalised columns on the meals row
      const { error: mealError } = await supabase
        .from('meals')
        .update({
          feedback_rating: input.feedback_rating,
          would_repeat: input.would_repeat,
        })
        .eq('id', input.meal_id);

      if (mealError) throw mealError;

      return feedback as MealFeedback;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: mealKeys.all });
      queryClient.invalidateQueries({
        queryKey: mealKeys.detail(variables.meal_id),
      });
    },
  });
}
