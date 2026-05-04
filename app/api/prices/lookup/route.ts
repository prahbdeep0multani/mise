import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { ingredient, stores, zipCode } = await req.json()
  if (!ingredient) return NextResponse.json({ error: 'ingredient required' }, { status: 400 })

  const { data: prices, error } = await supabase
    .from('store_prices')
    .select('*')
    .ilike('ingredient_name', `%${ingredient}%`)
    .in('store_name', stores ?? ['Whole Foods', "Trader Joe's", 'Kroger'])
    .order('price')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ prices: prices ?? [] })
}
