// ============================================================
// lib/types/database.ts
// Auto-generated TypeScript types matching the Supabase schema.
// ============================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json }
  | Json[];

// ----------------------------------------------------------------
// Top-level Database interface (mirrors Supabase generated shape)
// ----------------------------------------------------------------
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          location: Json;
          dietary_preferences: Json;
          budget_per_week: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          location?: Json;
          dietary_preferences?: Json;
          budget_per_week?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          location?: Json;
          dietary_preferences?: Json;
          budget_per_week?: number;
          created_at?: string;
          updated_at?: string;
        };
      };

      recipes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          prep_time_minutes: number | null;
          cook_time_minutes: number | null;
          servings: number;
          total_calories: number | null;
          source: string | null;
          external_id: string | null;
          ingredients: Json;
          instructions: string[];
          dietary_tags: string[];
          cuisine: string | null;
          difficulty_level: string | null;
          estimated_cost: number | null;
          nutrition: Json;
          image_url: string | null;
          created_by: string | null;
          is_public: boolean;
          search_text: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          prep_time_minutes?: number | null;
          cook_time_minutes?: number | null;
          servings?: number;
          total_calories?: number | null;
          source?: string | null;
          external_id?: string | null;
          ingredients?: Json;
          instructions?: string[];
          dietary_tags?: string[];
          cuisine?: string | null;
          difficulty_level?: string | null;
          estimated_cost?: number | null;
          nutrition?: Json;
          image_url?: string | null;
          created_by?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          prep_time_minutes?: number | null;
          cook_time_minutes?: number | null;
          servings?: number;
          total_calories?: number | null;
          source?: string | null;
          external_id?: string | null;
          ingredients?: Json;
          instructions?: string[];
          dietary_tags?: string[];
          cuisine?: string | null;
          difficulty_level?: string | null;
          estimated_cost?: number | null;
          nutrition?: Json;
          image_url?: string | null;
          created_by?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      meals: {
        Row: {
          id: string;
          user_id: string;
          recipe_id: string;
          day_of_week: number;
          week_starting: string;
          servings: number;
          notes: string | null;
          feedback_rating: number | null;
          would_repeat: boolean | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recipe_id: string;
          day_of_week: number;
          week_starting: string;
          servings?: number;
          notes?: string | null;
          feedback_rating?: number | null;
          would_repeat?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          recipe_id?: string;
          day_of_week?: number;
          week_starting?: string;
          servings?: number;
          notes?: string | null;
          feedback_rating?: number | null;
          would_repeat?: boolean | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      pantry_items: {
        Row: {
          id: string;
          user_id: string;
          ingredient_name: string;
          quantity: number;
          unit: string | null;
          category: string | null;
          expires_at: string | null;
          added_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          ingredient_name: string;
          quantity: number;
          unit?: string | null;
          category?: string | null;
          expires_at?: string | null;
          added_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          ingredient_name?: string;
          quantity?: number;
          unit?: string | null;
          category?: string | null;
          expires_at?: string | null;
          added_at?: string;
          updated_at?: string;
        };
      };

      grocery_lists: {
        Row: {
          id: string;
          user_id: string;
          week_starting: string;
          status: string;
          total_cost_estimated: number | null;
          total_cost_actual: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week_starting: string;
          status?: string;
          total_cost_estimated?: number | null;
          total_cost_actual?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          week_starting?: string;
          status?: string;
          total_cost_estimated?: number | null;
          total_cost_actual?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };

      grocery_items: {
        Row: {
          id: string;
          grocery_list_id: string;
          ingredient_name: string | null;
          quantity: number | null;
          unit: string | null;
          category: string | null;
          is_from_pantry: boolean;
          is_purchased: boolean;
          purchased_at: string | null;
          purchased_at_store: string | null;
          actual_cost: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          grocery_list_id: string;
          ingredient_name?: string | null;
          quantity?: number | null;
          unit?: string | null;
          category?: string | null;
          is_from_pantry?: boolean;
          is_purchased?: boolean;
          purchased_at?: string | null;
          purchased_at_store?: string | null;
          actual_cost?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          grocery_list_id?: string;
          ingredient_name?: string | null;
          quantity?: number | null;
          unit?: string | null;
          category?: string | null;
          is_from_pantry?: boolean;
          is_purchased?: boolean;
          purchased_at?: string | null;
          purchased_at_store?: string | null;
          actual_cost?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };

      store_prices: {
        Row: {
          id: string;
          ingredient_name: string | null;
          store_name: string | null;
          store_location: string | null;
          price: number | null;
          unit: string | null;
          quantity_unit: string | null;
          sale_price: number | null;
          coupon_available: string | null;
          last_updated: string;
          indexed_at: string | null;
        };
        Insert: {
          id?: string;
          ingredient_name?: string | null;
          store_name?: string | null;
          store_location?: string | null;
          price?: number | null;
          unit?: string | null;
          quantity_unit?: string | null;
          sale_price?: number | null;
          coupon_available?: string | null;
          last_updated?: string;
          indexed_at?: string | null;
        };
        Update: {
          id?: string;
          ingredient_name?: string | null;
          store_name?: string | null;
          store_location?: string | null;
          price?: number | null;
          unit?: string | null;
          quantity_unit?: string | null;
          sale_price?: number | null;
          coupon_available?: string | null;
          last_updated?: string;
          indexed_at?: string | null;
        };
      };

      nutrition_logs: {
        Row: {
          id: string;
          user_id: string;
          day: string;
          total_calories: number | null;
          protein_g: number | null;
          carbs_g: number | null;
          fat_g: number | null;
          fiber_g: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          day: string;
          total_calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          fiber_g?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          day?: string;
          total_calories?: number | null;
          protein_g?: number | null;
          carbs_g?: number | null;
          fat_g?: number | null;
          fiber_g?: number | null;
          created_at?: string;
        };
      };

      user_settings: {
        Row: {
          id: string;
          user_id: string;
          theme: string;
          notifications_enabled: boolean;
          email_daily_summary: boolean;
          favorite_stores: string[];
          preferred_stores_order: string[];
          cost_optimization_priority: string;
          ingredients_to_avoid: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          theme?: string;
          notifications_enabled?: boolean;
          email_daily_summary?: boolean;
          favorite_stores?: string[];
          preferred_stores_order?: string[];
          cost_optimization_priority?: string;
          ingredients_to_avoid?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          theme?: string;
          notifications_enabled?: boolean;
          email_daily_summary?: boolean;
          favorite_stores?: string[];
          preferred_stores_order?: string[];
          cost_optimization_priority?: string;
          ingredients_to_avoid?: string[];
          created_at?: string;
          updated_at?: string;
        };
      };

      ai_conversations: {
        Row: {
          id: string;
          user_id: string;
          message_history: Json;
          context: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          message_history?: Json;
          context?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          message_history?: Json;
          context?: Json;
          created_at?: string;
          updated_at?: string;
        };
      };

      meal_feedback: {
        Row: {
          id: string;
          user_id: string;
          meal_id: string | null;
          recipe_id: string;
          rating: number | null;
          taste_notes: string | null;
          difficulty_experienced: string | null;
          would_repeat: boolean | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          meal_id?: string | null;
          recipe_id: string;
          rating?: number | null;
          taste_notes?: string | null;
          difficulty_experienced?: string | null;
          would_repeat?: boolean | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          meal_id?: string | null;
          recipe_id?: string;
          rating?: number | null;
          taste_notes?: string | null;
          difficulty_experienced?: string | null;
          would_repeat?: boolean | null;
          created_at?: string;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// ----------------------------------------------------------------
// Convenience row-type aliases
// ----------------------------------------------------------------
export type User = Database['public']['Tables']['users']['Row'];
export type Recipe = Database['public']['Tables']['recipes']['Row'];
export type Meal = Database['public']['Tables']['meals']['Row'];
export type PantryItem = Database['public']['Tables']['pantry_items']['Row'];
export type GroceryList = Database['public']['Tables']['grocery_lists']['Row'];
export type GroceryItem = Database['public']['Tables']['grocery_items']['Row'];
export type StorePrice = Database['public']['Tables']['store_prices']['Row'];
export type NutritionLog = Database['public']['Tables']['nutrition_logs']['Row'];
export type UserSettings = Database['public']['Tables']['user_settings']['Row'];
export type AIConversation = Database['public']['Tables']['ai_conversations']['Row'];
export type MealFeedback = Database['public']['Tables']['meal_feedback']['Row'];
