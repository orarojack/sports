import { Calendar } from 'lucide-react'
import { formatMatchDate } from '@/lib/utils/date'

interface MatchdayHeaderProps {
  date: string
  league: string
  matchday?: number
}

export function MatchdayHeader({ date, league, matchday }: MatchdayHeaderProps) {
  const leagueNames: Record<string, string> = {
    'fkf-nyanza': 'FKF Nyanza Regional League',
    'wnsl': 'Women National Super League',
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-primary p-4 text-primary-foreground">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.1)_25%,rgba(255,255,255,0.1)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.1)_75%)] bg-[length:20px_20px]" />
      
      <div className="relative flex flex-col items-center gap-2 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 className="text-lg font-bold uppercase tracking-wide">
            {leagueNames[league] || league}
          </h3>
          <p className="text-sm text-primary-foreground/80">
            Season 2025/2026
          </p>
        </div>
        
        <div className="flex flex-col items-center sm:items-end">
          {matchday && (
            <span className="rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
              Round {matchday}
            </span>
          )}
          <div className="mt-1 flex items-center gap-1.5 text-sm">
            <Calendar className="h-4 w-4" />
            <span className="font-medium">{formatMatchDate(date)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
