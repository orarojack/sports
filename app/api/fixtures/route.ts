import { NextRequest, NextResponse } from 'next/server'
import { 
  getFixturesWithTeams, 
  createFixture, 
  getUpcomingFixtures,
  getRecentResults,
  getTeams
} from '@/lib/data'
import type { Fixture } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    const date = searchParams.get('date')
    const status = searchParams.get('status')
    const upcoming = searchParams.get('upcoming')
    const limit = searchParams.get('limit')
    
    let fixtures = await getFixturesWithTeams()
    
    // Filter by league
    if (league) {
      fixtures = fixtures.filter(f => f.league === league)
    }
    
    // Filter by date
    if (date) {
      fixtures = fixtures.filter(f => f.date === date)
    }
    
    // Filter by status
    if (status) {
      fixtures = fixtures.filter(f => f.status === status)
    }
    
    // Get upcoming fixtures
    if (upcoming === 'true') {
      const today = new Date().toISOString().split('T')[0]
      fixtures = fixtures
        .filter(f => f.date >= today && f.status !== 'completed')
        .sort((a, b) => a.date.localeCompare(b.date))
    }
    
    // Sort completed by date descending, others by date ascending
    if (status === 'completed') {
      fixtures = fixtures.sort((a, b) => b.date.localeCompare(a.date))
    } else if (!upcoming) {
      fixtures = fixtures.sort((a, b) => a.date.localeCompare(b.date))
    }
    
    // Apply limit
    if (limit) {
      fixtures = fixtures.slice(0, parseInt(limit, 10))
    }
    
    return NextResponse.json({ fixtures })
  } catch (error) {
    console.error('Error fetching fixtures:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fixtures' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const required = ['matchday', 'season', 'league', 'homeTeamId', 'awayTeamId', 'venue', 'date', 'time']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    // Validate teams exist
    const teams = await getTeams()
    const homeTeam = teams.find(t => t.id === body.homeTeamId)
    const awayTeam = teams.find(t => t.id === body.awayTeamId)
    
    if (!homeTeam || !awayTeam) {
      return NextResponse.json(
        { error: 'Invalid team ID' },
        { status: 400 }
      )
    }
    
    const fixture: Fixture = {
      id: `fix-${Date.now()}`,
      matchday: body.matchday,
      season: body.season,
      league: body.league,
      homeTeamId: body.homeTeamId,
      awayTeamId: body.awayTeamId,
      venue: body.venue,
      date: body.date,
      time: body.time,
      status: body.status || 'scheduled',
      homeScore: null,
      awayScore: null,
      scorers: [],
      broadcastTime: body.broadcastTime || body.time,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const created = await createFixture(fixture)
    
    return NextResponse.json({ fixture: created }, { status: 201 })
  } catch (error) {
    console.error('Error creating fixture:', error)
    return NextResponse.json(
      { error: 'Failed to create fixture' },
      { status: 500 }
    )
  }
}
