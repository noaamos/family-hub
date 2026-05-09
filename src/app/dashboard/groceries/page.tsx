'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { CATEGORIES, getCategoryMeta } from '@/lib/categorize'

type Creator = { id: string; name: string; color: string }
type GroceryItem = {
  id: string
  name: string
  category: string
  quantity?: string
  checked: boolean
  creator: Creator
}

export default function GroceriesPage() {
  const [items, setItems] = useState<GroceryItem[]>([])
  const [input, setInput] = useState('')
  const [quantity, setQuantity] = useState('')
  const [loading, setLoading] = useState(false)
  const [showChecked, setShowChecked] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const fetchItems = useCallback(async () => {
    const res = await fetch('/api/groceries')
    if (res.ok) setItems(await res.json())
  }, [])

  useEffect(() => { fetchItems() }, [fetchItems])

  async function addItem(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim()) return
    setLoading(true)
    await fetch('/api/groceries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: input.trim(), quantity: quantity.trim() }),
    })
    setInput('')
    setQuantity('')
    setLoading(false)
    fetchItems()
    inputRef.current?.focus()
  }

  async function toggleItem(id: string) {
    await fetch(`/api/groceries/${id}/check`, { method: 'POST' })
    fetchItems()
  }

  async function deleteItem(id: string) {
    await fetch(`/api/groceries/${id}`, { method: 'DELETE' })
    fetchItems()
  }

  async function clearChecked() {
    await fetch('/api/groceries/clear', { method: 'POST' })
    fetchItems()
  }

  const unchecked = items.filter((i) => !i.checked)
  const checked = items.filter((i) => i.checked)

  // Group unchecked by category
  const grouped = CATEGORIES.reduce<Record<string, GroceryItem[]>>((acc, cat) => {
    const catItems = unchecked.filter((i) => i.category === cat.id)
    if (catItems.length > 0) acc[cat.id] = catItems
    return acc
  }, {})

  const total = items.length
  const doneCount = checked.length

  return (
    <div className="max-w-lg mx-auto" dir="rtl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">רשימת קניות</h1>
          {total > 0 && (
            <p className="text-sm text-gray-400 mt-0.5">
              {doneCount}/{total} פריטים
            </p>
          )}
        </div>
        {doneCount > 0 && (
          <button
            onClick={clearChecked}
            className="text-sm text-red-400 hover:text-red-600 transition"
          >
            נקה שנאספו ({doneCount})
          </button>
        )}
      </div>

      {/* Add item form */}
      <form onSubmit={addItem} className="flex gap-2 mb-6">
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="הוסף פריט... (למשל: חלב, עגבניות)"
          className="flex-1 border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
          autoComplete="off"
        />
        <input
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          placeholder="כמות"
          className="w-20 border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-right"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition disabled:opacity-50"
        >
          +
        </button>
      </form>

      {/* Empty state */}
      {total === 0 && (
        <div className="text-center py-16 text-gray-400">
          <div className="text-5xl mb-3">🛒</div>
          <p className="font-medium">הרשימה ריקה</p>
          <p className="text-sm mt-1">הוסף פריטים למעלה</p>
        </div>
      )}

      {/* Grouped unchecked items */}
      <div className="space-y-5">
        {Object.entries(grouped).map(([catId, catItems]) => {
          const meta = getCategoryMeta(catId)
          return (
            <div key={catId}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{meta.emoji}</span>
                <span className="text-sm font-semibold text-gray-700">{meta.label}</span>
                <span className="text-xs text-gray-400">({catItems.length})</span>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {catItems.map((item, idx) => (
                  <GroceryRow
                    key={item.id}
                    item={item}
                    onToggle={toggleItem}
                    onDelete={deleteItem}
                    divider={idx < catItems.length - 1}
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      {/* Checked items */}
      {checked.length > 0 && (
        <div className="mt-6">
          <button
            onClick={() => setShowChecked((v) => !v)}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 mb-2 transition"
          >
            <span>{showChecked ? '▾' : '▸'}</span>
            <span>נאספו ({checked.length})</span>
          </button>
          {showChecked && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden opacity-60">
              {checked.map((item, idx) => (
                <GroceryRow
                  key={item.id}
                  item={item}
                  onToggle={toggleItem}
                  onDelete={deleteItem}
                  divider={idx < checked.length - 1}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function GroceryRow({
  item,
  onToggle,
  onDelete,
  divider,
}: {
  item: GroceryItem
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  divider: boolean
}) {
  const meta = getCategoryMeta(item.category)

  return (
    <div className={`flex items-center gap-3 px-4 py-3 ${divider ? 'border-b border-gray-50' : ''}`}>
      <button
        onClick={() => onDelete(item.id)}
        className="text-gray-200 hover:text-red-400 transition text-lg leading-none flex-shrink-0"
      >
        ×
      </button>
      <div className="flex-1 min-w-0">
        <span className={`text-sm ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
          {item.name}
        </span>
        {item.quantity && (
          <span className="text-xs text-gray-400 mr-2">{item.quantity}</span>
        )}
      </div>
      <span className="text-base flex-shrink-0">{meta.emoji}</span>
      <button
        onClick={() => onToggle(item.id)}
        className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition ${
          item.checked
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-300 hover:border-indigo-400'
        }`}
      >
        {item.checked && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>
    </div>
  )
}
