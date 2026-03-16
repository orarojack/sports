import useSWR from 'swr'
import type { League } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useLeagues() {
  return useSWR<{ leagues: League[] }>('/api/leagues', fetcher)
}

export function useLeague(id: string) {
  return useSWR<{ league: League }>(
    id ? `/api/leagues/${id}` : null,
    fetcher
  )
}
