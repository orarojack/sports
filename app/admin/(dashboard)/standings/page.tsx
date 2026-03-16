'use client'

import { useState } from 'react'
import { Table2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StandingsTable } from '@/components/standings/standings-table'
import { useStandings } from '@/hooks/use-standings'
import { useLeagues } from '@/hooks/use-leagues'

export default function AdminStandingsPage() {
  const [selectedLeague, setSelectedLeague] = useState('fkf-nyanza')
  const { data: leaguesData } = useLeagues()
  const { data: standingsData, isLoading } = useStandings(selectedLeague)

  const leagues = leaguesData?.leagues || []
  const standings = standingsData?.standings || []

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Standings</h1>
        <p className="mt-1 text-muted-foreground">
          View and verify league standings (auto-calculated from results)
        </p>
      </div>

      <Tabs value={selectedLeague} onValueChange={setSelectedLeague}>
        <TabsList className="mb-6">
          {leagues.map(league => (
            <TabsTrigger key={league.id} value={league.id}>
              {league.shortName}
            </TabsTrigger>
          ))}
        </TabsList>

        {leagues.map(league => (
          <TabsContent key={league.id} value={league.id}>
            <Card>
              <CardHeader>
                <CardTitle>{league.name}</CardTitle>
                <CardDescription>
                  Season {league.season} - Standings are automatically updated when results are entered
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-muted-foreground">Loading standings...</div>
                  </div>
                ) : standings.length > 0 ? (
                  <StandingsTable standings={standings} />
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Table2 className="mb-4 h-12 w-12 text-muted-foreground" />
                    <p className="text-lg font-medium">No standings data</p>
                    <p className="text-sm text-muted-foreground">
                      Standings will appear after teams are added
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
