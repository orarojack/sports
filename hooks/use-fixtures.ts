import useSWR from 'swr'
import type { FixtureWithTeams } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useFixtures(options?: { 
  league?: string
  date?: string
  status?: string
}) {
  const params = new URLSearchParams()
  if (options?.league) params.set('league', options.league)
  if (options?.date) params.set('date', options.date)
  if (options?.status) params.set('status', options.status)
  
  const queryString = params.toString()
  const url = `/api/fixtures${queryString ? `?${queryString}` : ''}`
  
  return useSWR<{ fixtures: FixtureWithTeams[] }>(url, fetcher, {
    refreshInterval: 30000, // Poll every 30 seconds for real-time updates
  })
}

export function useFixture(id: string) {
  return useSWR<{ fixture: FixtureWithTeams }>(
    id ? `/api/fixtures/${id}` : null,
    fetcher,
    { refreshInterval: 30000 }
  )
}

export function useUpcomingFixtures(limit?: number) {
  const params = new URLSearchParams()
  params.set('upcoming', 'true')
  if (limit) params.set('limit', limit.toString())
  
  return useSWR<{ fixtures: FixtureWithTeams[] }>(
    `/api/fixtures?${params.toString()}`,
    fetcher,
    { refreshInterval: 30000 }
  )
}

export function useRecentResults(limit?: number) {
  const params = new URLSearchParams()
  params.set('status', 'completed')
  if (limit) params.set('limit', limit.toString())
  
  return useSWR<{ fixtures: FixtureWithTeams[] }>(
    `/api/fixtures?${params.toString()}`,
    fetcher,
    { refreshInterval: 30000 }
  )
}
