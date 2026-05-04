-- ============================================================
-- 001_initial_schema.sql
-- Initial schema for the meal-planning application
-- ============================================================

-- ----------------------------------------------------------------
-- Helper: auto-update updated_at column
-- ----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- ----------------------------------------------------------------
-- 1. users
-- ----------------------------------------------------------------
CREATE TABLE public.users (
  id                   uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email                text        UNIQUE NOT NULL,
  full_name            text,
  location             jsonb       NOT NULL DEFAULT '{"zipCode":"10001","lat":40.7128,"lng":-74.0060}',
  dietary_preferences  jsonb       NOT NULL DEFAULT '{"vegan":false,"keto":false,"glutenFree":false,"dairyFree":false,"nutFree":false}',
  budget_per_week      integer     NOT NULL DEFAULT 80,
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 2. recipes
-- ----------------------------------------------------------------
CREATE TABLE public.recipes (
  id                uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text        NOT NULL,
  description       text,
  prep_time_minutes integer,
  cook_time_minutes integer,
  servings          integer     NOT NULL DEFAULT 2,
  total_calories    integer,
  source            text,
  external_id       text,
  ingredients       jsonb       NOT NULL DEFAULT '[]',
  instructions      text[]      NOT NULL DEFAULT '{}',
  dietary_tags      text[]      NOT NULL DEFAULT '{}',
  cuisine           text,
  difficulty_level  text,
  estimated_cost    numeric(6,2),
  nutrition         jsonb       NOT NULL DEFAULT '{}',
  image_url         text,
  created_by        uuid        REFERENCES public.users(id) ON DELETE SET NULL,
  is_public         boolean     NOT NULL DEFAULT false,
  created_at        timestamptz NOT NULL DEFAULT NOW(),
  updated_at        timestamptz NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 3. meals
-- ----------------------------------------------------------------
CREATE TABLE public.meals (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  recipe_id        uuid        NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  day_of_week      integer     NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  week_starting    date        NOT NULL,
  servings         integer     NOT NULL DEFAULT 2,
  notes            text,
  feedback_rating  integer     CHECK (feedback_rating BETWEEN 1 AND 5),
  would_repeat     boolean,
  created_at       timestamptz NOT NULL DEFAULT NOW(),
  updated_at       timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, day_of_week, week_starting)
);

-- ----------------------------------------------------------------
-- 4. pantry_items
-- ----------------------------------------------------------------
CREATE TABLE public.pantry_items (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  ingredient_name  text        NOT NULL,
  quantity         numeric     NOT NULL,
  unit             text,
  category         text,
  expires_at       date,
  added_at         timestamptz NOT NULL DEFAULT NOW(),
  updated_at       timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, ingredient_name)
);

-- ----------------------------------------------------------------
-- 5. grocery_lists
-- ----------------------------------------------------------------
CREATE TABLE public.grocery_lists (
  id                   uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id              uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  week_starting        date        NOT NULL,
  status               text        NOT NULL DEFAULT 'draft',
  total_cost_estimated numeric(8,2),
  total_cost_actual    numeric(8,2),
  created_at           timestamptz NOT NULL DEFAULT NOW(),
  updated_at           timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, week_starting)
);

-- ----------------------------------------------------------------
-- 6. grocery_items
-- ----------------------------------------------------------------
CREATE TABLE public.grocery_items (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  grocery_list_id     uuid        NOT NULL REFERENCES public.grocery_lists(id) ON DELETE CASCADE,
  ingredient_name     text,
  quantity            numeric,
  unit                text,
  category            text,
  is_from_pantry      boolean     NOT NULL DEFAULT false,
  is_purchased        boolean     NOT NULL DEFAULT false,
  purchased_at        timestamptz,
  purchased_at_store  text,
  actual_cost         numeric(8,2),
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 7. store_prices
-- ----------------------------------------------------------------
CREATE TABLE public.store_prices (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  ingredient_name  text,
  store_name       text,
  store_location   text,
  price            numeric(8,2),
  unit             text,
  quantity_unit    text,
  sale_price       numeric(8,2),
  coupon_available text,
  last_updated     timestamptz NOT NULL DEFAULT NOW(),
  indexed_at       date
);

-- ----------------------------------------------------------------
-- 8. nutrition_logs
-- ----------------------------------------------------------------
CREATE TABLE public.nutrition_logs (
  id             uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  day            date        NOT NULL,
  total_calories integer,
  protein_g      numeric(6,2),
  carbs_g        numeric(6,2),
  fat_g          numeric(6,2),
  fiber_g        numeric(6,2),
  created_at     timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, day)
);

-- ----------------------------------------------------------------
-- 9. user_settings
-- ----------------------------------------------------------------
CREATE TABLE public.user_settings (
  id                          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     uuid        NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  theme                       text        NOT NULL DEFAULT 'light',
  notifications_enabled       boolean     NOT NULL DEFAULT true,
  email_daily_summary         boolean     NOT NULL DEFAULT false,
  favorite_stores             text[]      NOT NULL DEFAULT '{}',
  preferred_stores_order      text[]      NOT NULL DEFAULT '{}',
  cost_optimization_priority  text        NOT NULL DEFAULT 'cheapest',
  ingredients_to_avoid        text[]      NOT NULL DEFAULT '{}',
  created_at                  timestamptz NOT NULL DEFAULT NOW(),
  updated_at                  timestamptz NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 10. ai_conversations
-- ----------------------------------------------------------------
CREATE TABLE public.ai_conversations (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message_history jsonb       NOT NULL DEFAULT '[]',
  context         jsonb       NOT NULL DEFAULT '{}',
  created_at      timestamptz NOT NULL DEFAULT NOW(),
  updated_at      timestamptz NOT NULL DEFAULT NOW()
);

-- ----------------------------------------------------------------
-- 11. meal_feedback
-- ----------------------------------------------------------------
CREATE TABLE public.meal_feedback (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               uuid        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meal_id               uuid        REFERENCES public.meals(id) ON DELETE SET NULL,
  recipe_id             uuid        NOT NULL REFERENCES public.recipes(id) ON DELETE CASCADE,
  rating                integer     CHECK (rating BETWEEN 1 AND 5),
  taste_notes           text,
  difficulty_experienced text,
  would_repeat          boolean,
  created_at            timestamptz NOT NULL DEFAULT NOW()
);

-- ================================================================
-- INDEXES
-- ================================================================

CREATE INDEX idx_meals_user_week          ON public.meals (user_id, week_starting);
CREATE INDEX idx_meals_recipe             ON public.meals (recipe_id);
CREATE INDEX idx_pantry_items_user        ON public.pantry_items (user_id);
CREATE INDEX idx_grocery_items_list       ON public.grocery_items (grocery_list_id);
CREATE INDEX idx_store_prices_ingredient  ON public.store_prices (ingredient_name, store_name);
CREATE INDEX idx_nutrition_logs_user_day  ON public.nutrition_logs (user_id, day);
CREATE INDEX idx_recipes_dietary_tags     ON public.recipes USING GIN (dietary_tags);

-- ================================================================
-- FULL-TEXT SEARCH
-- ================================================================

ALTER TABLE public.recipes
  ADD COLUMN search_text tsvector
    GENERATED ALWAYS AS (
      to_tsvector(
        'english',
        COALESCE(name, '') || ' ' ||
        COALESCE(description, '') || ' ' ||
        COALESCE(cuisine, '')
      )
    ) STORED;

CREATE INDEX idx_recipes_search_text ON public.recipes USING GIN (search_text);

-- ================================================================
-- ROW LEVEL SECURITY
-- ================================================================

ALTER TABLE public.users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meals            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pantry_items     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_lists    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grocery_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_feedback    ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------
-- users policies
-- ----------------------------------------------------------------
CREATE POLICY "users manage own profile - select"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users manage own profile - insert"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users manage own profile - update"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users manage own profile - delete"
  ON public.users FOR DELETE
  USING (auth.uid() = id);

-- ----------------------------------------------------------------
-- recipes policies
-- ----------------------------------------------------------------
CREATE POLICY "public recipes viewable"
  ON public.recipes FOR SELECT
  USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "users manage own recipes - insert"
  ON public.recipes FOR INSERT
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "users manage own recipes - update"
  ON public.recipes FOR UPDATE
  USING (auth.uid() = created_by)
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "users manage own recipes - delete"
  ON public.recipes FOR DELETE
  USING (auth.uid() = created_by);

-- ----------------------------------------------------------------
-- meals policies
-- ----------------------------------------------------------------
CREATE POLICY "users manage own meals - select"
  ON public.meals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users manage own meals - insert"
  ON public.meals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own meals - update"
  ON public.meals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own meals - delete"
  ON public.meals FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- pantry_items policies
-- ----------------------------------------------------------------
CREATE POLICY "users manage own pantry_items - select"
  ON public.pantry_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users manage own pantry_items - insert"
  ON public.pantry_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own pantry_items - update"
  ON public.pantry_items FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own pantry_items - delete"
  ON public.pantry_items FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- grocery_lists policies
-- ----------------------------------------------------------------
CREATE POLICY "users manage own grocery_lists - select"
  ON public.grocery_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users manage own grocery_lists - insert"
  ON public.grocery_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own grocery_lists - update"
  ON public.grocery_lists FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own grocery_lists - delete"
  ON public.grocery_lists FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- grocery_items policies (access via grocery_lists ownership)
-- ----------------------------------------------------------------
CREATE POLICY "users manage own grocery_items - select"
  ON public.grocery_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists gl
      WHERE gl.id = grocery_list_id AND gl.user_id = auth.uid()
    )
  );

CREATE POLICY "users manage own grocery_items - insert"
  ON public.grocery_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.grocery_lists gl
      WHERE gl.id = grocery_list_id AND gl.user_id = auth.uid()
    )
  );

CREATE POLICY "users manage own grocery_items - update"
  ON public.grocery_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists gl
      WHERE gl.id = grocery_list_id AND gl.user_id = auth.uid()
    )
  );

CREATE POLICY "users manage own grocery_items - delete"
  ON public.grocery_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.grocery_lists gl
      WHERE gl.id = grocery_list_id AND gl.user_id = auth.uid()
    )
  );

-- ----------------------------------------------------------------
-- nutrition_logs policies
-- ----------------------------------------------------------------
CREATE POLICY "users manage own nutrition_logs - select"
  ON public.nutrition_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users manage own nutrition_logs - insert"
  ON public.nutrition_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own nutrition_logs - update"
  ON public.nutrition_logs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own nutrition_logs - delete"
  ON public.nutrition_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- user_settings policies
-- ----------------------------------------------------------------
CREATE POLICY "users manage own user_settings - select"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users manage own user_settings - insert"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own user_settings - update"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own user_settings - delete"
  ON public.user_settings FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- ai_conversations policies
-- ----------------------------------------------------------------
CREATE POLICY "users manage own ai_conversations - select"
  ON public.ai_conversations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users manage own ai_conversations - insert"
  ON public.ai_conversations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own ai_conversations - update"
  ON public.ai_conversations FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own ai_conversations - delete"
  ON public.ai_conversations FOR DELETE
  USING (auth.uid() = user_id);

-- ----------------------------------------------------------------
-- meal_feedback policies
-- ----------------------------------------------------------------
CREATE POLICY "users manage own meal_feedback - select"
  ON public.meal_feedback FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "users manage own meal_feedback - insert"
  ON public.meal_feedback FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own meal_feedback - update"
  ON public.meal_feedback FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "users manage own meal_feedback - delete"
  ON public.meal_feedback FOR DELETE
  USING (auth.uid() = user_id);

-- ================================================================
-- UPDATED_AT TRIGGERS
-- ================================================================

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_meals_updated_at
  BEFORE UPDATE ON public.meals
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_pantry_items_updated_at
  BEFORE UPDATE ON public.pantry_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_grocery_lists_updated_at
  BEFORE UPDATE ON public.grocery_lists
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_ai_conversations_updated_at
  BEFORE UPDATE ON public.ai_conversations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
