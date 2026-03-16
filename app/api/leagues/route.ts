import { NextRequest, NextResponse } from 'next/server'
import { createLeague, getLeagues } from '@/lib/data'
import type { League } from '@/lib/types'

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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const required = ['name', 'shortName', 'season']
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    const id =
      body.id ||
      body.shortName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    const league: League = {
      id,
      name: body.name,
      shortName: body.shortName,
      season: body.season,
      logo: body.logo || '/logos/fkf-logo.png',
      zones: Array.isArray(body.zones)
        ? body.zones
        : String(body.zones || '')
            .split(',')
            .map((z: string) => z.trim())
            .filter(Boolean),
    }

    const created = await createLeague(league)
    return NextResponse.json({ league: created }, { status: 201 })
  } catch (error) {
    console.error('Error creating league:', error)
    return NextResponse.json(
      { error: 'Failed to create league' },
      { status: 500 }
    )
  }
}
