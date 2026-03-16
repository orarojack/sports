import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { TeamLogo } from '@/components/teams/team-logo'
import { getTeams, getLeagues, getStandingByTeam } from '@/lib/data'
import type { League, Team, Standing } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Teams',
  description: 'View all teams in FKF Nyanza Regional League and Women National Super League',
}

export default async function TeamsPage() {
  let teams: Team[] = []
  let leagues: League[] = []
  let databaseUnavailable = false

  try {
    ;[teams, leagues] = await Promise.all([
      getTeams(),
      getLeagues(),
    ])
  } catch (error) {
    console.error('Failed to load teams from database:', error)
    databaseUnavailable = true
  }

  // Get standings for each team
  const teamsWithStandings: (Team & { standing?: Standing })[] = databaseUnavailable
    ? []
    : await Promise.all(
        teams.map(async (team) => {
          const standing = await getStandingByTeam(team.id)
          return { ...team, standing }
        })
      )
  const firstLeagueId = leagues[0]?.id ?? ''

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="mt-2 text-muted-foreground">
            All teams competing in Season 2025/2026
          </p>
        </div>

        {databaseUnavailable && (
          <Card className="mb-6 border-destructive/30">
            <CardContent className="py-4 text-sm text-muted-foreground">
              Unable to reach the database right now. Team data will appear once the database connection is restored.
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue={firstLeagueId} className="w-full">
          <TabsList className="mb-6">
            {leagues.map((league) => (
              <TabsTrigger key={league.id} value={league.id}>
                {league.shortName}
              </TabsTrigger>
            ))}
          </TabsList>

          {leagues.map((league) => {
            const leagueTeams = teamsWithStandings
              .filter(t => t.league === league.id)
              .sort((a, b) => {
                // Sort by standing position if available
                if (a.standing && b.standing) {
                  return a.standing.position - b.standing.position
                }
                return a.name.localeCompare(b.name)
              })

            return (
              <TabsContent key={league.id} value={league.id}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {leagueTeams.map((team) => (
                    <Link key={team.id} href={`/teams/${team.id}`}>
                      <Card className="h-full transition-shadow hover:shadow-md">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <TeamLogo name={team.name} logo={team.logo} size="lg" />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold truncate">{team.name}</h3>
                              <p className="text-sm text-muted-foreground">{team.shortName}</p>
                              
                              <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{team.homeVenue}</span>
                              </div>
                              
                              {team.standing && (
                                <div className="mt-3 flex items-center gap-3 text-sm">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                    {team.standing.position}
                                  </span>
                                  <span className="text-muted-foreground">
                                    {team.standing.points} pts
                                  </span>
                                  <span className="text-muted-foreground">
                                    {team.standing.played} played
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </div>
    </div>
  )
}
