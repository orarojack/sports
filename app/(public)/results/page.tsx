import type { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { FixtureCard } from '@/components/fixtures/fixture-card'
import { MatchdayHeader } from '@/components/fixtures/matchday-header'
import { getFixturesWithTeams, getLeagues } from '@/lib/data'
import type { FixtureWithTeams, League } from '@/lib/types'
import { groupFixturesByDate } from '@/lib/utils/date'
import { Trophy } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Results',
  description: 'View all match results for FKF Nyanza Regional League and Women National Super League',
}

export default async function ResultsPage() {
  let allFixtures: FixtureWithTeams[] = []
  let leagues: League[] = []
  let databaseUnavailable = false

  try {
    ;[allFixtures, leagues] = await Promise.all([
      getFixturesWithTeams(),
      getLeagues(),
    ])
  } catch (error) {
    console.error('Failed to load results from database:', error)
    databaseUnavailable = true
  }

  // Filter to completed fixtures
  const completedFixtures = allFixtures
    .filter(f => f.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))

  const topScorers = Array.from(
    completedFixtures.reduce((acc, fixture) => {
      fixture.scorers.forEach((scorer) => {
        const key = `${scorer.teamId}::${scorer.playerName.toLowerCase()}`
        const existing = acc.get(key)
        const teamName =
          scorer.teamId === fixture.homeTeam.id
            ? fixture.homeTeam.name
            : scorer.teamId === fixture.awayTeam.id
              ? fixture.awayTeam.name
              : 'Unknown Team'

        if (existing) {
          existing.goals += 1
        } else {
          acc.set(key, {
            playerName: scorer.playerName,
            teamName,
            goals: 1,
          })
        }
      })
      return acc
    }, new Map<string, { playerName: string; teamName: string; goals: number }>())
  )
    .map(([, value]) => value)
    .sort((a, b) => b.goals - a.goals || a.playerName.localeCompare(b.playerName))
    .slice(0, 10)

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Results</h1>
          <p className="mt-2 text-muted-foreground">
            Completed match results - Season 2025/2026
          </p>
        </div>

        {databaseUnavailable && (
          <Card className="mb-6 border-destructive/30">
            <CardContent className="py-4 text-sm text-muted-foreground">
              Unable to reach the database right now. Results will appear once the database connection is restored.
            </CardContent>
          </Card>
        )}

        {topScorers.length > 0 && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <h2 className="mb-3 text-lg font-semibold">Top Scorers</h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {topScorers.map((scorer, index) => (
                  <div
                    key={`${scorer.teamName}-${scorer.playerName}`}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {index + 1}. {scorer.playerName}
                      </p>
                      <p className="text-xs text-muted-foreground">{scorer.teamName}</p>
                    </div>
                    <span className="text-sm font-bold">{scorer.goals}G</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Leagues</TabsTrigger>
            {leagues.map((league) => (
              <TabsTrigger key={league.id} value={league.id}>
                {league.shortName}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Leagues Tab */}
          <TabsContent value="all">
            {completedFixtures.length > 0 ? (
              <div className="space-y-6">
                {(() => {
                  const grouped = groupFixturesByDate(completedFixtures)
                  return Array.from(grouped.entries()).map(([date, dateFixtures]) => (
                    <div key={date}>
                      <MatchdayHeader 
                        date={date} 
                        league={dateFixtures[0]?.league || 'fkf-nyanza'}
                        matchday={dateFixtures[0]?.matchday}
                      />
                      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {dateFixtures.map((fixture) => (
                          <FixtureCard key={fixture.id} fixture={fixture} />
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          {/* Individual League Tabs */}
          {leagues.map((league) => {
            const leagueResults = completedFixtures.filter(f => f.league === league.id)
            const groupedByDate = groupFixturesByDate(leagueResults)

            return (
              <TabsContent key={league.id} value={league.id}>
                {leagueResults.length > 0 ? (
                  <div className="space-y-6">
                    {Array.from(groupedByDate.entries()).map(([date, dateFixtures]) => (
                      <div key={date}>
                        <MatchdayHeader 
                          date={date} 
                          league={league.id}
                          matchday={dateFixtures[0]?.matchday}
                        />
                        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {dateFixtures.map((fixture) => (
                            <FixtureCard key={fixture.id} fixture={fixture} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState />
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16 text-center">
        <Trophy className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No Results Yet</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          Results will appear here as matches are completed.
        </p>
      </CardContent>
    </Card>
  )
}
