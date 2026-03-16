'use client'

import { useState, useCallback } from 'react'
import { Upload, FileJson, FileSpreadsheet, Check, X, Download, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { useTeams } from '@/hooks/use-teams'
import { useFixtures } from '@/hooks/use-fixtures'

interface UploadResult {
  success: number
  failed: number
  errors?: string[]
}

export default function BatchUploadPage() {
  const [jsonInput, setJsonInput] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<UploadResult | null>(null)
  const [error, setError] = useState('')

  const { data: teamsData } = useTeams()
  const { mutate: mutateFixtures } = useFixtures()

  const teams = teamsData?.teams || []

  const handleUpload = async () => {
    setError('')
    setResult(null)

    if (!jsonInput.trim()) {
      setError('Please enter JSON data')
      return
    }

    let fixtures
    try {
      fixtures = JSON.parse(jsonInput)
      if (!Array.isArray(fixtures)) {
        fixtures = [fixtures]
      }
    } catch {
      setError('Invalid JSON format')
      return
    }

    setIsUploading(true)

    try {
      const res = await fetch('/api/fixtures/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fixtures }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed')
      }

      setResult(data)
      mutateFixtures()
      
      if (data.success > 0 && data.failed === 0) {
        setJsonInput('')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
    }
  }

  const templateFixture = {
    matchday: 16,
    season: '2025/2026',
    league: 'fkf-nyanza',
    homeTeamId: 'daraja-mbili-galaxy',
    awayTeamId: 'ciala-fc',
    venue: 'Stadium Name',
    date: '2026-03-22',
    time: '14:00',
    status: 'scheduled'
  }

  const downloadTemplate = () => {
    const template = JSON.stringify([templateFixture], null, 2)
    const blob = new Blob([template], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'fixtures-template.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Batch Upload</h1>
        <p className="mt-1 text-muted-foreground">
          Import multiple fixtures at once using JSON format
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload Form */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileJson className="h-5 w-5" />
              JSON Upload
            </CardTitle>
            <CardDescription>
              Paste JSON array of fixtures to import
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder={`[\n  {\n    "matchday": 16,\n    "season": "2025/2026",\n    "league": "fkf-nyanza",\n    "homeTeamId": "team-id",\n    "awayTeamId": "team-id",\n    "venue": "Stadium",\n    "date": "2026-03-22",\n    "time": "14:00"\n  }\n]`}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="min-h-[300px] font-mono text-sm"
            />

            {error && (
              <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            {result && (
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  {result.success > 0 && (
                    <Badge className="gap-1 bg-secondary text-secondary-foreground">
                      <Check className="h-3 w-3" />
                      {result.success} imported
                    </Badge>
                  )}
                  {result.failed > 0 && (
                    <Badge className="gap-1 bg-destructive text-destructive-foreground">
                      <X className="h-3 w-3" />
                      {result.failed} failed
                    </Badge>
                  )}
                </div>
                {result.errors && result.errors.length > 0 && (
                  <div className="rounded-lg bg-destructive/10 p-3 text-sm">
                    <p className="font-medium text-destructive mb-1">Errors:</p>
                    <ul className="list-disc list-inside text-destructive/80">
                      {result.errors.slice(0, 5).map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                      {result.errors.length > 5 && (
                        <li>...and {result.errors.length - 5} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <Button onClick={handleUpload} disabled={isUploading}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Fixtures
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={downloadTemplate}>
                <Download className="mr-2 h-4 w-4" />
                Download Template
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Help & Reference */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Required Fields</CardTitle>
              <CardDescription>
                Each fixture must include these fields
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li><code className="rounded bg-muted px-1">matchday</code> - Round number (integer)</li>
                <li><code className="rounded bg-muted px-1">season</code> - e.g., "2025/2026"</li>
                <li><code className="rounded bg-muted px-1">league</code> - League ID</li>
                <li><code className="rounded bg-muted px-1">homeTeamId</code> - Team ID</li>
                <li><code className="rounded bg-muted px-1">awayTeamId</code> - Team ID</li>
                <li><code className="rounded bg-muted px-1">venue</code> - Stadium name</li>
                <li><code className="rounded bg-muted px-1">date</code> - YYYY-MM-DD format</li>
                <li><code className="rounded bg-muted px-1">time</code> - HH:MM format (24h)</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Available Team IDs</CardTitle>
              <CardDescription>
                Reference for homeTeamId and awayTeamId
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto">
                <div className="space-y-1 text-sm">
                  {teams.map(team => (
                    <div key={team.id} className="flex justify-between py-1">
                      <span className="text-muted-foreground">{team.name}</span>
                      <code className="rounded bg-muted px-1 text-xs">{team.id}</code>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>League IDs</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm">
                <li><code className="rounded bg-muted px-1">fkf-nyanza</code> - FKF Nyanza Regional League</li>
                <li><code className="rounded bg-muted px-1">wnsl</code> - Women National Super League</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
