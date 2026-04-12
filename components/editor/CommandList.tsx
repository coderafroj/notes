'use client'

import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CommandListProps {
  items: any[]
  command: (item: any) => void
}

const CommandList = forwardRef((props: CommandListProps, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  const selectItem = (index: number) => {
    const item = props.items[index]
    if (item) {
      props.command(item)
    }
  }

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length)
  }

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length)
  }

  const enterHandler = () => {
    selectItem(selectedIndex)
  }

  useEffect(() => setSelectedIndex(0), [props.items])

  useImperativeHandle(ref, () => ({
    onKeyDown: ({ event }: { event: KeyboardEvent }) => {
      if (event.key === 'ArrowUp') {
        upHandler()
        return true
      }

      if (event.key === 'ArrowDown') {
        downHandler()
        return true
      }

      if (event.key === 'Enter') {
        enterHandler()
        return true
      }

      return false
    },
  }))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-2xl p-2 min-w-[240px] max-h-[400px] overflow-y-auto scrollbar-hide z-[99999] glass-card"
    >
      <div className="flex flex-col gap-1">
        {props.items.length > 0 ? (
          props.items.map((item: any, index: number) => (
            <button
              key={index}
              onClick={() => selectItem(index)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group',
                index === selectedIndex
                  ? 'bg-[var(--p-purple)] text-white shadow-lg'
                  : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center p-2 rounded-lg shrink-0',
                  index === selectedIndex
                    ? 'bg-white/20'
                    : 'bg-[var(--muted)] text-[var(--p-purple)] group-hover:bg-white/50'
                )}
              >
                {item.icon}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-semibold truncate leading-none mb-1">
                  {item.title}
                </span>
                <span
                  className={cn(
                    'text-[10px] truncate leading-none',
                    index === selectedIndex ? 'text-white/70' : 'text-[var(--muted-text)]'
                  )}
                >
                  {item.description}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="px-3 py-4 text-center text-sm text-[var(--muted-text)]">
            No results found
          </div>
        )}
      </div>
    </motion.div>
  )
})

CommandList.displayName = 'CommandList'

export default CommandList
