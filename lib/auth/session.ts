import { cookies } from 'next/headers'
import type { AdminSession, AdminRole } from '@/lib/types'

const SESSION_COOKIE_NAME = 'admin_session'
const SESSION_SECRET = 'fkf-league-admin-secret-2026' // In production, use env var

// Simple base64 encode/decode for session data
function encodeSession(session: AdminSession): string {
  const json = JSON.stringify(session)
  return Buffer.from(json).toString('base64')
}

function decodeSession(token: string): AdminSession | null {
  try {
    const json = Buffer.from(token, 'base64').toString('utf-8')
    return JSON.parse(json)
  } catch {
    return null
  }
}

export async function createSession(session: AdminSession): Promise<void> {
  const cookieStore = await cookies()
  const token = encodeSession(session)
  
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })
}

export async function getSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value
  
  if (!token) return null
  
  return decodeSession(token)
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

export async function requireAuth(): Promise<AdminSession> {
  const session = await getSession()
  if (!session) {
    throw new Error('Unauthorized')
  }
  return session
}

export async function requireRole(allowedRoles: AdminRole[]): Promise<AdminSession> {
  const session = await requireAuth()
  if (!allowedRoles.includes(session.role)) {
    throw new Error('Forbidden')
  }
  return session
}

export function canEdit(role: AdminRole): boolean {
  return role === 'super_admin' || role === 'editor'
}

export function canManageUsers(role: AdminRole): boolean {
  return role === 'super_admin'
}
