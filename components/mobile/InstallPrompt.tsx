'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, Star, Share } from 'lucide-react'

export default function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if the app is already installed
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches 
      || (window.navigator as any).standalone 
      || document.referrer.includes('android-app://')

    if (isStandalone) return

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      
      // Delay showing the prompt to make it feel less intrusive
      const timer = setTimeout(() => {
        setShowPrompt(true)
      }, 5000)

      return () => clearTimeout(timer)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    console.log(`User response to the install prompt: ${outcome}`)

    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-24 left-4 right-4 z-[100] lg:hidden"
        >
          <div className="bg-[var(--foreground)] text-[var(--background)] p-4 rounded-2xl shadow-2xl flex items-center gap-4 border border-white/10">
            <div className="w-12 h-12 rounded-xl bg-[var(--p-purple)] flex items-center justify-center shrink-0 shadow-lg">
              <Star className="text-white fill-current" size={24} />
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-sm truncate">Install Noteflow</h3>
              <p className="text-[var(--background)]/70 text-xs truncate">Get the best experience on home screen</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleInstall}
                className="bg-[var(--background)] text-[var(--foreground)] px-4 py-2 rounded-full text-xs font-bold active:scale-95 transition-transform"
              >
                Install
              </button>
              <button
                onClick={() => setShowPrompt(false)}
                className="p-1 rounded-full hover:bg-white/10 text-[var(--background)]/50"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
