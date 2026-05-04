import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Called daily at 2 AM UTC via Vercel Cron
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Sample staple items to track prices for (extend as needed)
  const stapleItems = [
    'chicken breast', 'ground beef', 'eggs', 'milk', 'butter',
    'pasta', 'rice', 'bread', 'spinach', 'tomatoes', 'onions',
    'garlic', 'olive oil', 'canned tomatoes', 'black beans',
  ]

  const stores = ['Whole Foods', "Trader Joe's", 'Kroger', 'Costco', 'Amazon Fresh']
  const today = new Date().toISOString().split('T')[0]

  // In production, replace this with real API calls to Instacart, Kroger APIs, etc.
  // For now, simulate price data with slight variations
  const priceData = []
  for (const ingredient of stapleItems) {
    const basePrice = 1.5 + Math.random() * 10
    for (const store of stores) {
      priceData.push({
        ingredient_name: ingredient,
        store_name: store,
        store_location: 'US',
        price: parseFloat((basePrice * (0.75 + Math.random() * 0.6)).toFixed(2)),
        unit: 'unit',
        last_updated: new Date().toISOString(),
        indexed_at: today,
      })
    }
  }

  const { error } = await supabase.from('store_prices').upsert(priceData, {
    onConflict: 'ingredient_name,store_name,indexed_at',
    ignoreDuplicates: false,
  })

  if (error) {
    console.error('Price sync error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, synced: priceData.length })
}
