import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ingredients, zipCode } = await req.json()
  if (!Array.isArray(ingredients) || ingredients.length === 0) {
    return NextResponse.json({ error: 'ingredients array required' }, { status: 400 })
  }

  // Look up cached prices from store_prices table
  const { data: prices } = await supabase
    .from('store_prices')
    .select('*')
    .in('ingredient_name', ingredients.map((i: string) => i.toLowerCase()))

  // Group by ingredient
  const comparisons = ingredients.map((ingredient: string) => {
    const ingredientPrices = (prices ?? []).filter(
      p => p.ingredient_name.toLowerCase() === ingredient.toLowerCase()
    )

    const stores = ingredientPrices.map(p => ({
      storeName: p.store_name,
      price: Number(p.price),
      unit: p.unit ?? '',
      salePrice: p.sale_price ? Number(p.sale_price) : undefined,
      total: Number(p.price),
    }))

    // If no real data, generate mock prices for demo
    if (stores.length === 0) {
      const basePrice = 2 + Math.random() * 8
      const storeNames = ['Whole Foods', "Trader Joe's", 'Kroger']
      stores.push(
        ...storeNames.map(storeName => ({
          storeName,
          price: parseFloat((basePrice * (0.8 + Math.random() * 0.5)).toFixed(2)),
          unit: 'unit',
          salePrice: undefined,
          total: 0,
        }))
      )
      stores.forEach(s => { s.total = s.price })
    }

    const cheapestStore = stores.reduce((a, b) => a.price < b.price ? a : b, stores[0])
    const maxPrice = Math.max(...stores.map(s => s.price))
    const savings = maxPrice - cheapestStore.price

    return { ingredient, stores, cheapestStore: cheapestStore.storeName, savings }
  })

  return NextResponse.json({ comparisons })
}
