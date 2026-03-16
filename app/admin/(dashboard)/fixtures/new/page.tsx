'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { useTeams } from '@/hooks/use-teams'
import { useLeagues } from '@/hooks/use-leagues'

export default function NewFixturePage() {
  const router = useRouter()
  const { data: teamsData } = useTeams()
  const { data: leaguesData } = useLeagues()

  const teams = teamsData?.teams || []
  const leagues = leaguesData?.leagues || []

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [selectedLeague, setSelectedLeague] = useState('')

  const filteredTeams = selectedLeague 
    ? teams.filter(t => t.league === selectedLeague)
    : teams

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    
    const fixture = {
      matchday: parseInt(formData.get('matchday') as string, 10),
      season: '2025/2026',
      league: formData.get('league') as string,
      homeTeamId: formData.get('homeTeam') as string,
      awayTeamId: formData.get('awayTeam') as string,
      venue: formData.get('venue') as string,
      date: formData.get('date') as string,
      time: formData.get('time') as string,
      status: formData.get('status') as string || 'scheduled',
    }

    try {
      const res = await fetch('/api/fixtures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(fixture),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create fixture')
      }

      router.push('/admin/fixtures')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create fixture')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <Link href="/admin/fixtures">
        <Button variant="ghost" size="sm" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Fixtures
        </Button>
      </Link>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Fixture</CardTitle>
            <CardDescription>
              Create a new match fixture for the league
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="league">League</Label>
                  <Select 
                    name="league" 
                    required
                    value={selectedLeague}
                    onValueChange={setSelectedLeague}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagues.map(league => (
                        <SelectItem key={league.id} value={league.id}>
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matchday">Matchday / Round</Label>
                  <Input
                    id="matchday"
                    name="matchday"
                    type="number"
                    min="1"
                    placeholder="15"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="homeTeam">Home Team</Label>
                  <Select name="homeTeam" required disabled={!selectedLeague}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select home team" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="awayTeam">Away Team</Label>
                  <Select name="awayTeam" required disabled={!selectedLeague}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select away team" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTeams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="venue">Venue</Label>
                <Input
                  id="venue"
                  name="venue"
                  placeholder="Stadium name"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" defaultValue="scheduled">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="postponed">Postponed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Fixture'
                  )}
                </Button>
                <Link href="/admin/fixtures">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
