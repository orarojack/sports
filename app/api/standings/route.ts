import { NextRequest, NextResponse } from 'next/server'
import { getStandingsWithTeams, getStandings } from '@/lib/data'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const league = searchParams.get('league')
    
    if (!league) {
      // Return all standings
      const standings = await getStandings()
      return NextResponse.json({ standings })
    }
    
    const standings = await getStandingsWithTeams(league)
    return NextResponse.json({ standings })
  } catch (error) {
    console.error('Error fetching standings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch standings' },
      { status: 500 }
    )
  }
}
