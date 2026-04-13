# Noteflow V2 — New Features Setup

## Files in this ZIP and where they go

```
noteflow-v2/
├── types/index.ts                          → types/index.ts (REPLACE)
├── lib/publish.ts                          → lib/publish.ts (NEW)
├── app/[username]/page.tsx                 → app/[username]/page.tsx (NEW)
├── app/[username]/[slug]/page.tsx          → app/[username]/[slug]/page.tsx (NEW)
├── components/note-ui/PublishToggle.tsx    → components/note-ui/PublishToggle.tsx (NEW)
├── components/editor/DrawingCanvas.tsx     → components/editor/DrawingCanvas.tsx (NEW)
└── components/mobile/SwipeActions.tsx      → components/mobile/SwipeActions.tsx (NEW)
```

---

## Feature 1 — Publish Notes (Public URL)

Students can read your notes at:
`mynotes.bytecores.in/@coderafroj/my-note-slug`

### Add PublishToggle to note page header

In `app/note/[id]/page.tsx`, add to imports:
```tsx
import PublishToggle from '@/components/note-ui/PublishToggle'
```

In the header JSX (next to the Star button):
```tsx
{session && (
  <PublishToggle
    note={note}
    token={session.accessToken}
    username={session.user.login}
    onUpdate={(updated) => setNote(updated)}
  />
)}
```

### Add isPublished + slug when creating new notes

In `lib/sync.ts` saveNoteWithSync, make sure new notes have defaults:
```ts
// When creating note (in new note handler):
const note = {
  ...otherFields,
  isPublished: false,
  slug: title.toLowerCase().replace(/[^\w\s]/g,'').replace(/\s+/g,'-'),
}
```

---

## Feature 2 — Public Profile + Reader

`app/[username]/page.tsx` — auto-works, no extra setup needed.
`app/[username]/[slug]/page.tsx` — auto-works, no extra setup needed.

### Add route to next.config.js (optional redirect)

```js
// next.config.js
async redirects() {
  return [
    {
      source: '/@:username',
      destination: '/:username',
      permanent: false,
    },
  ]
},
```

---

## Feature 3 — Drawing Canvas

### Add as a tab in note editor

In `app/note/[id]/page.tsx`:

```tsx
import DrawingCanvas from '@/components/editor/DrawingCanvas'

// State
const [activeTab, setActiveTab] = useState<'write' | 'draw'>('write')

// Tab switcher (add in header):
<div className="flex bg-[var(--muted)] rounded-lg p-0.5">
  {(['write', 'draw'] as const).map((t) => (
    <button
      key={t}
      onClick={() => setActiveTab(t)}
      className={cn(
        'px-3 py-1.5 rounded-md text-sm font-medium transition-all capitalize',
        activeTab === t
          ? 'bg-[var(--card-bg)] text-[var(--foreground)] shadow-sm'
          : 'text-[var(--muted-text)]'
      )}
    >
      {t}
    </button>
  ))}
</div>

// Below header, replace Editor with:
{activeTab === 'write' ? (
  <Editor content={note.content} onChange={handleContentChange} />
) : (
  <div className="px-6 py-6">
    <DrawingCanvas
      data={note.drawingData}
      onChange={async (d) => {
        const updated = { ...note, drawingData: d }
        setNote(updated)
        await saveNoteWithSync(session.accessToken, session.user.login, updated)
      }}
    />
  </div>
)}
```

---

## Feature 4 — Swipe to Delete/Favorite (Mobile)

### Wrap NoteCard in Dashboard

In `app/(app)/page.tsx`:

```tsx
import SwipeActions from '@/components/mobile/SwipeActions'
import { deleteNoteWithSync, toggleFavoriteWithSync } from '@/lib/sync'

// Replace NoteCard render with:
{displayNotes.map((note) => (
  <SwipeActions
    key={note.id}
    isFavorite={note.isFavorite}
    onDelete={async () => {
      if (!session?.accessToken) return
      await deleteNoteWithSync(session.accessToken, session.user.login, note.id)
      setNotes(notes.filter((n) => n.id !== note.id))
    }}
    onFavorite={async () => {
      if (!session?.accessToken) return
      await toggleFavoriteWithSync(session.accessToken, session.user.login, note.id, !note.isFavorite)
      setNotes(notes.map((n) => n.id === note.id ? { ...n, isFavorite: !n.isFavorite } : n))
    }}
  >
    <NoteCard note={note} viewMode={viewMode} />
  </SwipeActions>
))}
```

---

## No new packages needed

All features use only what you already have installed.

---

## How public notes work (flow)

```
User taps "Publish" in note page
  → publishNote() called
    → Saves note to GitHub: public/{slug}.json
    → Updates GitHub: public/index.json (list of all public notes)
    → Updates note: isPublished=true, slug, publishedAt

Student visits mynotes.bytecores.in/@coderafroj
  → app/[username]/page.tsx loads
    → getPublicIndex('coderafroj') reads public/index.json from GitHub
    → Shows all published notes list

Student clicks a note
  → app/[username]/[slug]/page.tsx loads
    → getPublicNote('coderafroj', 'slug') reads public/{slug}.json
    → Renders beautiful read-only article view
    → No login needed
```
