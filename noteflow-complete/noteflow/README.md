# Noteflow — Setup Guide

## Quick Start

```bash
npm install
cp .env.example .env.local
# fill in your GitHub OAuth credentials
npm run dev
```

---

## Environment Variables

Create `.env.local`:

```env
GITHUB_ID=your_github_oauth_app_client_id
GITHUB_SECRET=your_github_oauth_app_client_secret
NEXTAUTH_SECRET=any_random_32_char_string
NEXTAUTH_URL=http://localhost:3000
```

### How to get GitHub OAuth credentials
1. Go to https://github.com/settings/developers
2. Click **New OAuth App**
3. Homepage URL: `http://localhost:3000`
4. Callback URL: `http://localhost:3000/api/auth/callback/github`
5. Copy Client ID → `GITHUB_ID`
6. Generate Client Secret → `GITHUB_SECRET`

---

## File Structure

```
noteflow/
├── app/
│   ├── (app)/                     # Protected routes (auth required)
│   │   ├── layout.tsx             # Sidebar + BottomNav wrapper
│   │   ├── page.tsx               # Dashboard ← use dashboard-page.tsx
│   │   ├── favorites/page.tsx     # Favorites ✅
│   │   ├── search/page.tsx        # Search ✅
│   │   └── settings/page.tsx      # Settings ✅
│   ├── note/[id]/
│   │   └── page.tsx               # Note editor ← use note-page.tsx
│   ├── login/page.tsx             # Login (original, no changes needed)
│   └── api/auth/[...nextauth]/
│       └── route.ts               # NextAuth handler (see below)
├── components/
│   ├── AuthProvider.tsx           # Original (no changes needed)
│   ├── dashboard/NoteCard.tsx     # Original (no changes needed)
│   ├── editor/Editor.tsx          # Original (no changes needed)
│   ├── mobile/BottomNav.tsx       # Original (no changes needed)
│   └── sidebar/Sidebar.tsx        # ✅ Replaced
├── lib/
│   ├── auth.ts                    # Original (no changes needed)
│   ├── db.ts                      # Original (no changes needed)
│   ├── export.ts                  # Original (no changes needed)
│   ├── github.ts                  # ✅ Replaced (browser-safe, no Buffer)
│   ├── search.ts                  # Original (no changes needed)
│   ├── store.ts                   # Original (no changes needed)
│   ├── sync.ts                    # ✅ Replaced (index.json + delete)
│   └── utils.ts                   # Original (no changes needed)
└── types/
    └── index.ts                   # ✅ New (was missing)
```

---

## Files to Create Yourself

### `app/api/auth/[...nextauth]/route.ts`
```ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth'

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
```

### `app/layout.tsx` (root layout)
```tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Noteflow',
  description: 'Your notes. Your GitHub.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}
```

---

## What Was Fixed

| File | Problem | Fix |
|------|---------|-----|
| `types/index.ts` | Missing entirely | Created |
| `lib/github.ts` | Used `Buffer` (Node-only) | Replaced with `atob`/`btoa` |
| `lib/sync.ts` | Never updated `index.json`, no delete | Full rewrite |
| `app/(app)/page.tsx` | Mock data, no real load | Real GitHub load + sort + search |
| `app/note/[id]/page.tsx` | Mock data, no real save/delete | Real fetch, debounced save, delete, favorite |
| `components/sidebar/Sidebar.tsx` | Search not wired, no tags, no new note | Fully wired |
| `app/(app)/favorites/page.tsx` | Missing | Created |
| `app/(app)/search/page.tsx` | Missing | Created |
| `app/(app)/settings/page.tsx` | Missing | Created |

---

## How Data Flows

```
User types in editor
  → debounce 1.5s
  → saveNoteWithSync()
    → db.notes.put()        (Dexie, instant)
    → saveFile()            (GitHub notes/note-{id}.json)
    → updateIndex()         (GitHub index.json, includes tags)

App loads
  → initializeNoteflow()
    → getOrCreateRepo()
    → getFile('index.json')
    → setNotes(index.notes)
    → setFolders(index.folders)
    → setTags(index.tags)
```
