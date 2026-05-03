'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[Global Error Boundary]', error)
  }, [error])

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-8">
        <AlertCircle size={40} />
      </div>
      
      <h2 className="text-3xl font-black text-white mb-4 tracking-tight">Something went wrong</h2>
      <p className="text-[#a1a1aa] mb-10 max-w-md mx-auto leading-relaxed">
        An unexpected error occurred. This is usually due to a connection issue or missing configuration.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
        <button
          onClick={() => reset()}
          className="flex items-center justify-center gap-2 px-6 py-4 bg-white text-black rounded-2xl font-bold shadow-xl active:scale-95 transition-all"
        >
          <RefreshCw size={20} />
          Try again
        </button>
        
        <Link 
          href="/"
          className="flex items-center justify-center gap-2 px-6 py-4 bg-[#111114] border border-white/10 text-white rounded-2xl font-bold active:scale-95 transition-all"
        >
          <Home size={20} />
          Go Home
        </Link>
      </div>

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-12 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl text-left max-w-2xl overflow-auto">
          <p className="text-xs font-mono text-red-400 whitespace-pre-wrap">{error.stack}</p>
        </div>
      )}
    </div>
  )
}
