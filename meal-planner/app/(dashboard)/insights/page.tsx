'use client'

import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, Loader2, TrendingUp, Leaf, DollarSign } from 'lucide-react'
import { useAIStore } from '@/lib/stores/aiStore'
import { useMealStore } from '@/lib/stores/mealStore'
import { useGroceryStore } from '@/lib/stores/groceryStore'
import { useAuth } from '@/lib/hooks/useAuth'
import { formatCurrency } from '@/lib/utils/formatting'
import NutritionDashboard from '@/components/insights/NutritionDashboard'
import CostChart from '@/components/insights/CostChart'
import WasteReductionTips from '@/components/insights/WasteReductionTips'
import type { AIMessage } from '@/lib/types/models'

export default function InsightsPage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'nutrition' | 'costs' | 'waste'>('chat')
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { conversations, addMessage, isStreaming, setIsStreaming, appendToStream, clearStream, streamingContent } = useAIStore()
  const { currentWeek } = useMealStore()
  const { pantryItems } = useGroceryStore()
  const { user } = useAuth()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversations, streamingContent])

  async function sendMessage() {
    if (!input.trim() || isStreaming) return

    const userMsg: AIMessage = { role: 'user', content: input, timestamp: new Date().toISOString() }
    addMessage(userMsg)
    setInput('')
    setIsStreaming(true)
    clearStream()

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: { weekStarting: currentWeek, pantryItems: pantryItems.map(i => i.ingredient_name) },
        }),
      })

      if (!res.body) throw new Error('No body')

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let fullText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        fullText += chunk
        appendToStream(chunk)
      }

      addMessage({ role: 'assistant', content: fullText, timestamp: new Date().toISOString() })
      clearStream()
    } catch (err) {
      addMessage({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.', timestamp: new Date().toISOString() })
    } finally {
      setIsStreaming(false)
      clearStream()
    }
  }

  const TABS = [
    { id: 'chat', label: 'AI Chat', icon: Sparkles },
    { id: 'nutrition', label: 'Nutrition', icon: TrendingUp },
    { id: 'costs', label: 'Costs', icon: DollarSign },
    { id: 'waste', label: 'Waste Tips', icon: Leaf },
  ] as const

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === id ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Chat tab */}
      {activeTab === 'chat' && (
        <div className="flex flex-col flex-1 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {conversations.length === 0 && !isStreaming && (
              <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                <Sparkles className="w-12 h-12 text-emerald-300 mb-3" />
                <h3 className="font-semibold text-gray-700 mb-1">Ask Claude anything</h3>
                <p className="text-sm text-gray-400 max-w-xs">
                  Get meal suggestions, ingredient substitutions, recipe tips, waste reduction advice, and more.
                </p>
                <div className="mt-6 flex flex-wrap gap-2 justify-center">
                  {[
                    "What can I cook with what's expiring?",
                    "Give me a budget-friendly meal plan",
                    "Suggest protein-rich breakfasts",
                    "How do I use up leftover chicken?",
                  ].map(prompt => (
                    <button
                      key={prompt}
                      onClick={() => setInput(prompt)}
                      className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-xs text-gray-600 hover:bg-emerald-50 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {conversations.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            ))}

            {isStreaming && streamingContent && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-3 bg-gray-100 text-gray-800">
                  <p className="text-sm whitespace-pre-wrap">{streamingContent}</p>
                  <span className="inline-block w-1.5 h-4 bg-gray-400 animate-pulse ml-0.5 align-middle" />
                </div>
              </div>
            )}

            {isStreaming && !streamingContent && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm px-4 py-3 bg-gray-100 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                  <span className="text-sm text-gray-400">Thinking…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } }}
                placeholder="Ask about meals, ingredients, nutrition…"
                disabled={isStreaming}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-gray-50"
              />
              <button
                onClick={sendMessage}
                disabled={!input.trim() || isStreaming}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'nutrition' && <NutritionDashboard weekStarting={currentWeek} />}
      {activeTab === 'costs' && <CostChart weekStarting={currentWeek} />}
      {activeTab === 'waste' && <WasteReductionTips pantryItems={pantryItems} />}
    </div>
  )
}
