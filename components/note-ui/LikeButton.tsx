'use client'

import { useEffect, useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LikeButtonProps {
  username: string
  slug: string
  initialCount: number
}

export default function LikeButton({ username, slug, initialCount }: LikeButtonProps) {
  const [count, setCount] = useState(initialCount)
  const [liked, setLiked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const storageKey = `noteflow:liked:${username}/${slug}`

  useEffect(() => {
    setLiked(localStorage.getItem(storageKey) === '1')
  }, [storageKey])

  const handleLike = useCallback(async () => {
    if (liked || isSubmitting) return
    setIsSubmitting(true)

    // Optimistic update — instant feedback, no waiting on GitHub round-trip
    setLiked(true)
    setCount((c) => c + 1)
    localStorage.setItem(storageKey, '1')

    try {
      const res = await fetch('/api/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, slug }),
      })
      if (res.ok) {
        const data = await res.json()
        if (typeof data.count === 'number') setCount(data.count)
      } else {
        // Roll back on failure
        setLiked(false)
        setCount((c) => Math.max(0, c - 1))
        localStorage.removeItem(storageKey)
      }
    } catch {
      setLiked(false)
      setCount((c) => Math.max(0, c - 1))
      localStorage.removeItem(storageKey)
    } finally {
      setIsSubmitting(false)
    }
  }, [liked, isSubmitting, storageKey, username, slug])

  return (
    <button
      onClick={handleLike}
      disabled={liked || isSubmitting}
      aria-pressed={liked}
      className={cn(
        'interactive-scale flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold border transition-all',
        liked
          ? 'bg-red-500/10 border-red-500/30 text-red-500'
          : 'bg-[var(--muted)] border-transparent text-[var(--muted-text)] hover:border-red-500/30 hover:text-red-500'
      )}
    >
      <Heart size={16} className={cn(liked && 'fill-red-500')} />
      {count > 0 ? count : 'Like'}
    </button>
  )
}
