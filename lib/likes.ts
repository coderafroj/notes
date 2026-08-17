import { getFile, saveFile, PUBLIC_REPO_NAME } from '@/lib/github'

// Likes are stored centrally in the admin's own public repo as a single
// `likes.json` map of "{username}/{slug}" -> count. This mirrors the
// existing registry.json / banned.json pattern (see app/api/register) so
// no per-author write access or GitHub App install is required — any
// anonymous reader can like a note via the service token below.
export const LIKES_ADMIN_USER = 'coderafroj'
export const LIKES_FILE = 'likes.json'

export function likeKey(username: string, slug: string) {
  return `${username}/${slug}`
}

export async function getLikeCount(username: string, slug: string): Promise<number> {
  const token = process.env.GITHUB_TOKEN
  if (!token) return 0
  const file = await getFile(token, LIKES_ADMIN_USER, LIKES_FILE, PUBLIC_REPO_NAME).catch(() => null)
  const likes: Record<string, number> = file?.content || {}
  return likes[likeKey(username, slug)] ?? 0
}

// Increments the like count with retry-on-409 (likes.json is a single
// shared file every like touches, so concurrent likes can race — same
// pattern as updateIndex() in lib/sync.ts).
export async function incrementLike(username: string, slug: string, attempt = 0): Promise<number> {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN missing')

  const key = likeKey(username, slug)
  const file = await getFile(token, LIKES_ADMIN_USER, LIKES_FILE, PUBLIC_REPO_NAME).catch(() => null)
  const likes: Record<string, number> = file?.content || {}
  likes[key] = (likes[key] ?? 0) + 1

  try {
    await saveFile(token, LIKES_ADMIN_USER, LIKES_FILE, likes, file?.sha, PUBLIC_REPO_NAME)
    return likes[key]
  } catch (err: any) {
    if (err?.status === 409 && attempt < 2) {
      return incrementLike(username, slug, attempt + 1)
    }
    throw err
  }
}
