import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const listId = searchParams.get('listId')
  const format = searchParams.get('format') ?? 'csv'

  if (!listId) return NextResponse.json({ error: 'listId required' }, { status: 400 })

  const { data: list, error } = await supabase
    .from('grocery_lists')
    .select('*, items:grocery_items(*)')
    .eq('id', listId)
    .eq('user_id', user.id)
    .single()

  if (error || !list) return NextResponse.json({ error: 'List not found' }, { status: 404 })

  const items = list.items ?? []

  if (format === 'csv') {
    const rows = ['Ingredient,Quantity,Unit,Category,Purchased']
    for (const item of items) {
      rows.push(`"${item.ingredient_name}",${item.quantity},"${item.unit ?? ''}","${item.category ?? ''}",${item.is_purchased ? 'Yes' : 'No'}`)
    }
    const csv = rows.join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="grocery-list-${list.week_starting}.csv"`,
      },
    })
  }

  // Minimal text/plain "PDF" fallback (real PDF would need a library like pdfkit)
  const text = items.map((item: { ingredient_name: string; quantity: number; unit?: string }) =>
    `- ${item.ingredient_name}: ${item.quantity} ${item.unit ?? ''}`
  ).join('\n')

  return new NextResponse(`Grocery List\nWeek of ${list.week_starting}\n\n${text}`, {
    headers: {
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="grocery-list-${list.week_starting}.txt"`,
    },
  })
}
