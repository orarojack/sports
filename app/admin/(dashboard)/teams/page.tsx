'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Search, Edit, Trash2, Shield } from 'lucide-react'
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
import { useTeams } from '@/hooks/use-teams'
import { useLeagues } from '@/hooks/use-leagues'
import { TeamLogo } from '@/components/teams/team-logo'

export default function AdminTeamsPage() {
  const [search, setSearch] = useState('')
  const [leagueFilter, setLeagueFilter] = useState<string>('all')
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: teamsData, mutate } = useTeams()
  const { data: leaguesData } = useLeagues()

  const teams = teamsData?.teams || []
  const leagues = leaguesData?.leagues || []

  // Filter teams
  const filteredTeams = teams.filter(t => {
    const matchesSearch = 
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.shortName.toLowerCase().includes(search.toLowerCase())
    
    const matchesLeague = leagueFilter === 'all' || t.league === leagueFilter

    return matchesSearch && matchesLeague
  })

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await fetch(`/api/teams/${deleteId}`, { method: 'DELETE' })
      mutate()
      setDeleteId(null)
    } catch (error) {
      console.error('Failed to delete team:', error)
    }
  }

  const getLeagueName = (leagueId: string) => {
    const league = leagues.find(l => l.id === leagueId)
    return league?.shortName || leagueId
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Teams</h1>
          <p className="mt-1 text-muted-foreground">Manage all teams</p>
        </div>
        <Link href="/admin/teams/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Team
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
                placeholder="Search teams..."
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
          </div>
        </CardContent>
      </Card>

      {/* Teams Grid */}
      <Card>
        <CardHeader>
          <CardTitle>All Teams</CardTitle>
          <CardDescription>
            {filteredTeams.length} team{filteredTeams.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTeams.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <TeamLogo name={team.name} logo={team.logo} size="md" />
                    <div>
                      <p className="font-medium">{team.name}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {team.shortName}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {getLeagueName(team.league)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link href={`/admin/teams/${team.id}/edit`}>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteId(team.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Shield className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">No teams found</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Team?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the team and may affect existing fixtures.
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
