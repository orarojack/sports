import useSWR from 'swr'
import type { StandingWithTeam } from '@/lib/types'

const fetcher = (url: string) => fetch(url).then(res => res.json())

export function useStandings(league: string) {
  return useSWR<{ standings: StandingWithTeam[] }>(
    league ? `/api/standings?league=${league}` : null,
    fetcher,
    { refreshInterval: 30000 }
  )
}

export function useTeamStanding(teamId: string) {
  return useSWR<{ standing: StandingWithTeam }>(
    teamId ? `/api/standings/${teamId}` : null,
    fetcher,
    { refreshInterval: 30000 }
  )
}
