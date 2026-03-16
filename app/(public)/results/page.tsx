import type { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { FixtureCard } from '@/components/fixtures/fixture-card'
import { MatchdayHeader } from '@/components/fixtures/matchday-header'
import { getFixturesWithTeams, getLeagues } from '@/lib/data'
import { groupFixturesByDate } from '@/lib/utils/date'
import { Trophy } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Results',
  description: 'View all match results for FKF Nyanza Regional League and Women National Super League',
}

export default async function ResultsPage() {
  const [allFixtures, leagues] = await Promise.all([
    getFixturesWithTeams(),
    getLeagues(),
  ])

  // Filter to completed fixtures
  const completedFixtures = allFixtures
    .filter(f => f.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))

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
