'use client'
// components/editor/DrawingCanvas.tsx
// Finger/mouse drawing with shapes — add as a tab in the note editor
// Usage: <DrawingCanvas data={note.drawingData} onChange={(d) => saveDrawing(d)} />

import { useRef, useState, useEffect, useCallback } from 'react'
import { Pencil, Square, Circle, Minus, Eraser, Trash2, Download, Undo } from 'lucide-react'
import { cn } from '@/lib/utils'

type Tool = 'pen' | 'line' | 'rect' | 'circle' | 'eraser'
type Shape = {
  id: string
  type: Tool
  points?: number[]
  x?: number; y?: number; w?: number; h?: number
  color: string
  size: number
}

const COLORS = ['#1a1a1a', '#7F77DD', '#1D9E75', '#EF9F27', '#E24B4A', '#378ADD', '#888780']

interface DrawingCanvasProps {
  data?: string
  onChange?: (data: string) => void
}

export default function DrawingCanvas({ data, onChange }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [tool, setTool] = useState<Tool>('pen')
  const [color, setColor] = useState('#1a1a1a')
  const [size, setSize] = useState(3)
  const [shapes, setShapes] = useState<Shape[]>([])
  const [history, setHistory] = useState<Shape[][]>([[]])
  const drawing = useRef(false)
  const currentShape = useRef<Shape | null>(null)
  const startPos = useRef({ x: 0, y: 0 })

  // Load saved data
  useEffect(() => {
    if (!data) return
    try {
      const parsed = JSON.parse(data)
      setShapes(parsed)
      setHistory([parsed])
    } catch {}
  }, [])

  // Redraw on shapes change
  useEffect(() => {
    redraw()
  }, [shapes])

  function getPos(e: React.TouchEvent | React.MouseEvent | TouchEvent | MouseEvent) {
    const canvas = canvasRef.current!
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height
    if ('touches' in e && e.touches.length > 0) {
      return {
        x: (e.touches[0].clientX - rect.left) * scaleX,
        y: (e.touches[0].clientY - rect.top) * scaleY,
      }
    }
    return {
      x: ((e as MouseEvent).clientX - rect.left) * scaleX,
      y: ((e as MouseEvent).clientY - rect.top) * scaleY,
    }
  }

  function redraw(shapesToDraw = shapes) {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    for (const s of shapesToDraw) {
      ctx.strokeStyle = s.color
      ctx.lineWidth = s.size
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      if (s.type === 'pen' && s.points && s.points.length >= 4) {
        ctx.beginPath()
        ctx.moveTo(s.points[0], s.points[1])
        for (let i = 2; i < s.points.length; i += 2) {
          ctx.lineTo(s.points[i], s.points[i + 1])
        }
        ctx.stroke()
      } else if (s.type === 'line' && s.points) {
        ctx.beginPath()
        ctx.moveTo(s.points[0], s.points[1])
        ctx.lineTo(s.points[2], s.points[3])
        ctx.stroke()
      } else if (s.type === 'rect' && s.x !== undefined) {
        ctx.strokeRect(s.x, s.y!, s.w!, s.h!)
      } else if (s.type === 'circle' && s.x !== undefined) {
        ctx.beginPath()
        const rx = Math.abs(s.w!) / 2
        const ry = Math.abs(s.h!) / 2
        ctx.ellipse(s.x + (s.w! / 2), s.y! + (s.h! / 2), rx, ry, 0, 0, Math.PI * 2)
        ctx.stroke()
      }
    }
  }

  function onStart(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault()
    drawing.current = true
    const pos = getPos(e)
    startPos.current = pos

    const id = Math.random().toString(36).slice(2)
    if (tool === 'pen') {
      currentShape.current = { id, type: 'pen', points: [pos.x, pos.y], color, size }
    } else if (tool === 'eraser') {
      currentShape.current = { id, type: 'pen', points: [pos.x, pos.y], color: '#ffffff', size: size * 4 }
    } else if (tool === 'line') {
      currentShape.current = { id, type: 'line', points: [pos.x, pos.y, pos.x, pos.y], color, size }
    } else if (tool === 'rect') {
      currentShape.current = { id, type: 'rect', x: pos.x, y: pos.y, w: 0, h: 0, color, size }
    } else if (tool === 'circle') {
      currentShape.current = { id, type: 'circle', x: pos.x, y: pos.y, w: 0, h: 0, color, size }
    }
  }

  function onMove(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault()
    if (!drawing.current || !currentShape.current) return
    const pos = getPos(e)
    const s = currentShape.current

    if (s.type === 'pen' && s.points) {
      s.points.push(pos.x, pos.y)
    } else if (s.type === 'line' && s.points) {
      s.points[2] = pos.x; s.points[3] = pos.y
    } else if ((s.type === 'rect' || s.type === 'circle') && s.x !== undefined) {
      s.w = pos.x - s.x!; s.h = pos.y - s.y!
    }
    redraw([...shapes, s])
  }

  function onEnd(e: React.TouchEvent | React.MouseEvent) {
    e.preventDefault()
    if (!drawing.current || !currentShape.current) return
    drawing.current = false
    const newShapes = [...shapes, currentShape.current]
    currentShape.current = null
    setShapes(newShapes)
    setHistory((h) => [...h, newShapes])
    onChange?.(JSON.stringify(newShapes))
  }

  function undo() {
    if (history.length <= 1) return
    const prev = history[history.length - 2]
    setShapes(prev)
    setHistory((h) => h.slice(0, -1))
    onChange?.(JSON.stringify(prev))
  }

  function clear() {
    setShapes([])
    setHistory([[]])
    onChange?.('[]')
  }

  function download() {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = 'drawing.png'
    link.href = canvas.toDataURL()
    link.click()
  }

  const tools: { id: Tool; icon: React.ReactNode; label: string }[] = [
    { id: 'pen', icon: <Pencil size={16} />, label: 'Pen' },
    { id: 'line', icon: <Minus size={16} />, label: 'Line' },
    { id: 'rect', icon: <Square size={16} />, label: 'Rectangle' },
    { id: 'circle', icon: <Circle size={16} />, label: 'Circle' },
    { id: 'eraser', icon: <Eraser size={16} />, label: 'Eraser' },
  ]

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 p-2 bg-[var(--muted)] rounded-xl">
        {/* Tools */}
        <div className="flex gap-1">
          {tools.map((t) => (
            <button
              key={t.id}
              title={t.label}
              onClick={() => setTool(t.id)}
              className={cn(
                'w-8 h-8 rounded-lg flex items-center justify-center transition-all',
                tool === t.id
                  ? 'bg-[var(--p-purple)] text-white'
                  : 'text-[var(--muted-text)] hover:bg-[var(--card-bg)]'
              )}
            >
              {t.icon}
            </button>
          ))}
        </div>

        <div className="w-px h-6 bg-[var(--border)]" />

        {/* Colors */}
        <div className="flex gap-1.5">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                'w-5 h-5 rounded-full border-2 transition-transform hover:scale-110',
                color === c ? 'border-[var(--foreground)] scale-110' : 'border-transparent'
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>

        <div className="w-px h-6 bg-[var(--border)]" />

        {/* Brush size */}
        <input
          type="range"
          min="1"
          max="20"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="w-20 accent-[var(--p-purple)]"
          title="Brush size"
        />

        <div className="ml-auto flex gap-1">
          <button onClick={undo} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-text)] hover:bg-[var(--card-bg)] transition-all" title="Undo">
            <Undo size={15} />
          </button>
          <button onClick={download} className="w-8 h-8 rounded-lg flex items-center justify-center text-[var(--muted-text)] hover:bg-[var(--card-bg)] transition-all" title="Download">
            <Download size={15} />
          </button>
          <button onClick={clear} className="w-8 h-8 rounded-lg flex items-center justify-center text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-all" title="Clear all">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={700}
        className="w-full rounded-xl border border-[var(--border)] bg-white touch-none cursor-crosshair"
        style={{ touchAction: 'none' }}
        onMouseDown={onStart}
        onMouseMove={onMove}
        onMouseUp={onEnd}
        onMouseLeave={onEnd}
        onTouchStart={onStart}
        onTouchMove={onMove}
        onTouchEnd={onEnd}
      />
    </div>
  )
}
