import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { budget = 80, dietary = {}, prepTimeMax = 45, servings = 2, dislikedIngredients = [], weekStarting } = body

  const dietaryList = Object.entries(dietary)
    .filter(([, v]) => v)
    .map(([k]) => k)
    .join(', ') || 'no restrictions'

  const avoided = dislikedIngredients.length > 0 ? `Avoid: ${dislikedIngredients.join(', ')}.` : ''

  const prompt = `Generate a 7-day meal plan for ${servings} people.
Budget: $${budget}/week (approx $${(budget / 7).toFixed(2)}/meal).
Dietary: ${dietaryList}.
Max prep time: ${prepTimeMax} minutes.
${avoided}

Return ONLY valid JSON (no markdown) in this exact format:
{
  "meals": [
    {
      "day": 0,
      "dayName": "Monday",
      "meal": "Meal Name",
      "description": "Brief description",
      "prepTime": 30,
      "estimatedCost": 8.50,
      "ingredients": [{"item": "pasta", "qty": 200, "unit": "g"}],
      "nutrition": {"calories": 450, "protein": 15, "carbs": 60, "fat": 12, "fiber": 4}
    }
  ],
  "totalCost": 62.50,
  "avgCaloriesPerDay": 1800,
  "shoppingList": []
}`

  try {
    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 4096,
      stream: true,
      system: 'You are an expert meal planner. Always respond with valid JSON only, no markdown code blocks.',
      messages: [{ role: 'user', content: prompt }],
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
            controller.enqueue(encoder.encode(event.delta.text))
          }
        }
        controller.close()
      },
    })

    return new NextResponse(readable, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('Claude API error:', err)
    return NextResponse.json({ error: 'AI generation failed' }, { status: 500 })
  }
}
