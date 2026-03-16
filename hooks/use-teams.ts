import useSWR from 'swr'
import type { Team } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useTeams(league?: string) {
  const url = league ? `/api/teams?league=${league}` : '/api/teams'
  return useSWR<{ teams: Team[] }>(url, fetcher)
}

export function useTeam(id: string) {
  return useSWR<{ team: Team }>(
    id ? `/api/teams/${id}` : null,
    fetcher
  )
}
