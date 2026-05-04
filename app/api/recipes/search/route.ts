import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { searchParams } = new URL(req.url)

  const q = searchParams.get('q') ?? ''
  const diet = searchParams.get('diet')
  const maxTime = searchParams.get('maxTime')
  const cuisine = searchParams.get('cuisine')
  const page = parseInt(searchParams.get('page') ?? '1', 10)
  const limit = parseInt(searchParams.get('limit') ?? '20', 10)
  const offset = (page - 1) * limit

  let query = supabase
    .from('recipes')
    .select('*', { count: 'exact' })
    .eq('is_public', true)
    .range(offset, offset + limit - 1)
    .order('created_at', { ascending: false })

  if (q.trim()) {
    query = query.textSearch('search_text', q.trim(), { type: 'websearch' })
  }

  if (diet) {
    query = query.contains('dietary_tags', [diet])
  }

  if (maxTime) {
    query = query.lte('prep_time_minutes', parseInt(maxTime, 10))
  }

  if (cuisine) {
    query = query.ilike('cuisine', `%${cuisine}%`)
  }

  const { data: recipes, error, count } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    recipes: recipes ?? [],
    total: count ?? 0,
    page,
    limit,
    hasMore: (count ?? 0) > offset + limit,
  })
}
