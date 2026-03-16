'use client'

import { TeamLogo } from '@/components/teams/team-logo'
import { Badge } from '@/components/ui/badge'
import type { StandingWithTeam } from '@/lib/types'
import { cn } from '@/lib/utils'

interface StandingsTableProps {
  standings: StandingWithTeam[]
  highlightTeamId?: string
}

export function StandingsTable({ standings, highlightTeamId }: StandingsTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px]">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-3 py-3 text-left font-medium">Pos</th>
            <th className="px-3 py-3 text-left font-medium">Team</th>
            <th className="px-3 py-3 text-center font-medium">P</th>
            <th className="px-3 py-3 text-center font-medium">W</th>
            <th className="px-3 py-3 text-center font-medium">D</th>
            <th className="px-3 py-3 text-center font-medium">L</th>
            <th className="hidden px-3 py-3 text-center font-medium sm:table-cell">GF</th>
            <th className="hidden px-3 py-3 text-center font-medium sm:table-cell">GA</th>
            <th className="px-3 py-3 text-center font-medium">GD</th>
            <th className="px-3 py-3 text-center font-medium">Pts</th>
            <th className="hidden px-3 py-3 text-center font-medium md:table-cell">Form</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((standing) => {
            const isHighlighted = standing.teamId === highlightTeamId
            const isPromotion = standing.position <= 2
            const isRelegation = standing.position >= standings.length - 1
            
            return (
              <tr
                key={standing.id}
                className={cn(
                  'border-b border-border transition-colors hover:bg-muted/30',
                  isHighlighted && 'bg-primary/10'
                )}
              >
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                        isPromotion && 'bg-secondary text-secondary-foreground',
                        isRelegation && 'bg-destructive/20 text-destructive',
                        !isPromotion && !isRelegation && 'bg-muted text-muted-foreground'
                      )}
                    >
                      {standing.position}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-2">
                    <TeamLogo name={standing.team.name} logo={standing.team.logo} size="sm" />
                    <span className="font-medium">{standing.team.name}</span>
                  </div>
                </td>
                <td className="px-3 py-3 text-center">{standing.played}</td>
                <td className="px-3 py-3 text-center text-secondary font-medium">{standing.won}</td>
                <td className="px-3 py-3 text-center">{standing.drawn}</td>
                <td className="px-3 py-3 text-center text-destructive">{standing.lost}</td>
                <td className="hidden px-3 py-3 text-center sm:table-cell">{standing.goalsFor}</td>
                <td className="hidden px-3 py-3 text-center sm:table-cell">{standing.goalsAgainst}</td>
                <td className="px-3 py-3 text-center">
                  <span className={cn(
                    'font-medium',
                    standing.goalDifference > 0 && 'text-secondary',
                    standing.goalDifference < 0 && 'text-destructive'
                  )}>
                    {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                  </span>
                </td>
                <td className="px-3 py-3 text-center">
                  <span className="text-lg font-bold">{standing.points}</span>
                </td>
                <td className="hidden px-3 py-3 md:table-cell">
                  <div className="flex items-center justify-center gap-0.5">
                    {standing.form.map((result, i) => (
                      <Badge
                        key={i}
                        className={cn(
                          'h-5 w-5 justify-center p-0 text-[10px] font-bold',
                          result === 'W' && 'bg-secondary text-secondary-foreground',
                          result === 'D' && 'bg-muted text-muted-foreground',
                          result === 'L' && 'bg-destructive text-white'
                        )}
                      >
                        {result}
                      </Badge>
                    ))}
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
