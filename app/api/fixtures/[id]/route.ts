import { NextRequest, NextResponse } from 'next/server'
import { 
  getFixtureWithTeams, 
  updateFixture, 
  deleteFixture,
  updateStandingsForResult,
  getFixtureById
} from '@/lib/data'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fixture = await getFixtureWithTeams(id)
    
    if (!fixture) {
      return NextResponse.json(
        { error: 'Fixture not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ fixture })
  } catch (error) {
    console.error('Error fetching fixture:', error)
    return NextResponse.json(
      { error: 'Failed to fetch fixture' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    // Check if this is a result update
    const existingFixture = await getFixtureById(id)
    if (!existingFixture) {
      return NextResponse.json(
        { error: 'Fixture not found' },
        { status: 404 }
      )
    }
    
    const isNewResult = 
      body.status === 'completed' && 
      existingFixture.status !== 'completed' &&
      typeof body.homeScore === 'number' &&
      typeof body.awayScore === 'number'
    
    const updated = await updateFixture(id, body)
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Fixture not found' },
        { status: 404 }
      )
    }
    
    // Update standings if this is a new result
    if (isNewResult) {
      await updateStandingsForResult(
        existingFixture.homeTeamId,
        existingFixture.awayTeamId,
        body.homeScore,
        body.awayScore,
        existingFixture.league
      )
    }
    
    return NextResponse.json({ fixture: updated })
  } catch (error) {
    console.error('Error updating fixture:', error)
    return NextResponse.json(
      { error: 'Failed to update fixture' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const deleted = await deleteFixture(id)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Fixture not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting fixture:', error)
    return NextResponse.json(
      { error: 'Failed to delete fixture' },
      { status: 500 }
    )
  }
}
