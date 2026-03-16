import type { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { FixtureCard } from '@/components/fixtures/fixture-card'
import { MatchdayHeader } from '@/components/fixtures/matchday-header'
import { getFixturesWithTeams, getLeagues } from '@/lib/data'
import { groupFixturesByDate } from '@/lib/utils/date'
import { Calendar } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Fixtures',
  description: 'View all upcoming fixtures for FKF Nyanza Regional League and Women National Super League',
}

export default async function FixturesPage() {
  const [allFixtures, leagues] = await Promise.all([
    getFixturesWithTeams(),
    getLeagues(),
  ])

  // Filter to upcoming/scheduled fixtures
  const today = new Date().toISOString().split('T')[0]
  const upcomingFixtures = allFixtures
    .filter(f => f.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))

  // Group by league
  const fixturesByLeague = leagues.map(league => ({
    league,
    fixtures: upcomingFixtures.filter(f => f.league === league.id),
  }))

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Fixtures</h1>
          <p className="mt-2 text-muted-foreground">
            Upcoming matches across all leagues - Season 2025/2026
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
            {upcomingFixtures.length > 0 ? (
              <div className="space-y-8">
                {fixturesByLeague.map(({ league, fixtures }) => {
                  if (fixtures.length === 0) return null
                  const groupedByDate = groupFixturesByDate(fixtures)

                  return (
                    <div key={league.id}>
                      {Array.from(groupedByDate.entries()).map(([date, dateFixtures]) => (
                        <div key={date} className="mb-6">
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
                  )
                })}
              </div>
            ) : (
              <EmptyState />
            )}
          </TabsContent>

          {/* Individual League Tabs */}
          {leagues.map((league) => {
            const leagueFixtures = upcomingFixtures.filter(f => f.league === league.id)
            const groupedByDate = groupFixturesByDate(leagueFixtures)

            return (
              <TabsContent key={league.id} value={league.id}>
                {leagueFixtures.length > 0 ? (
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
        <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No Upcoming Fixtures</h3>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          There are no scheduled fixtures at the moment. Check back later for updates.
        </p>
      </CardContent>
    </Card>
  )
}
