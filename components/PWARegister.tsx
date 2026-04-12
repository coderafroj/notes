'use client'

import { useEffect, useState } from 'react'

export default function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // ── Handle Service Worker Registration ────────────────────
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[SW] registered:', reg.scope)
        })
        .catch((err) => {
          // Only log error in production or if it's not a dev-mode expected failure
          if (process.env.NODE_ENV === 'production') {
            console.error('[SW] failed:', err)
          }
        })
    }

    // ── Handle Install Prompt ────────────────────────────────
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e)
      console.log('[PWA] beforeinstallprompt captured')
      
      // We can dispatch a custom event to notify components that the app is installable
      window.dispatchEvent(new CustomEvent('pwa-installable', { detail: e }))
    }

    const handleAppInstalled = () => {
      console.log('[PWA] App installed')
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Expose a global method to trigger install
    ;(window as any).triggerPWAInstall = async () => {
      if (!deferredPrompt) {
        console.warn('[PWA] No install prompt available')
        return
      }
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log(`[PWA] User choice: ${outcome}`)
      setDeferredPrompt(null)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [deferredPrompt])

  return null
}

