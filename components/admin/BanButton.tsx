'use client'

import { useState } from 'react'
import { Ban, CheckCircle } from 'lucide-react'

export function BanButton({ type, target, isBannedInitially = false }: { type: 'user' | 'note', target: string, isBannedInitially?: boolean }) {
  const [isBanned, setIsBanned] = useState(isBannedInitially)
  const [loading, setLoading] = useState(false)

  const toggleBan = async () => {
    setLoading(true)
    try {
      const action = isBanned ? 'unban' : 'ban'
      const res = await fetch('/api/admin/ban', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, target, action })
      })
      if (res.ok) {
        setIsBanned(!isBanned)
      } else {
        alert('Failed to update ban status')
      }
    } catch (e) {
      alert('Error updating ban status')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggleBan}
      disabled={loading}
      className={`p-1.5 rounded-lg transition-colors ${
        isBanned 
          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' 
          : 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
      }`}
      title={isBanned ? 'Unban' : 'Ban'}
    >
      {loading ? (
        <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      ) : isBanned ? (
        <CheckCircle size={16} />
      ) : (
        <Ban size={16} />
      )}
    </button>
  )
}
