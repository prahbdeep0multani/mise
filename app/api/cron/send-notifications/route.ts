import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { addDays, format } from 'date-fns'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const cutoff = format(addDays(new Date(), 3), 'yyyy-MM-dd')
  const today = format(new Date(), 'yyyy-MM-dd')

  // Get all users with expiring pantry items
  const { data: expiringItems } = await supabase
    .from('pantry_items')
    .select('user_id, ingredient_name, expires_at, users(email)')
    .not('expires_at', 'is', null)
    .lte('expires_at', cutoff)
    .gte('expires_at', today)

  if (!expiringItems || expiringItems.length === 0) {
    return NextResponse.json({ success: true, notified: 0 })
  }

  // Group by user
  const byUser: Record<string, { email: string; items: string[] }> = {}
  for (const item of expiringItems) {
    const userId = item.user_id
    const user = item.users as { email?: string } | null
    if (!byUser[userId]) {
      byUser[userId] = { email: user?.email ?? '', items: [] }
    }
    byUser[userId].items.push(`${item.ingredient_name} (expires ${item.expires_at})`)
  }

  // In production: send emails via Resend or SendGrid
  // For now, just log
  console.log(`[Cron] Would notify ${Object.keys(byUser).length} users about expiring items`)
  for (const [userId, { email, items }] of Object.entries(byUser)) {
    console.log(`  ${email}: ${items.join(', ')}`)
  }

  return NextResponse.json({ success: true, notified: Object.keys(byUser).length })
}
