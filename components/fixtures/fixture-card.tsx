import { MapPin, Clock } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TeamLogo } from '@/components/teams/team-logo'
import { formatMatchTime } from '@/lib/utils/date'
import type { FixtureWithTeams } from '@/lib/types'
import { cn } from '@/lib/utils'

interface FixtureCardProps {
  fixture: FixtureWithTeams
  showDate?: boolean
}

const statusConfig = {
  scheduled: { label: 'Scheduled', className: 'bg-muted text-muted-foreground' },
  live: { label: 'LIVE', className: 'bg-destructive text-destructive-foreground animate-pulse' },
  completed: { label: 'FT', className: 'bg-secondary text-secondary-foreground' },
  postponed: { label: 'Postponed', className: 'bg-[oklch(0.65_0.15_50)] text-white' },
}

export function FixtureCard({ fixture, showDate }: FixtureCardProps) {
  const status = statusConfig[fixture.status]
  const isCompleted = fixture.status === 'completed'
  const isLive = fixture.status === 'live'

  return (
    <Card className={cn(
      'overflow-hidden transition-shadow hover:shadow-md',
      isLive && 'ring-2 ring-destructive'
    )}>
      <div className="p-4">
        {/* Match Number and Status */}
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">
            Matchday {fixture.matchday}
          </span>
          <Badge className={status.className}>
            {status.label}
          </Badge>
        </div>

        {/* Teams and Score */}
        <div className="flex items-center justify-between gap-4">
          {/* Home Team */}
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamLogo name={fixture.homeTeam.name} logo={fixture.homeTeam.logo} size="md" />
            <span className="text-sm font-medium leading-tight">{fixture.homeTeam.name}</span>
          </div>

          {/* Score or Time */}
          <div className="flex flex-col items-center gap-1 px-4">
            {isCompleted || isLive ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{fixture.homeScore}</span>
                <span className="text-lg text-muted-foreground">-</span>
                <span className="text-2xl font-bold">{fixture.awayScore}</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-xl font-bold text-primary">
                  {formatMatchTime(fixture.time)}
                </span>
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  VS
                </span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-1 flex-col items-center gap-2 text-center">
            <TeamLogo name={fixture.awayTeam.name} logo={fixture.awayTeam.logo} size="md" />
            <span className="text-sm font-medium leading-tight">{fixture.awayTeam.name}</span>
          </div>
        </div>

        {/* Venue and Time Info */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-3 border-t border-border pt-3 text-xs text-muted-foreground">
          {fixture.venue && (
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{fixture.venue}</span>
            </div>
          )}
          {!isCompleted && (
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{fixture.broadcastTime || formatMatchTime(fixture.time)}</span>
            </div>
          )}
        </div>

        {isCompleted && fixture.scorers.length > 0 && (
          <div className="mt-3 border-t border-border pt-3 text-xs">
            <p className="mb-1 font-medium text-muted-foreground">Goal scorers</p>
            <div className="space-y-1">
              <p className="text-foreground/90">
                <span className="font-medium">{fixture.homeTeam.shortName}:</span>{' '}
                {fixture.scorers
                  .filter(s => s.teamId === fixture.homeTeam.id)
                  .map(s => `${s.playerName}${s.minute ? ` (${s.minute}')` : ''}`)
                  .join(', ') || 'None'}
              </p>
              <p className="text-foreground/90">
                <span className="font-medium">{fixture.awayTeam.shortName}:</span>{' '}
                {fixture.scorers
                  .filter(s => s.teamId === fixture.awayTeam.id)
                  .map(s => `${s.playerName}${s.minute ? ` (${s.minute}')` : ''}`)
                  .join(', ') || 'None'}
              </p>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
