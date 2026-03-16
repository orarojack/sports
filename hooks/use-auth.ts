'use client'

import useSWR from 'swr'
import { useRouter } from 'next/navigation'
import type { AdminSession } from '@/lib/types'

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) {
    const error = new Error('Not authenticated')
    throw error
  }
  return res.json()
}

export function useAuth() {
  const router = useRouter()
  const { data, error, isLoading, mutate } = useSWR<{ session: AdminSession }>(
    '/api/auth/me',
    fetcher,
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  const login = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    if (!res.ok) {
      const data = await res.json()
      throw new Error(data.error || 'Login failed')
    }

    await mutate()
    router.push('/admin')
  }

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    await mutate(undefined, { revalidate: false })
    router.push('/admin/login')
  }

  return {
    session: data?.session,
    isLoading,
    isAuthenticated: !!data?.session && !error,
    error,
    login,
    logout,
    mutate,
  }
}
