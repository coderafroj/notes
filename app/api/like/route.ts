import { NextResponse } from 'next/server'
import { getLikeCount, incrementLike } from '@/lib/likes'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const username = searchParams.get('username')
  const slug = searchParams.get('slug')
  if (!username || !slug) {
    return NextResponse.json({ error: 'username and slug required' }, { status: 400 })
  }
  const count = await getLikeCount(username, slug)
  return NextResponse.json({ count })
}

export async function POST(req: Request) {
  try {
    const { username, slug } = await req.json()
    if (!username || !slug) {
      return NextResponse.json({ error: 'username and slug required' }, { status: 400 })
    }
    if (!process.env.GITHUB_TOKEN) {
      return NextResponse.json({ error: 'Likes are unavailable right now' }, { status: 503 })
    }
    const count = await incrementLike(username, slug)
    return NextResponse.json({ count })
  } catch (error: any) {
    console.error('[Like API] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
