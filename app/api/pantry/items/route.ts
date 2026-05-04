import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { validatePantryItem } from '@/lib/utils/validation'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', user.id)
    .order('category')
    .order('ingredient_name')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ items: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { valid, errors } = validatePantryItem(body)
  if (!valid) return NextResponse.json({ error: errors.join(', ') }, { status: 400 })

  const { data, error } = await supabase
    .from('pantry_items')
    .upsert({
      user_id: user.id,
      ingredient_name: body.ingredient_name.trim().toLowerCase(),
      quantity: body.quantity,
      unit: body.unit,
      category: body.category,
      expires_at: body.expires_at ?? null,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id,ingredient_name' })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data }, { status: 201 })
}

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const body = await req.json()
  const updates: Record<string, unknown> = {}
  const allowed = ['quantity', 'unit', 'category', 'expires_at']
  for (const field of allowed) {
    if (field in body) updates[field] = body[field]
  }
  updates.updated_at = new Date().toISOString()

  const { data, error } = await supabase
    .from('pantry_items')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ item: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('pantry_items')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
