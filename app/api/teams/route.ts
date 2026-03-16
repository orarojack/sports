import { NextRequest, NextResponse } from 'next/server'
import { getTeams, getTeamsByLeague, createTeam } from '@/lib/data'
import type { Team } from '@/lib/types'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    
    const teams = league 
      ? await getTeamsByLeague(league)
      : await getTeams()
    
    return NextResponse.json({ teams })
  } catch (error) {
    console.error('Error fetching teams:', error)
    return NextResponse.json(
      { error: 'Failed to fetch teams' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const required = ['name', 'shortName', 'league', 'zone', 'homeVenue']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }
    
    const team: Team = {
      id: body.name.toLowerCase().replace(/\s+/g, '-'),
      name: body.name,
      shortName: body.shortName,
      logo: body.logo || `/logos/teams/${body.name.toLowerCase().replace(/\s+/g, '-')}.png`,
      league: body.league,
      zone: body.zone,
      homeVenue: body.homeVenue,
      founded: body.founded,
      createdAt: new Date().toISOString()
    }
    
    const created = await createTeam(team)
    
    return NextResponse.json({ team: created }, { status: 201 })
  } catch (error) {
    console.error('Error creating team:', error)
    return NextResponse.json(
      { error: 'Failed to create team' },
      { status: 500 }
    )
  }
}
