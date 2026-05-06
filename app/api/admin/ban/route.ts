import { NextResponse } from 'next/server'
import { getFile, saveFile, PUBLIC_REPO_NAME } from '@/lib/github'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, target, action } = await req.json() // action: 'ban' | 'unban'
    
    if (!type || !target || !action) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 })
    }

    const token = process.env.GITHUB_TOKEN
    const adminUser = 'coderafroj'

    if (!token) {
      return NextResponse.json({ error: 'GitHub Token missing' }, { status: 500 })
    }

    // Fetch current banned list
    const bannedFile = await getFile(token, adminUser, 'banned.json', PUBLIC_REPO_NAME)
    let bannedList = bannedFile?.content || { users: [], notes: [] }
    if (typeof bannedList === 'string') {
        try { bannedList = JSON.parse(bannedList) } catch { bannedList = { users: [], notes: [] } }
    }
    if (!bannedList.users) bannedList.users = []
    if (!bannedList.notes) bannedList.notes = []

    if (type === 'user') {
      if (action === 'ban' && !bannedList.users.includes(target)) {
        bannedList.users.push(target)
      } else if (action === 'unban') {
        bannedList.users = bannedList.users.filter((u: string) => u !== target)
      }
    } else if (type === 'note') {
      if (action === 'ban' && !bannedList.notes.includes(target)) {
        bannedList.notes.push(target)
      } else if (action === 'unban') {
        bannedList.notes = bannedList.notes.filter((n: string) => n !== target)
      }
    }

    // Save back to GitHub
    await saveFile(
      token, 
      adminUser, 
      'banned.json', 
      bannedList, 
      bannedFile?.sha, 
      PUBLIC_REPO_NAME
    )

    return NextResponse.json({ success: true, bannedList })
  } catch (error: any) {
    console.error('[Ban API] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
