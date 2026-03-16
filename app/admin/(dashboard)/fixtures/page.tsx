'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Calendar } from 'lucide-react'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useFixtures } from '@/hooks/use-fixtures'
import { useLeagues } from '@/hooks/use-leagues'
import { formatMatchDate, formatMatchTime } from '@/lib/utils/date'
import { TeamLogo } from '@/components/teams/team-logo'
import type { FixtureWithTeams } from '@/lib/types'

const statusConfig = {
  scheduled: { label: 'Scheduled', className: 'bg-muted text-muted-foreground' },
  live: { label: 'LIVE', className: 'bg-destructive text-destructive-foreground' },
  completed: { label: 'Completed', className: 'bg-secondary text-secondary-foreground' },
  postponed: { label: 'Postponed', className: 'bg-[oklch(0.65_0.15_50)] text-white' },
}

export default function AdminFixturesPage() {
  const [search, setSearch] = useState('')
  const [leagueFilter, setLeagueFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: fixturesData, mutate } = useFixtures()
  const { data: leaguesData } = useLeagues()

  const fixtures = fixturesData?.fixtures || []
  const leagues = leaguesData?.leagues || []

  // Filter fixtures
  const filteredFixtures = fixtures.filter(f => {
    const matchesSearch = 
      f.homeTeam.name.toLowerCase().includes(search.toLowerCase()) ||
      f.awayTeam.name.toLowerCase().includes(search.toLowerCase()) ||
      f.venue.toLowerCase().includes(search.toLowerCase())
    
    const matchesLeague = leagueFilter === 'all' || f.league === leagueFilter
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter

    return matchesSearch && matchesLeague && matchesStatus
  })

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await fetch(`/api/fixtures/${deleteId}`, { method: 'DELETE' })
      mutate()
      setDeleteId(null)
    } catch (error) {
      console.error('Failed to delete fixture:', error)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fixtures</h1>
          <p className="mt-1 text-muted-foreground">Manage all match fixtures</p>
        </div>
        <Link href="/admin/fixtures/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Fixture
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search fixtures..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={leagueFilter} onValueChange={setLeagueFilter}>
              <SelectTrigger className="w-full sm:w-48">
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
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="live">Live</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="postponed">Postponed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fixtures List */}
      <Card>
        <CardHeader>
          <CardTitle>All Fixtures</CardTitle>
          <CardDescription>
            {filteredFixtures.length} fixture{filteredFixtures.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredFixtures.length > 0 ? (
            <div className="space-y-3">
              {filteredFixtures.map((fixture) => (
                <FixtureRow 
                  key={fixture.id} 
                  fixture={fixture} 
                  onDelete={() => setDeleteId(fixture.id)}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No fixtures found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Fixture?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the fixture.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

function FixtureRow({ 
  fixture, 
  onDelete 
}: { 
  fixture: FixtureWithTeams
  onDelete: () => void 
}) {
  const status = statusConfig[fixture.status]

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30">
      <div className="flex items-center gap-4">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">{formatMatchDate(fixture.date)}</p>
          <p className="text-sm font-medium">{formatMatchTime(fixture.time)}</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <TeamLogo name={fixture.homeTeam.name} logo={fixture.homeTeam.logo} size="sm" />
            <span className="font-medium">{fixture.homeTeam.shortName}</span>
          </div>
          
          {fixture.status === 'completed' ? (
            <span className="px-2 text-lg font-bold">
              {fixture.homeScore} - {fixture.awayScore}
            </span>
          ) : (
            <span className="px-2 text-muted-foreground">vs</span>
          )}
          
          <div className="flex items-center gap-2">
            <span className="font-medium">{fixture.awayTeam.shortName}</span>
            <TeamLogo name={fixture.awayTeam.name} logo={fixture.awayTeam.logo} size="sm" />
          </div>
        </div>

        <Badge className={status.className}>{status.label}</Badge>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/admin/fixtures/${fixture.id}/edit`}>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </Link>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
