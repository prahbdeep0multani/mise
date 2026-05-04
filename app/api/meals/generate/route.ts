import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { weekStarting, mealIds } = body

  if (!weekStarting || !Array.isArray(mealIds) || mealIds.length === 0) {
    return NextResponse.json({ error: 'weekStarting and mealIds required' }, { status: 400 })
  }

  // Fetch recipe data for the given meal IDs
  const { data: meals, error } = await supabase
    .from('meals')
    .select('*, recipe:recipes(*)')
    .in('id', mealIds)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ meals })
}
