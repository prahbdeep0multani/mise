import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { consolidateIngredients, sortByAisle } from '@/lib/utils/optimization'
import type { Recipe, PantryItem } from '@/lib/types/database'
import type { Ingredient } from '@/lib/types/models'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { weekStarting } = await req.json()
  if (!weekStarting) return NextResponse.json({ error: 'weekStarting required' }, { status: 400 })

  // Fetch meals + recipes for the week
  const { data: meals, error: mealsError } = await supabase
    .from('meals')
    .select('*, recipe:recipes(*)')
    .eq('user_id', user.id)
    .eq('week_starting', weekStarting)

  if (mealsError) return NextResponse.json({ error: mealsError.message }, { status: 500 })

  // Fetch pantry
  const { data: pantry, error: pantryError } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', user.id)

  if (pantryError) return NextResponse.json({ error: pantryError.message }, { status: 500 })

  const recipes = (meals ?? []).map((m: { recipe: Recipe }) => m.recipe).filter(Boolean)
  const consolidated = consolidateIngredients(recipes as Recipe[], (pantry ?? []) as PantryItem[])
  const sorted = sortByAisle(consolidated)

  // Create or update grocery list
  const { data: existingList } = await supabase
    .from('grocery_lists')
    .select('id')
    .eq('user_id', user.id)
    .eq('week_starting', weekStarting)
    .single()

  let listId: string

  if (existingList) {
    listId = existingList.id
    await supabase.from('grocery_items').delete().eq('grocery_list_id', listId)
  } else {
    const { data: newList, error: createError } = await supabase
      .from('grocery_lists')
      .insert({ user_id: user.id, week_starting: weekStarting, status: 'draft' })
      .select()
      .single()

    if (createError || !newList) return NextResponse.json({ error: 'Failed to create list' }, { status: 500 })
    listId = newList.id
  }

  // Insert items
  if (sorted.length > 0) {
    const items = sorted.map(item => ({
      grocery_list_id: listId,
      ingredient_name: item.name,
      quantity: item.totalQty,
      unit: item.unit,
      category: item.category,
      is_from_pantry: item.inPantry,
    }))

    await supabase.from('grocery_items').insert(items)
  }

  const total = sorted.reduce((sum, item) => sum + item.totalQty, 0)

  return NextResponse.json({ items: sorted, total, listId })
}
