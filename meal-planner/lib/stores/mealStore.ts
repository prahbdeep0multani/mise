import { create } from 'zustand';
import type { MealWithRecipe, WeekPlanSuggestion } from '../types/models';

// Returns the ISO date string (YYYY-MM-DD) of the Monday of the current week.
export function getWeekStart(date?: Date): string {
  const d = date ? new Date(date) : new Date();
  // getDay() returns 0 (Sun) – 6 (Sat); shift so Mon = 0
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split('T')[0];
}

interface MealStore {
  currentWeek: string;
  meals: Record<string, MealWithRecipe>;
  isGenerating: boolean;
  suggestions: WeekPlanSuggestion | null;

  setCurrentWeek: (week: string) => void;
  setMeals: (meals: MealWithRecipe[]) => void;
  addMeal: (meal: MealWithRecipe) => void;
  removeMeal: (mealId: string) => void;
  updateMeal: (mealId: string, updates: Partial<MealWithRecipe>) => void;
  setIsGenerating: (val: boolean) => void;
  setSuggestions: (s: WeekPlanSuggestion | null) => void;
  getMealsForWeek: (weekStarting: string) => MealWithRecipe[];
}

export const useMealStore = create<MealStore>((set, get) => ({
  currentWeek: getWeekStart(),
  meals: {},
  isGenerating: false,
  suggestions: null,

  setCurrentWeek: (week) => set({ currentWeek: week }),

  setMeals: (meals) => {
    const record: Record<string, MealWithRecipe> = {};
    for (const meal of meals) {
      record[meal.id] = meal;
    }
    set({ meals: record });
  },

  addMeal: (meal) =>
    set((state) => ({
      meals: { ...state.meals, [meal.id]: meal },
    })),

  removeMeal: (mealId) =>
    set((state) => {
      const next = { ...state.meals };
      delete next[mealId];
      return { meals: next };
    }),

  updateMeal: (mealId, updates) =>
    set((state) => {
      const existing = state.meals[mealId];
      if (!existing) return state;
      return {
        meals: {
          ...state.meals,
          [mealId]: { ...existing, ...updates } as MealWithRecipe,
        },
      };
    }),

  setIsGenerating: (val) => set({ isGenerating: val }),

  setSuggestions: (s) => set({ suggestions: s }),

  getMealsForWeek: (weekStarting) => {
    const { meals } = get();
    return Object.values(meals).filter(
      (m) => m.week_starting === weekStarting,
    );
  },
}));
