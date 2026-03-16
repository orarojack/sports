import { NextRequest, NextResponse } from 'next/server'
import { getAdminByEmail } from '@/lib/data'
import { verifyPassword, hashPassword } from '@/lib/auth/password'
import { createSession } from '@/lib/auth/session'
import type { AdminSession } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      )
    }

    const admin = await getAdminByEmail(email)
    
    if (!admin) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // For demo: accept "admin123" or "editor123" as passwords
    const inputHash = await hashPassword(password)
    const isValidPassword = admin.passwordHash === inputHash || 
      password === 'admin123' || 
      password === 'editor123'

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const session: AdminSession = {
      id: admin.id,
      email: admin.email,
      role: admin.role,
      name: admin.name,
    }

    await createSession(session)

    return NextResponse.json({ 
      success: true,
      session 
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}
