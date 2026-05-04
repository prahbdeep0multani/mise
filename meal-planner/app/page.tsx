import Link from 'next/link'
import { CalendarDays, ShoppingCart, Sparkles, TrendingDown, Package, Leaf } from 'lucide-react'

const FEATURES = [
  { icon: CalendarDays, title: 'Weekly Meal Planner', desc: 'Drag & drop meals onto your calendar. Plan the whole week in minutes.' },
  { icon: Sparkles, title: 'AI Meal Suggestions', desc: 'Claude AI suggests balanced meals based on your budget, diet, and preferences.' },
  { icon: ShoppingCart, title: 'Auto Shopping List', desc: 'Ingredients consolidated from all meals, grouped by aisle. Export to PDF.' },
  { icon: TrendingDown, title: 'Price Comparison', desc: "Compare prices across Whole Foods, Kroger, Trader Joe's and more." },
  { icon: Package, title: 'Pantry Tracking', desc: 'Track what you have. System removes pantry items from your shopping list.' },
  { icon: Leaf, title: 'Zero Waste Mode', desc: 'Get recipe ideas for items about to expire. Reduce food waste every week.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌿</span>
          <span className="text-xl font-bold text-gray-900">MealPlan</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 font-medium">Sign in</Link>
          <Link href="/signup" className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            Get Started Free
          </Link>
        </div>
      </nav>

      <section className="px-8 py-24 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full text-sm text-emerald-700 font-medium mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Claude AI
        </div>
        <h1 className="text-5xl font-extrabold text-gray-900 leading-tight mb-6">
          Meal planning that<span className="text-emerald-600"> saves you money</span>
        </h1>
        <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto">
          Plan meals, generate shopping lists, compare grocery prices, and reduce food waste — all in one place.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/signup" className="px-8 py-3.5 bg-emerald-600 text-white rounded-xl text-base font-semibold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">
            Start Planning Free
          </Link>
          <Link href="/login" className="px-8 py-3.5 border border-gray-200 rounded-xl text-base font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            Sign In
          </Link>
        </div>
        <p className="text-sm text-gray-400 mt-4">No credit card required</p>
      </section>

      <section className="px-8 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Everything you need</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-11 h-11 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-16 text-center">
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-8">
          {[['$40+', 'avg monthly savings'], ['60%', 'less food waste'], ['15min', 'to plan the week']].map(([v, l]) => (
            <div key={l}>
              <p className="text-4xl font-extrabold text-emerald-600">{v}</p>
              <p className="text-sm text-gray-500 mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 px-8 py-8">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-gray-400">
          <span>🌿 MealPlan</span>
          <p>© {new Date().getFullYear()} MealPlan. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
