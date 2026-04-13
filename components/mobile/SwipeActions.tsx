'use client'
// components/mobile/SwipeActions.tsx
// Wrap around NoteCard for swipe-to-delete / swipe-to-favorite on mobile
// Usage: <SwipeActions onDelete={...} onFavorite={...}><NoteCard .../></SwipeActions>

import { useRef, useState } from 'react'
import { Trash2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SwipeActionsProps {
  children: React.ReactNode
  onDelete: () => void
  onFavorite: () => void
  isFavorite?: boolean
}

const THRESHOLD = 80

export default function SwipeActions({
  children,
  onDelete,
  onFavorite,
  isFavorite,
}: SwipeActionsProps) {
  const [offset, setOffset] = useState(0)
  const startX = useRef(0)
  const isDragging = useRef(false)

  function onTouchStart(e: React.TouchEvent) {
    startX.current = e.touches[0].clientX
    isDragging.current = true
  }

  function onTouchMove(e: React.TouchEvent) {
    if (!isDragging.current) return
    const dx = e.touches[0].clientX - startX.current
    // Left swipe: reveal delete (negative offset, max -140)
    // Right swipe: reveal favorite (positive offset, max 80)
    const clamped = Math.max(-140, Math.min(80, dx))
    setOffset(clamped)
  }

  function onTouchEnd() {
    isDragging.current = false
    if (offset < -THRESHOLD) {
      // Snapped to delete zone
      setOffset(-140)
    } else if (offset > THRESHOLD) {
      // Trigger favorite immediately
      onFavorite()
      setOffset(0)
    } else {
      setOffset(0)
    }
  }

  function handleDelete() {
    setOffset(0)
    onDelete()
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Left action: Favorite */}
      <div
        className="absolute inset-y-0 left-0 w-20 flex items-center justify-center bg-[var(--p-amber)]/20 rounded-l-2xl"
        style={{ opacity: Math.max(0, offset / 80) }}
      >
        <Star
          size={24}
          className={cn(
            'transition-all',
            isFavorite
              ? 'fill-[var(--p-amber)] text-[var(--p-amber)]'
              : 'text-[var(--p-amber)]'
          )}
        />
      </div>

      {/* Right action: Delete */}
      <div
        className="absolute inset-y-0 right-0 w-36 flex items-center justify-end pr-6 bg-red-500/20 rounded-r-2xl gap-3"
        style={{ opacity: Math.max(0, -offset / 140) }}
      >
        <button
          onClick={handleDelete}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl text-sm font-medium"
        >
          <Trash2 size={15} />
          Delete
        </button>
      </div>

      {/* Card */}
      <div
        className="relative transition-transform duration-150"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </div>
  )
}
