// public/sw.js — Service Worker for Noteflow PWA
const CACHE_NAME = 'noteflow-v1'

const STATIC_ASSETS = [
  '/',
  '/login',
  '/offline',
]

// Install — cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    )
  )
  self.clients.claim()
})

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET and API requests
  if (event.request.method !== 'GET') return
  if (event.request.url.includes('/api/')) return
  if (event.request.url.includes('api.github.com')) return

  event.respondWith(
    fetch(event.request)
      .then((res) => {
        // Cache successful responses
        if (res.ok) {
          const clone = res.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone))
        }
        return res
      })
      .catch(() =>
        caches.match(event.request).then((cached) => {
          if (cached) return cached
          // Fallback for navigation requests
          if (event.request.mode === 'navigate') {
            return caches.match('/offline') || new Response('Offline', { status: 503 })
          }
        })
      )
  )
})
