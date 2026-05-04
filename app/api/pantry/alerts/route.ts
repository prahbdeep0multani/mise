import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addDays, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const days = parseInt(searchParams.get('days') ?? '3', 10)
  const cutoff = format(addDays(new Date(), days), 'yyyy-MM-dd')

  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', user.id)
    .not('expires_at', 'is', null)
    .lte('expires_at', cutoff)
    .gte('expires_at', format(new Date(), 'yyyy-MM-dd'))
    .order('expires_at')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data })
}
