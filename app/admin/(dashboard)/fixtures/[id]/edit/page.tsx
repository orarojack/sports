'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useFixture } from '@/hooks/use-fixtures'
import { useTeams } from '@/hooks/use-teams'
import { useLeagues } from '@/hooks/use-leagues'
import type { GoalScorer } from '@/lib/types'

export default function EditFixturePage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const fixtureId = params?.id ?? ''

  const { data: fixtureData, isLoading: isFixtureLoading } = useFixture(fixtureId)
  const { data: teamsData } = useTeams()
  const { data: leaguesData } = useLeagues()

  const teams = teamsData?.teams || []
  const leagues = leaguesData?.leagues || []
  const fixture = fixtureData?.fixture

  const [hasInitialized, setHasInitialized] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [matchday, setMatchday] = useState('')
  const [league, setLeague] = useState('')
  const [homeTeamId, setHomeTeamId] = useState('')
  const [awayTeamId, setAwayTeamId] = useState('')
  const [venue, setVenue] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [status, setStatus] = useState<'scheduled' | 'live' | 'completed' | 'postponed'>('scheduled')
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [homeScorersInput, setHomeScorersInput] = useState('')
  const [awayScorersInput, setAwayScorersInput] = useState('')

  useEffect(() => {
    if (!fixture || hasInitialized) return

    setMatchday(String(fixture.matchday))
    setLeague(fixture.league)
    setHomeTeamId(fixture.homeTeam.id)
    setAwayTeamId(fixture.awayTeam.id)
    setVenue(fixture.venue)
    setDate(fixture.date)
    setTime(fixture.time)
    setStatus(fixture.status)
    setHomeScore(fixture.homeScore === null ? '' : String(fixture.homeScore))
    setAwayScore(fixture.awayScore === null ? '' : String(fixture.awayScore))
    setHomeScorersInput(
      fixture.scorers
        .filter(s => s.teamId === fixture.homeTeam.id)
        .map(s => `${s.playerName}${s.minute ? ` ${s.minute}` : ''}`)
        .join(', ')
    )
    setAwayScorersInput(
      fixture.scorers
        .filter(s => s.teamId === fixture.awayTeam.id)
        .map(s => `${s.playerName}${s.minute ? ` ${s.minute}` : ''}`)
        .join(', ')
    )
    setHasInitialized(true)
  }, [fixture, hasInitialized])

  const filteredTeams = league ? teams.filter(t => t.league === league) : teams

  const parseScorers = (input: string, teamIdValue: string): GoalScorer[] => {
    if (!input.trim()) return []
    return input
      .split(',')
      .map(token => token.trim())
      .filter(Boolean)
      .map(token => {
        const minuteMatch = token.match(/^(.*)\s+(\d+)(?:\+(\d+))?'?$/)
        if (minuteMatch) {
          const playerName = minuteMatch[1].trim()
          const baseMinute = parseInt(minuteMatch[2], 10)
          const extraMinute = minuteMatch[3] ? parseInt(minuteMatch[3], 10) : 0
          return { teamId: teamIdValue, playerName, minute: baseMinute + extraMinute }
        }
        return { teamId: teamIdValue, playerName: token, minute: null }
      })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!fixture) return
    setError('')
    setIsSubmitting(true)

    const homeScoreValue =
      status === 'completed' && homeScore !== '' ? parseInt(homeScore, 10) : null
    const awayScoreValue =
      status === 'completed' && awayScore !== '' ? parseInt(awayScore, 10) : null

    if (status === 'completed' && (homeScoreValue === null || awayScoreValue === null)) {
      setError('Completed fixtures require both scores.')
      setIsSubmitting(false)
      return
    }

    try {
      const scorers =
        status === 'completed'
          ? [...parseScorers(homeScorersInput, homeTeamId), ...parseScorers(awayScorersInput, awayTeamId)]
          : []

      const payload = {
        matchday: parseInt(matchday, 10),
        league,
        homeTeamId,
        awayTeamId,
        venue,
        date,
        time,
        status,
        homeScore: homeScoreValue,
        awayScore: awayScoreValue,
        scorers,
      }

      const res = await fetch(`/api/fixtures/${fixture.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update fixture')
      }

      router.push('/admin/fixtures')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update fixture')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isFixtureLoading && !fixture) {
    return (
      <div className="p-6 lg:p-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading fixture...
        </div>
      </div>
    )
  }

  if (!fixture) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Fixture not found.
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 lg:p-8">
      <Link href="/admin/fixtures">
        <Button variant="ghost" size="sm" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Fixtures
        </Button>
      </Link>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Edit Fixture</CardTitle>
            <CardDescription>Update fixture details, score, and scorers</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>League</Label>
                  <Select value={league} onValueChange={setLeague}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagues.map(item => (
                        <SelectItem key={item.id} value={item.id}>
                          {item.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="matchday">Matchday</Label>
                  <Input id="matchday" type="number" min="1" value={matchday} onChange={(e) => setMatchday(e.target.value)} required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Home Team</Label>
                  <Select value={homeTeamId} onValueChange={setHomeTeamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Away Team</Label>
                  <Select value={awayTeamId} onValueChange={setAwayTeamId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input id="venue" value={venue} onChange={(e) => setVenue(e.target.value)} required />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as typeof status)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="postponed">Postponed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {status === 'completed' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="homeScore">Home Score</Label>
                      <Input id="homeScore" type="number" min="0" value={homeScore} onChange={(e) => setHomeScore(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="awayScore">Away Score</Label>
                      <Input id="awayScore" type="number" min="0" value={awayScore} onChange={(e) => setAwayScore(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Home scorers</Label>
                      <Textarea
                        value={homeScorersInput}
                        onChange={(e) => setHomeScorersInput(e.target.value)}
                        placeholder="e.g. Ochieng 12, Omondi 77"
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Away scorers</Label>
                      <Textarea
                        value={awayScorersInput}
                        onChange={(e) => setAwayScorersInput(e.target.value)}
                        placeholder="e.g. Anyango 44, Akinyi 90+2"
                        rows={3}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
                <Link href="/admin/fixtures">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
