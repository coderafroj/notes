import { NextResponse } from 'next/server'
import { getPublicIndex } from '@/lib/publish'

export const revalidate = 60 // Revalidate the feed every 60 seconds

export async function GET() {
  try {
    // 1. Base list of known authors to always include
    let authors = ['coderafroj']
    
    // 2. Fetch all repositories named "noteflow-public" from GitHub
    // This allows the platform to dynamically discover any user who has published notes!
    try {
      const headers: Record<string, string> = { 
        Accept: 'application/vnd.github.v3+json',
        // User-Agent is required by GitHub API
        'User-Agent': 'Noteflow-Global-Feed'
      }
      
      if (process.env.GITHUB_TOKEN) {
         headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`
      }
      
      const searchRes = await fetch('https://api.github.com/search/repositories?q=noteflow-public+in:name&per_page=100', {
         headers,
         next: { revalidate: 3600 } // Cache the search results for 1 hour to prevent API rate limits
      })
      
      if (searchRes.ok) {
         const data = await searchRes.json()
         if (data.items) {
           const foundAuthors = data.items.map((repo: any) => repo.owner.login)
           // Merge and remove duplicates
           authors = Array.from(new Set([...authors, ...foundAuthors]))
         }
      } else {
        console.warn(`[Global Feed] GitHub Search API returned ${searchRes.status}`)
      }
    } catch (e) {
      console.warn("[Global Feed] Failed to fetch dynamic authors from GitHub:", e)
    }

    const allNotes = []
    
    // 3. Fetch index.json for each discovered author
    // We run these in parallel to make the API route fast
    const indexPromises = authors.map(async (author) => {
      try {
        const notes = await getPublicIndex(author)
        return notes.map(n => ({ ...n, author }))
      } catch (e) {
        return []
      }
    })
    
    const results = await Promise.all(indexPromises)
    for (const authorNotes of results) {
      allNotes.push(...authorNotes)
    }
    
    // 4. Sort all notes globally by published date (newest first)
    allNotes.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    
    return NextResponse.json({ notes: allNotes })
  } catch (error) {
    console.error('[Global Feed] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch global feed', notes: [] }, { status: 500 })
  }
}
