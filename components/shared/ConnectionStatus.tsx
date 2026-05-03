'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff, Wifi } from 'lucide-react'

export default function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <AnimatePresence>
      {(!isOnline || (isOnline && showStatus)) && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] pointer-events-none"
        >
          <div className={`
            flex items-center gap-2 px-4 py-2 rounded-full border shadow-2xl backdrop-blur-xl transition-colors duration-500
            ${isOnline 
              ? 'bg-green-500/10 border-green-500/20 text-green-500' 
              : 'bg-amber-500/10 border-amber-500/20 text-amber-500'}
          `}>
            {isOnline ? <Wifi size={16} /> : <WifiOff size={16} />}
            <span className="text-xs font-bold uppercase tracking-widest">
              {isOnline ? 'Back Online' : 'Working Offline'}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
