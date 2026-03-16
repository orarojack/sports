'use client'

import { useState } from 'react'
import { Trophy, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useFixtures } from '@/hooks/use-fixtures'
import { useLeagues } from '@/hooks/use-leagues'
import { formatMatchDate, formatMatchTime } from '@/lib/utils/date'
import { TeamLogo } from '@/components/teams/team-logo'
import { Textarea } from '@/components/ui/textarea'
import type { FixtureWithTeams, GoalScorer } from '@/lib/types'

export default function AdminResultsPage() {
  const [leagueFilter, setLeagueFilter] = useState<string>('all')
  const [selectedFixture, setSelectedFixture] = useState<FixtureWithTeams | null>(null)
  const [homeScore, setHomeScore] = useState('')
  const [awayScore, setAwayScore] = useState('')
  const [homeScorersInput, setHomeScorersInput] = useState('')
  const [awayScorersInput, setAwayScorersInput] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: fixturesData, mutate } = useFixtures()
  const { data: leaguesData } = useLeagues()

  const fixtures = fixturesData?.fixtures || []
  const leagues = leaguesData?.leagues || []

  // Filter to fixtures that need results (scheduled or live)
  const pendingFixtures = fixtures
    .filter(f => f.status === 'scheduled' || f.status === 'live')
    .filter(f => leagueFilter === 'all' || f.league === leagueFilter)
    .sort((a, b) => a.date.localeCompare(b.date))

  const handleOpenResult = (fixture: FixtureWithTeams) => {
    setSelectedFixture(fixture)
    setHomeScore('')
    setAwayScore('')
    setHomeScorersInput('')
    setAwayScorersInput('')
  }

  const parseScorers = (input: string, teamId: string): GoalScorer[] => {
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
          return {
            teamId,
            playerName,
            minute: baseMinute + extraMinute,
          }
        }
        return {
          teamId,
          playerName: token,
          minute: null,
        }
      })
  }

  const handleSubmitResult = async () => {
    if (!selectedFixture) return

    const home = parseInt(homeScore, 10)
    const away = parseInt(awayScore, 10)

    if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
      return
    }

    setIsSubmitting(true)

    try {
      const scorers = [
        ...parseScorers(homeScorersInput, selectedFixture.homeTeam.id),
        ...parseScorers(awayScorersInput, selectedFixture.awayTeam.id),
      ]

      const res = await fetch(`/api/fixtures/${selectedFixture.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          homeScore: home,
          awayScore: away,
          scorers,
          status: 'completed',
        }),
      })

      if (!res.ok) {
        throw new Error('Failed to update result')
      }

      mutate()
      setSelectedFixture(null)
    } catch (error) {
      console.error('Failed to submit result:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Enter Results</h1>
        <p className="mt-1 text-muted-foreground">
          Update match scores and standings will be calculated automatically
        </p>
      </div>

      {/* Filter */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium">Filter by League:</span>
            <Select value={leagueFilter} onValueChange={setLeagueFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Leagues" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Leagues</SelectItem>
                {leagues.map(league => (
                  <SelectItem key={league.id} value={league.id}>
                    {league.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Pending Fixtures */}
      <Card>
        <CardHeader>
          <CardTitle>Fixtures Awaiting Results</CardTitle>
          <CardDescription>
            {pendingFixtures.length} fixture{pendingFixtures.length !== 1 ? 's' : ''} pending
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingFixtures.length > 0 ? (
            <div className="space-y-3">
              {pendingFixtures.map((fixture) => (
                <div
                  key={fixture.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <Badge 
                        className={
                          fixture.status === 'live'
                            ? 'bg-destructive text-destructive-foreground animate-pulse'
                            : 'bg-muted text-muted-foreground'
                        }
                      >
                        {fixture.status === 'live' ? 'LIVE' : formatMatchDate(fixture.date)}
                      </Badge>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatMatchTime(fixture.time)}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 text-right">
                        <span className="font-medium">{fixture.homeTeam.name}</span>
                        <TeamLogo name={fixture.homeTeam.name} logo={fixture.homeTeam.logo} size="sm" />
                      </div>
                      
                      <span className="px-3 text-muted-foreground">vs</span>
                      
                      <div className="flex items-center gap-2">
                        <TeamLogo name={fixture.awayTeam.name} logo={fixture.awayTeam.logo} size="sm" />
                        <span className="font-medium">{fixture.awayTeam.name}</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => handleOpenResult(fixture)}>
                    Enter Result
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Trophy className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-lg font-medium">All caught up!</p>
              <p className="text-muted-foreground">No fixtures pending results</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Result Entry Dialog */}
      <Dialog open={!!selectedFixture} onOpenChange={() => setSelectedFixture(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter Match Result</DialogTitle>
            <DialogDescription>
              {selectedFixture && (
                <>
                  {formatMatchDate(selectedFixture.date)} at {formatMatchTime(selectedFixture.time)}
                  <br />
                  {selectedFixture.venue}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          {selectedFixture && (
            <div className="py-6">
              <div className="mb-6 flex items-center justify-center gap-4">
                <div className="flex flex-col items-center gap-2 text-center">
                  <TeamLogo name={selectedFixture.homeTeam.name} logo={selectedFixture.homeTeam.logo} size="lg" />
                  <span className="font-medium">{selectedFixture.homeTeam.name}</span>
                  <Input
                    type="number"
                    min="0"
                    className="w-20 text-center text-2xl font-bold"
                    value={homeScore}
                    onChange={(e) => setHomeScore(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <span className="text-2xl font-bold text-muted-foreground">-</span>

                <div className="flex flex-col items-center gap-2 text-center">
                  <TeamLogo name={selectedFixture.awayTeam.name} logo={selectedFixture.awayTeam.logo} size="lg" />
                  <span className="font-medium">{selectedFixture.awayTeam.name}</span>
                  <Input
                    type="number"
                    min="0"
                    className="w-20 text-center text-2xl font-bold"
                    value={awayScore}
                    onChange={(e) => setAwayScore(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {selectedFixture.homeTeam.shortName} scorers
                  </label>
                  <Textarea
                    value={homeScorersInput}
                    onChange={(e) => setHomeScorersInput(e.target.value)}
                    placeholder="e.g. Ochieng 12, Omondi 77"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {selectedFixture.awayTeam.shortName} scorers
                  </label>
                  <Textarea
                    value={awayScorersInput}
                    onChange={(e) => setAwayScorersInput(e.target.value)}
                    placeholder="e.g. Anyango 44, Akinyi 90+2"
                    rows={3}
                  />
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Enter comma-separated players, optionally with minute (example: "Akinyi 90+2").
              </p>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedFixture(null)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitResult} 
              disabled={isSubmitting || !homeScore || !awayScore}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Result
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
