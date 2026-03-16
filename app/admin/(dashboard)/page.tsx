'use client'

import { Calendar, Trophy, Users, Table2, TrendingUp, Clock } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useFixtures } from '@/hooks/use-fixtures'
import { useTeams } from '@/hooks/use-teams'
import { formatMatchDate, formatMatchTime } from '@/lib/utils/date'

export default function AdminDashboardPage() {
  const { data: fixturesData } = useFixtures()
  const { data: teamsData } = useTeams()

  const fixtures = fixturesData?.fixtures || []
  const teams = teamsData?.teams || []

  // Stats
  const totalFixtures = fixtures.length
  const completedFixtures = fixtures.filter(f => f.status === 'completed').length
  const upcomingFixtures = fixtures.filter(f => f.status === 'scheduled').length
  const liveFixtures = fixtures.filter(f => f.status === 'live').length
  const postponedFixtures = fixtures.filter(f => f.status === 'postponed').length

  // Get next fixtures needing results (completed today or scheduled for today that might need updates)
  const pendingResultFixtures = fixtures
    .filter(f => f.status === 'scheduled' || f.status === 'live')
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 5)

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Welcome to the FKF League admin dashboard
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Teams</p>
                <p className="text-3xl font-bold">{teams.length}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Users className="h-6 w-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Fixtures</p>
                <p className="text-3xl font-bold">{totalFixtures}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary/10">
                <Calendar className="h-6 w-6 text-secondary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold">{completedFixtures}</p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                <Trophy className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-3xl font-bold">{upcomingFixtures}</p>
                {liveFixtures > 0 && (
                  <Badge className="mt-1 bg-destructive text-destructive-foreground">
                    {liveFixtures} LIVE
                  </Badge>
                )}
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
                <TrendingUp className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/fixtures/new">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <Calendar className="h-8 w-8 text-primary" />
              <div>
                <p className="font-medium">Add Fixture</p>
                <p className="text-sm text-muted-foreground">Create new match</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/results">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <Trophy className="h-8 w-8 text-secondary" />
              <div>
                <p className="font-medium">Enter Results</p>
                <p className="text-sm text-muted-foreground">Update scores</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/batch">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <Table2 className="h-8 w-8 text-accent" />
              <div>
                <p className="font-medium">Batch Upload</p>
                <p className="text-sm text-muted-foreground">Import data</p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/standings">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-4 p-4">
              <TrendingUp className="h-8 w-8 text-chart-1" />
              <div>
                <p className="font-medium">Standings</p>
                <p className="text-sm text-muted-foreground">View table</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Pending Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Fixtures Needing Results
          </CardTitle>
          <CardDescription>
            Enter results for these upcoming/live fixtures
          </CardDescription>
        </CardHeader>
        <CardContent>
          {pendingResultFixtures.length > 0 ? (
            <div className="space-y-3">
              {pendingResultFixtures.map((fixture) => (
                <div
                  key={fixture.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-4">
                    <Badge 
                      className={
                        fixture.status === 'live' 
                          ? 'bg-destructive text-destructive-foreground animate-pulse'
                          : 'bg-muted text-muted-foreground'
                      }
                    >
                      {fixture.status === 'live' ? 'LIVE' : formatMatchDate(fixture.date)}
                    </Badge>
                    <div>
                      <p className="font-medium">
                        {fixture.homeTeam.name} vs {fixture.awayTeam.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {fixture.venue} - {formatMatchTime(fixture.time)}
                      </p>
                    </div>
                  </div>
                  <Link href={`/admin/results?fixture=${fixture.id}`}>
                    <Button size="sm">Enter Result</Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-muted-foreground">
              <Trophy className="mx-auto mb-2 h-12 w-12 opacity-50" />
              <p>No fixtures pending results</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
