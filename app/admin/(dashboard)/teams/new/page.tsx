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
  SelectValue,
} from '@/components/ui/select'
import { useLeagues } from '@/hooks/use-leagues'

export default function NewTeamPage() {
  const router = useRouter()
  const { data: leaguesData } = useLeagues()
  const leagues = leaguesData?.leagues || []

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    const formData = new FormData(e.currentTarget)
    const payload = {
      name: formData.get('name') as string,
      shortName: formData.get('shortName') as string,
      league: formData.get('league') as string,
      zone: formData.get('zone') as string,
      homeVenue: formData.get('homeVenue') as string,
      founded: formData.get('founded') ? parseInt(formData.get('founded') as string, 10) : undefined,
      logo: (formData.get('logo') as string) || undefined,
    }

    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create team')
      }

      router.push('/admin/teams')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create team')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 lg:p-8">
      <Link href="/admin/teams">
        <Button variant="ghost" size="sm" className="mb-6 gap-2">
          <ArrowLeft className="h-4 w-4" />
          Back to Teams
        </Button>
      </Link>

      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Add New Team</CardTitle>
            <CardDescription>Create a new team record for a league</CardDescription>
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
                  <Label htmlFor="name">Team Name</Label>
                  <Input id="name" name="name" placeholder="Daraja Mbili Galaxy" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shortName">Short Name</Label>
                  <Input id="shortName" name="shortName" placeholder="DMG" required />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="league">League</Label>
                  <Select name="league" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select league" />
                    </SelectTrigger>
                    <SelectContent>
                      {leagues.map((league) => (
                        <SelectItem key={league.id} value={league.id}>
                          {league.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zone">Zone</Label>
                  <Input id="zone" name="zone" placeholder="A" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="homeVenue">Home Venue</Label>
                <Input id="homeVenue" name="homeVenue" placeholder="Stadium name" required />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="founded">Founded Year (optional)</Label>
                  <Input id="founded" name="founded" type="number" min="1900" max="2100" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logo">Logo Path (optional)</Label>
                  <Input id="logo" name="logo" placeholder="/logos/teams/team-name.png" />
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
                    'Create Team'
                  )}
                </Button>
                <Link href="/admin/teams">
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
