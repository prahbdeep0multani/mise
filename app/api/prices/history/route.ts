import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const ingredient = searchParams.get('ingredient')
  if (!ingredient) return NextResponse.json({ error: 'ingredient required' }, { status: 400 })

  const { data, error } = await supabase
    .from('store_prices')
    .select('store_name, price, last_updated')
    .ilike('ingredient_name', `%${ingredient}%`)
    .order('last_updated', { ascending: false })
    .limit(100)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ history: data })
}
