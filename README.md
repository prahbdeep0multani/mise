# 🌿 Mise

> AI-powered meal planning that saves you money, reduces food waste, and makes grocery shopping effortless.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?logo=supabase)](https://supabase.com)
[![Claude AI](https://img.shields.io/badge/Claude-Sonnet_4.6-orange?logo=anthropic)](https://anthropic.com)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🗓️ **Weekly Planner** | Drag-and-drop meal calendar. Assign recipes to any day of the week |
| 🤖 **AI Suggestions** | Claude generates a full 7-day meal plan from your budget, diet, and preferences |
| 🛒 **Smart Grocery List** | Ingredients consolidated across all meals, grouped by aisle, pantry items subtracted |
| 💰 **Price Comparison** | Compare basket cost across Whole Foods, Trader Joe's, Kroger, Costco, and more |
| 📦 **Pantry Tracking** | Track what you have at home. System removes owned items from shopping lists |
| ⚠️ **Expiry Alerts** | Alerts for items about to expire with AI-generated recipe suggestions to use them up |
| 📊 **Nutrition Dashboard** | Weekly calorie, protein, carb, and fat breakdown vs. your daily goals |
| 💬 **AI Chat** | Multi-turn conversation with Claude for substitutions, tips, waste reduction, and more |
| 🌱 **Zero Waste Mode** | Prioritize recipes that use items expiring soon |

---

## 🏗️ Architecture

```
meal-planner/
├── app/
│   ├── (auth)/              # Login, Signup pages
│   ├── (dashboard)/         # Protected: Planner, Groceries, Pantry, Insights, Settings
│   └── api/                 # API routes (Vercel serverless functions)
│       ├── ai/              # Claude streaming endpoints
│       ├── groceries/       # Consolidation, price comparison, export
│       ├── meals/           # CRUD + generation
│       ├── pantry/          # Inventory management
│       ├── prices/          # Store price lookup + history
│       ├── recipes/         # Full-text search
│       └── cron/            # Daily price sync + expiry notifications
├── components/
│   ├── planner/             # WeeklyCalendar, MealCard, RecipeSelector, AISuggestions
│   ├── groceries/           # ShoppingList, PriceComparison
│   ├── pantry/              # PantryGrid, ExpiryAlerts
│   ├── insights/            # NutritionDashboard, CostChart, WasteReductionTips
│   ├── forms/               # PantryForm, BudgetForm, PreferencesForm
│   └── shared/              # Modal, Sidebar, Header, AuthGuard, EmptyState
├── lib/
│   ├── auth/                # AuthProvider (context + hooks)
│   ├── hooks/               # React Query hooks (meals, groceries, pantry, recipes)
│   ├── stores/              # Zustand stores (meals, grocery, AI)
│   ├── supabase/            # Browser, server, admin clients
│   ├── types/               # database.ts, models.ts, api.ts
│   └── utils/               # calculations, formatting, optimization, validation
└── supabase/
    └── migrations/          # Full PostgreSQL schema with RLS
```

**Stack:**
- **Frontend** — Next.js 16 App Router, React 19, Tailwind CSS, @dnd-kit (drag-drop)
- **State** — Zustand (global), React Query (server state + caching)
- **Backend** — Next.js API Routes → Vercel Serverless Functions
- **Database** — Supabase (PostgreSQL + RLS + Realtime + Auth)
- **AI** — Anthropic Claude Sonnet 4.6 (streaming meal plans + chat)
- **Deploy** — Vercel (CDN, Cron Jobs, Edge Middleware)

---

## 🚀 Getting Started

### 1. Clone & install

```bash
git clone https://github.com/your-username/meal-planner.git
cd meal-planner
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the full schema:

```bash
# Copy and paste the contents of:
supabase/migrations/001_initial_schema.sql
```

3. Enable **Google OAuth** under Authentication → Providers (optional)

### 3. Configure environment variables

```bash
cp .env.local.example .env.local
```

Fill in your keys:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic (Claude AI)
ANTHROPIC_API_KEY=sk-ant-...

# Optional
SPOONACULAR_API_KEY=...
CRON_SECRET=your-random-secret
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Database Schema

11 tables with Row Level Security (users can only access their own data):

```
users            → profile, location, dietary preferences, budget
recipes          → name, ingredients (jsonb), nutrition, dietary_tags (array), full-text search
meals            → user's weekly plan (recipe + day + week)
pantry_items     → inventory with expiry dates
grocery_lists    → weekly shopping lists (draft → finalized → purchased)
grocery_items    → line items in a list
store_prices     → price history per ingredient per store
nutrition_logs   → daily macro tracking
user_settings    → notification prefs, favorite stores
ai_conversations → multi-turn chat history
meal_feedback    → ratings and taste notes per cooked meal
```

---

## 🤖 AI Integration

### Meal Plan Generation (streaming)

`POST /api/ai/suggestions` streams a 7-day plan from Claude:

```typescript
// Request
{
  budget: 80,
  dietary: { vegan: true, glutenFree: false, ... },
  prepTimeMax: 30,
  servings: 2,
  dislikedIngredients: ["mushrooms"]
}

// Streams JSON → WeekPlanSuggestion
{
  meals: [{ day: 0, meal: "...", ingredients: [...], estimatedCost: 8.50 }],
  totalCost: 62.00,
  avgCaloriesPerDay: 1850
}
```

### AI Chat (streaming)

`POST /api/ai/chat` — ask anything:
- *"What can I cook with the spinach that's expiring tomorrow?"*
- *"Substitute for heavy cream in this pasta sauce?"*
- *"Give me a high-protein meal plan for $60"*

---

## ⚙️ Cron Jobs (Vercel)

Configured in `vercel.json`:

| Schedule | Route | What it does |
|---|---|---|
| Daily 2 AM UTC | `/api/cron/sync-prices` | Updates store_prices table with latest grocery prices |
| Daily 7 AM UTC | `/api/cron/send-notifications` | Emails users about expiring pantry items |

Protect cron routes by setting `CRON_SECRET` in your Vercel environment variables.

---

## 🔒 Security

- **Auth** — Supabase Auth (email/password + Google OAuth). Passwords never stored.
- **RLS** — Every table has Row Level Security. API routes validate `auth.uid()` server-side.
- **Secrets** — All API keys in environment variables, never in client bundles.
- **Middleware** — Edge middleware checks session on every protected route before rendering.
- **Input validation** — Zod-style validation on all API route inputs.

---

## 📦 Deployment

### Vercel (recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard → Settings → Environment Variables
```

Auto-deploys on every push to `main`. Preview deployments on every PR.

### Environment variables to set in Vercel

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
CRON_SECRET
```

---

## 📁 Key Files

| File | Purpose |
|---|---|
| [`middleware.ts`](middleware.ts) | Edge auth check + redirect on every request |
| [`lib/auth/AuthProvider.tsx`](lib/auth/AuthProvider.tsx) | React context for user session + profile |
| [`lib/stores/mealStore.ts`](lib/stores/mealStore.ts) | Zustand store for weekly planner state |
| [`lib/utils/optimization.ts`](lib/utils/optimization.ts) | Ingredient consolidation + cheapest basket algorithm |
| [`supabase/migrations/001_initial_schema.sql`](supabase/migrations/001_initial_schema.sql) | Full DB schema with RLS policies |
| [`app/api/ai/suggestions/route.ts`](app/api/ai/suggestions/route.ts) | Streaming Claude meal plan generation |
| [`components/planner/WeeklyCalendar.tsx`](components/planner/WeeklyCalendar.tsx) | Drag-drop DnD calendar |

---

## 🗺️ Roadmap

- [ ] Spoonacular API integration (500+ real recipes)
- [ ] Instacart / Kroger API for live prices
- [ ] SMS notifications (Twilio)
- [ ] Recipe image support (Cloudinary)
- [ ] Stripe subscription (Pro tier)
- [ ] Mobile app (React Native)
- [ ] Shared grocery lists (family sync via Supabase Realtime)
- [ ] Carbon footprint per meal

---

## 📄 License

MIT
