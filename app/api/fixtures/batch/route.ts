import { NextRequest, NextResponse } from 'next/server'
import { batchCreateFixtures, getTeams } from '@/lib/data'
import type { Fixture } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { fixtures: fixtureData } = body
    
    if (!Array.isArray(fixtureData) || fixtureData.length === 0) {
      return NextResponse.json(
        { error: 'Invalid fixtures data. Expected non-empty array.' },
        { status: 400 }
      )
    }
    
    // Get all teams for validation
    const teams = await getTeams()
    const teamIds = new Set(teams.map(t => t.id))
    
    const errors: string[] = []
    const validFixtures: Fixture[] = []
    
    fixtureData.forEach((item, index) => {
      const required = ['matchday', 'season', 'league', 'homeTeamId', 'awayTeamId', 'venue', 'date', 'time']
      const missing = required.filter(field => !item[field])
      
      if (missing.length > 0) {
        errors.push(`Row ${index + 1}: Missing fields: ${missing.join(', ')}`)
        return
      }
      
      if (!teamIds.has(item.homeTeamId)) {
        errors.push(`Row ${index + 1}: Invalid home team ID: ${item.homeTeamId}`)
        return
      }
      
      if (!teamIds.has(item.awayTeamId)) {
        errors.push(`Row ${index + 1}: Invalid away team ID: ${item.awayTeamId}`)
        return
      }
      
      const fixture: Fixture = {
        id: `fix-${Date.now()}-${index}`,
        matchday: item.matchday,
        season: item.season,
        league: item.league,
        homeTeamId: item.homeTeamId,
        awayTeamId: item.awayTeamId,
        venue: item.venue,
        date: item.date,
        time: item.time,
        status: item.status || 'scheduled',
        homeScore: item.homeScore ?? null,
        awayScore: item.awayScore ?? null,
        scorers: Array.isArray(item.scorers) ? item.scorers : [],
        broadcastTime: item.broadcastTime || item.time,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      validFixtures.push(fixture)
    })
    
    if (validFixtures.length === 0) {
      return NextResponse.json(
        { 
          success: 0, 
          failed: fixtureData.length, 
          errors 
        },
        { status: 400 }
      )
    }
    
    const result = await batchCreateFixtures(validFixtures)
    
    return NextResponse.json({
      success: result.success,
      failed: result.failed + errors.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error in batch upload:', error)
    return NextResponse.json(
      { error: 'Failed to process batch upload' },
      { status: 500 }
    )
  }
}
