import { NextResponse } from 'next/server'
import { getFile, saveFile, PUBLIC_REPO_NAME } from '@/lib/github'

export async function POST(req: Request) {
  try {
    const { username } = await req.json()
    
    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 })
    }

    const token = process.env.GITHUB_TOKEN
    const adminUser = 'coderafroj'

    if (!token) {
      console.warn('[Register API] GITHUB_TOKEN is missing. Registration skipped.')
      return NextResponse.json({ message: 'Token missing, skipped' })
    }

    // 1. Fetch current registry from the admin's public repo
    const registryFile = await getFile(token, adminUser, 'registry.json', PUBLIC_REPO_NAME)
    let userList: string[] = registryFile?.content || []

    // 2. Add user if not present
    if (!userList.includes(username)) {
      userList.push(username)
      
      // 3. Save back to GitHub
      await saveFile(
        token, 
        adminUser, 
        'registry.json', 
        userList, 
        registryFile?.sha, 
        PUBLIC_REPO_NAME
      )
      console.log(`[Register API] Registered new author: ${username}`)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Register API] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
