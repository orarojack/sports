import { NextResponse } from 'next/server'
import { getLeagues } from '@/lib/data'

export async function GET() {
  try {
    const leagues = await getLeagues()
    return NextResponse.json({ leagues })
  } catch (error) {
    console.error('Error fetching leagues:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leagues' },
      { status: 500 }
    )
  }
}
