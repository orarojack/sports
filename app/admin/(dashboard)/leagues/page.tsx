'use client'

import { useState } from 'react'
import { Loader2, Plus, Trophy } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useLeagues } from '@/hooks/use-leagues'

export default function AdminLeaguesPage() {
  const { data: leaguesData, mutate } = useLeagues()
  const leagues = leaguesData?.leagues || []

  const [name, setName] = useState('')
  const [shortName, setShortName] = useState('')
  const [season, setSeason] = useState('2025/2026')
  const [logo, setLogo] = useState('/logos/fkf-logo.png')
  const [zones, setZones] = useState('A,B')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleAddLeague = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, shortName, season, logo, zones }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create league')
      }

      await mutate()
      setName('')
      setShortName('')
      setZones('A,B')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create league')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Leagues</h1>
        <p className="mt-1 text-muted-foreground">Add and view league competitions</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New League</CardTitle>
            <CardDescription>Create a league to be used by teams, fixtures, and standings</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddLeague} className="space-y-4">
              {error && (
                <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">League Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="FKF Nyanza Regional League"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input
                    id="shortName"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value)}
                    placeholder="FKF Nyanza"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="season">Season</Label>
                  <Input
                    id="season"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    placeholder="2025/2026"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="zones">Zones (comma separated)</Label>
                  <Input
                    id="zones"
                    value={zones}
                    onChange={(e) => setZones(e.target.value)}
                    placeholder="A,B"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo Path</Label>
                  <Input
                    id="logo"
                    value={logo}
                    onChange={(e) => setLogo(e.target.value)}
                    placeholder="/logos/fkf-logo.png"
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    Add League
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Leagues</CardTitle>
            <CardDescription>{leagues.length} league{leagues.length !== 1 ? 's' : ''} configured</CardDescription>
          </CardHeader>
          <CardContent>
            {leagues.length > 0 ? (
              <div className="space-y-3">
                {leagues.map((league) => (
                  <div
                    key={league.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Trophy className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{league.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {league.id} - {league.season}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {league.zones.map((zone) => (
                        <Badge key={`${league.id}-${zone}`} variant="outline">
                          Zone {zone}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center text-muted-foreground">
                No leagues found
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
