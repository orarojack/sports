import Link from 'next/link'
import { ArrowRight, Calendar, Trophy, Table2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FixtureCard } from '@/components/fixtures/fixture-card'
import { StandingsTable } from '@/components/standings/standings-table'
import { 
  getFixturesWithTeams, 
  getStandingsWithTeams, 
  getLeagues 
} from '@/lib/data'
import type { FixtureWithTeams, League, StandingWithTeam } from '@/lib/types'

export default async function HomePage() {
  let allFixtures: FixtureWithTeams[] = []
  let fkfStandings: StandingWithTeam[] = []
  let wnslStandings: StandingWithTeam[] = []
  let leagues: League[] = []
  let databaseUnavailable = false

  try {
    ;[allFixtures, fkfStandings, wnslStandings, leagues] = await Promise.all([
      getFixturesWithTeams(),
      getStandingsWithTeams('fkf-nyanza'),
      getStandingsWithTeams('wnsl'),
      getLeagues(),
    ])
  } catch (error) {
    console.error('Failed to load homepage data from database:', error)
    databaseUnavailable = true
  }

  // Get upcoming fixtures (next 6)
  const today = new Date().toISOString().split('T')[0]
  const upcomingFixtures = allFixtures
    .filter(f => f.date >= today && f.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 6)

  // Get recent results (last 4)
  const recentResults = allFixtures
    .filter(f => f.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 4)

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground lg:py-24">
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_25%,rgba(255,255,255,0.05)_50%,transparent_50%,transparent_75%,rgba(255,255,255,0.05)_75%)] bg-[length:40px_40px]" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/10 backdrop-blur">
              <Trophy className="h-10 w-10" />
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              FKF League Management
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
              Official platform for FKF Nyanza Regional League and Women National Super League - 
              Stay updated with fixtures, standings, and results for Season 2025/2026.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link href="/fixtures">
                <Button size="lg" variant="secondary" className="gap-2">
                  <Calendar className="h-5 w-5" />
                  View Fixtures
                </Button>
              </Link>
              <Link href="/standings">
                <Button size="lg" variant="outline" className="gap-2 border-white/30 text-white hover:bg-white/10 hover:text-white">
                  <Table2 className="h-5 w-5" />
                  League Standings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {databaseUnavailable && (
        <section className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Card className="border-destructive/30">
              <CardContent className="py-4 text-sm text-muted-foreground">
                Unable to reach the database right now. Live fixtures, standings, and results will appear once the connection is restored.
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Upcoming Fixtures */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Upcoming Fixtures</h2>
              <p className="mt-1 text-muted-foreground">Next scheduled matches across all leagues</p>
            </div>
            <Link href="/fixtures">
              <Button variant="ghost" className="gap-2">
                View All
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          {upcomingFixtures.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {upcomingFixtures.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Calendar className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No upcoming fixtures</p>
                <p className="text-sm text-muted-foreground">Check back later for new matches</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* League Standings */}
      <section className="bg-muted/30 py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">League Standings</h2>
              <p className="mt-1 text-muted-foreground">Current table positions</p>
            </div>
            <Link href="/standings">
              <Button variant="ghost" className="gap-2">
                Full Table
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <Tabs defaultValue="fkf-nyanza" className="w-full">
            <TabsList className="mb-6 w-full justify-start">
              {leagues.map((league) => (
                <TabsTrigger key={league.id} value={league.id} className="flex-1 sm:flex-none">
                  {league.shortName}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="fkf-nyanza">
              <Card>
                <CardContent className="p-0">
                  <StandingsTable standings={fkfStandings.slice(0, 5)} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="wnsl">
              <Card>
                <CardContent className="p-0">
                  <StandingsTable standings={wnslStandings.slice(0, 5)} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Recent Results */}
      <section className="py-12 lg:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Recent Results</h2>
              <p className="mt-1 text-muted-foreground">Latest completed matches</p>
            </div>
            <Link href="/results">
              <Button variant="ghost" className="gap-2">
                All Results
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {recentResults.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {recentResults.map((fixture) => (
                <FixtureCard key={fixture.id} fixture={fixture} />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                <Trophy className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-lg font-medium">No results yet</p>
                <p className="text-sm text-muted-foreground">Results will appear as matches are completed</p>
              </CardContent>
            </Card>
          )}
        </div>
      </section>
    </div>
  )
}
