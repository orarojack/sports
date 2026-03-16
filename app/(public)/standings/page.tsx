import type { Metadata } from 'next'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { StandingsTable } from '@/components/standings/standings-table'
import { getStandingsWithTeams, getLeagues } from '@/lib/data'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Standings',
  description: 'Current league standings for FKF Nyanza Regional League and Women National Super League',
}

export default async function StandingsPage() {
  const [fkfStandings, wnslStandings, leagues] = await Promise.all([
    getStandingsWithTeams('fkf-nyanza'),
    getStandingsWithTeams('wnsl'),
    getLeagues(),
  ])

  const standingsMap: Record<string, typeof fkfStandings> = {
    'fkf-nyanza': fkfStandings,
    'wnsl': wnslStandings,
  }

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">League Standings</h1>
          <p className="mt-2 text-muted-foreground">
            Current table positions for Season 2025/2026
          </p>
        </div>

        {/* Legend */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground">1</span>
            <span className="text-muted-foreground">Promotion Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-destructive/20 text-xs font-bold text-destructive">14</span>
            <span className="text-muted-foreground">Relegation Zone</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-secondary text-secondary-foreground">W</Badge>
            <span className="text-muted-foreground">Win</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-muted text-muted-foreground">D</Badge>
            <span className="text-muted-foreground">Draw</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-destructive text-white">L</Badge>
            <span className="text-muted-foreground">Loss</span>
          </div>
        </div>

        <Tabs defaultValue="fkf-nyanza" className="w-full">
          <TabsList className="mb-6">
            {leagues.map((league) => (
              <TabsTrigger key={league.id} value={league.id}>
                {league.shortName}
              </TabsTrigger>
            ))}
          </TabsList>

          {leagues.map((league) => {
            const standings = standingsMap[league.id] || []

            return (
              <TabsContent key={league.id} value={league.id}>
                <Card>
                  <CardHeader>
                    <CardTitle>{league.name}</CardTitle>
                    <CardDescription>
                      Season {league.season} - Full league table with all statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    {standings.length > 0 ? (
                      <StandingsTable standings={standings} />
                    ) : (
                      <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-lg font-medium">No standings available</p>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Standings will be updated as matches are played
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Stats Summary */}
                {standings.length > 0 && (
                  <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Leader</p>
                        <p className="mt-1 text-lg font-bold">{standings[0]?.team.name}</p>
                        <p className="text-sm text-muted-foreground">{standings[0]?.points} points</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Most Goals</p>
                        <p className="mt-1 text-lg font-bold">
                          {standings.reduce((max, s) => s.goalsFor > max.goalsFor ? s : max, standings[0])?.team.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {standings.reduce((max, s) => s.goalsFor > max.goalsFor ? s : max, standings[0])?.goalsFor} goals
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Best Defense</p>
                        <p className="mt-1 text-lg font-bold">
                          {standings.reduce((min, s) => s.goalsAgainst < min.goalsAgainst ? s : min, standings[0])?.team.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {standings.reduce((min, s) => s.goalsAgainst < min.goalsAgainst ? s : min, standings[0])?.goalsAgainst} conceded
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <p className="text-sm text-muted-foreground">Total Matches</p>
                        <p className="mt-1 text-lg font-bold">
                          {standings.reduce((sum, s) => sum + s.played, 0) / 2}
                        </p>
                        <p className="text-sm text-muted-foreground">played this season</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}
