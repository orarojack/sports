import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Trophy, Target, Shield } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { TeamLogo } from '@/components/teams/team-logo'
import { FixtureCard } from '@/components/fixtures/fixture-card'
import { 
  getTeamById, 
  getStandingByTeam, 
  getFixturesWithTeams,
  getLeagueById 
} from '@/lib/data'
import { cn } from '@/lib/utils'

interface TeamPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
  const { id } = await params
  const team = await getTeamById(id)
  
  if (!team) {
    return { title: 'Team Not Found' }
  }
  
  return {
    title: team.name,
    description: `View ${team.name} team information, fixtures, and standings`,
  }
}

export default async function TeamPage({ params }: TeamPageProps) {
  const { id } = await params
  const [team, standing, allFixtures] = await Promise.all([
    getTeamById(id),
    getStandingByTeam(id),
    getFixturesWithTeams(),
  ])

  if (!team) {
    notFound()
  }

  const league = await getLeagueById(team.league)

  // Get team fixtures
  const teamFixtures = allFixtures.filter(
    f => f.homeTeam.id === id || f.awayTeam.id === id
  )

  const upcomingFixtures = teamFixtures
    .filter(f => f.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 3)

  const recentResults = teamFixtures
    .filter(f => f.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)

  return (
    <div className="min-h-screen py-8 lg:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link href="/teams">
          <Button variant="ghost" size="sm" className="mb-6 gap-2">
            <ArrowLeft className="h-4 w-4" />
            All Teams
          </Button>
        </Link>

        {/* Team Header */}
        <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
          <TeamLogo name={team.name} logo={team.logo} size="lg" className="h-24 w-24" />
          
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              <h1 className="text-3xl font-bold">{team.name}</h1>
              <Badge variant="outline">{team.shortName}</Badge>
            </div>
            
            <div className="mt-2 flex flex-wrap items-center justify-center gap-4 text-muted-foreground sm:justify-start">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span>{team.homeVenue}</span>
              </div>
              {league && (
                <div className="flex items-center gap-1">
                  <Trophy className="h-4 w-4" />
                  <span>{league.shortName}</span>
                </div>
              )}
              {team.zone && (
                <Badge variant="secondary">Zone {team.zone}</Badge>
              )}
            </div>
          </div>

          {standing && (
            <div className="flex h-24 w-24 flex-col items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <span className="text-3xl font-bold">{standing.position}</span>
              <span className="text-xs uppercase tracking-wider opacity-80">Position</span>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        {standing && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{standing.played}</p>
                <p className="text-sm text-muted-foreground">Played</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-secondary">{standing.won}</p>
                <p className="text-sm text-muted-foreground">Won</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{standing.drawn}</p>
                <p className="text-sm text-muted-foreground">Drawn</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-destructive">{standing.lost}</p>
                <p className="text-sm text-muted-foreground">Lost</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{standing.points}</p>
                <p className="text-sm text-muted-foreground">Points</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Goals and Form */}
        {standing && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5" />
                  Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-around">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-secondary">{standing.goalsFor}</p>
                    <p className="text-sm text-muted-foreground">Scored</p>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div className="text-center">
                    <p className="text-3xl font-bold text-destructive">{standing.goalsAgainst}</p>
                    <p className="text-sm text-muted-foreground">Conceded</p>
                  </div>
                  <div className="h-12 w-px bg-border" />
                  <div className="text-center">
                    <p className={cn(
                      'text-3xl font-bold',
                      standing.goalDifference > 0 && 'text-secondary',
                      standing.goalDifference < 0 && 'text-destructive'
                    )}>
                      {standing.goalDifference > 0 ? '+' : ''}{standing.goalDifference}
                    </p>
                    <p className="text-sm text-muted-foreground">Difference</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5" />
                  Recent Form
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center gap-2">
                  {standing.form.map((result, i) => (
                    <div
                      key={i}
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold',
                        result === 'W' && 'bg-secondary text-secondary-foreground',
                        result === 'D' && 'bg-muted text-muted-foreground',
                        result === 'L' && 'bg-destructive text-white'
                      )}
                    >
                      {result}
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-center text-sm text-muted-foreground">
                  Last {standing.form.length} matches
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fixtures */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Upcoming Fixtures */}
          <div>
            <h2 className="mb-4 text-xl font-bold">Upcoming Fixtures</h2>
            {upcomingFixtures.length > 0 ? (
              <div className="space-y-4">
                {upcomingFixtures.map((fixture) => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No upcoming fixtures scheduled
                </CardContent>
              </Card>
            )}
          </div>

          {/* Recent Results */}
          <div>
            <h2 className="mb-4 text-xl font-bold">Recent Results</h2>
            {recentResults.length > 0 ? (
              <div className="space-y-4">
                {recentResults.map((fixture) => (
                  <FixtureCard key={fixture.id} fixture={fixture} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No recent results
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
