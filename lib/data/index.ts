import { promises as fs } from 'fs'
import path from 'path'
import { getSupabaseServerClient } from '@/lib/supabase/server'
import type { 
  Team, 
  Fixture, 
  GoalScorer,
  FixtureWithTeams,
  Standing, 
  StandingWithTeam,
  League, 
  Admin,
  ActivityLog 
} from '@/lib/types'

const dataDir = path.join(process.cwd(), 'data')
type DbRow = Record<string, unknown>

// Generic read/write helpers
async function readJsonFile<T>(filename: string): Promise<T> {
  const filePath = path.join(dataDir, filename)
  const data = await fs.readFile(filePath, 'utf-8')
  return JSON.parse(data)
}

async function writeJsonFile<T>(filename: string, data: T): Promise<void> {
  const filePath = path.join(dataDir, filename)
  await fs.writeFile(filePath, JSON.stringify(data, null, 2))
}

function valueFromRow<T>(row: DbRow, camelKey: string, snakeKey?: string): T {
  const snake = snakeKey ?? camelKey.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`)
  return (row[camelKey] ?? row[snake]) as T
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String)
  return []
}

function mapLeague(row: DbRow): League {
  return {
    id: String(valueFromRow(row, 'id')),
    name: String(valueFromRow(row, 'name')),
    shortName: String(valueFromRow(row, 'shortName')),
    season: String(valueFromRow(row, 'season')),
    logo: String(valueFromRow(row, 'logo')),
    zones: asStringArray(valueFromRow(row, 'zones')),
  }
}

function mapTeam(row: DbRow): Team {
  return {
    id: String(valueFromRow(row, 'id')),
    name: String(valueFromRow(row, 'name')),
    shortName: String(valueFromRow(row, 'shortName')),
    logo: String(valueFromRow(row, 'logo')),
    league: String(valueFromRow(row, 'league')),
    zone: String(valueFromRow(row, 'zone')),
    homeVenue: String(valueFromRow(row, 'homeVenue')),
    founded: valueFromRow<number | undefined>(row, 'founded'),
    createdAt: String(valueFromRow(row, 'createdAt')),
  }
}

function mapFixture(row: DbRow): Fixture {
  const scorers = valueFromRow<unknown>(row, 'scorers')
  const parsedScorers = Array.isArray(scorers)
    ? (scorers as GoalScorer[])
    : []

  return {
    id: String(valueFromRow(row, 'id')),
    matchday: Number(valueFromRow(row, 'matchday')),
    season: String(valueFromRow(row, 'season')),
    league: String(valueFromRow(row, 'league')),
    homeTeamId: String(valueFromRow(row, 'homeTeamId')),
    awayTeamId: String(valueFromRow(row, 'awayTeamId')),
    venue: String(valueFromRow(row, 'venue')),
    date: String(valueFromRow(row, 'date')),
    time: String(valueFromRow(row, 'time')),
    status: valueFromRow<Fixture['status']>(row, 'status'),
    homeScore: valueFromRow<number | null>(row, 'homeScore'),
    awayScore: valueFromRow<number | null>(row, 'awayScore'),
    scorers: parsedScorers,
    broadcastTime: valueFromRow<string | undefined>(row, 'broadcastTime'),
    createdAt: String(valueFromRow(row, 'createdAt')),
    updatedAt: String(valueFromRow(row, 'updatedAt')),
  }
}

function mapStanding(row: DbRow): Standing {
  const form = valueFromRow<unknown>(row, 'form')
  const parsedForm = Array.isArray(form) ? form : []
  return {
    id: String(valueFromRow(row, 'id')),
    teamId: String(valueFromRow(row, 'teamId')),
    league: String(valueFromRow(row, 'league')),
    season: String(valueFromRow(row, 'season')),
    played: Number(valueFromRow(row, 'played')),
    won: Number(valueFromRow(row, 'won')),
    drawn: Number(valueFromRow(row, 'drawn')),
    lost: Number(valueFromRow(row, 'lost')),
    goalsFor: Number(valueFromRow(row, 'goalsFor')),
    goalsAgainst: Number(valueFromRow(row, 'goalsAgainst')),
    goalDifference: Number(valueFromRow(row, 'goalDifference')),
    points: Number(valueFromRow(row, 'points')),
    form: parsedForm as ('W' | 'D' | 'L')[],
    position: Number(valueFromRow(row, 'position')),
  }
}

function toSnakeCasePayload(data: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`),
      value,
    ])
  )
}

async function selectAll(table: string): Promise<DbRow[]> {
  const client = getSupabaseServerClient()
  const { data, error } = await client.from(table).select('*')
  if (error) throw error
  return (data ?? []) as DbRow[]
}

async function insertOne(
  table: string,
  payload: Record<string, unknown>
): Promise<DbRow> {
  const client = getSupabaseServerClient()
  const snakePayload = toSnakeCasePayload(payload)

  let result = await client.from(table).insert(snakePayload).select('*').single()
  if (result.error) {
    result = await client.from(table).insert(payload).select('*').single()
  }
  if (result.error) throw result.error
  return result.data as DbRow
}

async function updateOne(
  table: string,
  id: string,
  updates: Record<string, unknown>
): Promise<DbRow | undefined> {
  const client = getSupabaseServerClient()
  const snakePayload = toSnakeCasePayload(updates)

  let result = await client.from(table).update(snakePayload).eq('id', id).select('*').single()
  if (result.error) {
    result = await client.from(table).update(updates).eq('id', id).select('*').single()
  }
  if (result.error) {
    if (result.error.code === 'PGRST116') return undefined
    throw result.error
  }
  return result.data as DbRow
}

async function deleteById(table: string, id: string): Promise<boolean> {
  const client = getSupabaseServerClient()
  const { error, count } = await client
    .from(table)
    .delete({ count: 'exact' })
    .eq('id', id)

  if (error) throw error
  return Boolean((count ?? 0) > 0)
}

async function insertMany(table: string, payloads: Record<string, unknown>[]): Promise<void> {
  const client = getSupabaseServerClient()
  const snakePayloads = payloads.map(toSnakeCasePayload)
  let result = await client.from(table).insert(snakePayloads)
  if (result.error) {
    result = await client.from(table).insert(payloads)
  }
  if (result.error) throw result.error
}

function isMissingScorersColumnError(error: unknown): boolean {
  const message =
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: unknown }).message)
      : String(error ?? '')

  return message.includes("Could not find the 'scorers' column")
}

async function upsertMany(table: string, payloads: Record<string, unknown>[]): Promise<void> {
  const client = getSupabaseServerClient()
  const snakePayloads = payloads.map(toSnakeCasePayload)
  let result = await client.from(table).upsert(snakePayloads, { onConflict: 'id' })
  if (result.error) {
    result = await client.from(table).upsert(payloads, { onConflict: 'id' })
  }
  if (result.error) throw result.error
}

// Teams
export async function getTeams(): Promise<Team[]> {
  const rows = await selectAll('teams')
  return rows.map(mapTeam)
}

export async function getTeamById(id: string): Promise<Team | undefined> {
  const teams = await getTeams()
  return teams.find(t => t.id === id)
}

export async function getTeamsByLeague(league: string): Promise<Team[]> {
  const teams = await getTeams()
  return teams.filter(t => t.league === league)
}

export async function createTeam(team: Team): Promise<Team> {
  const row = await insertOne('teams', team as unknown as Record<string, unknown>)
  return mapTeam(row)
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
  const row = await updateOne('teams', id, updates as unknown as Record<string, unknown>)
  return row ? mapTeam(row) : undefined
}

export async function deleteTeam(id: string): Promise<boolean> {
  return deleteById('teams', id)
}

// Leagues
export async function getLeagues(): Promise<League[]> {
  const rows = await selectAll('leagues')
  return rows.map(mapLeague)
}

export async function getLeagueById(id: string): Promise<League | undefined> {
  const leagues = await getLeagues()
  return leagues.find(l => l.id === id)
}

export async function createLeague(league: League): Promise<League> {
  const row = await insertOne('leagues', league as unknown as Record<string, unknown>)
  return mapLeague(row)
}

// Fixtures
export async function getFixtures(): Promise<Fixture[]> {
  const rows = await selectAll('fixtures')
  return rows.map(mapFixture)
}

export async function getFixtureById(id: string): Promise<Fixture | undefined> {
  const fixtures = await getFixtures()
  return fixtures.find(f => f.id === id)
}

export async function getFixturesByDate(date: string): Promise<Fixture[]> {
  const fixtures = await getFixtures()
  return fixtures.filter(f => f.date === date)
}

export async function getFixturesByLeague(league: string): Promise<Fixture[]> {
  const fixtures = await getFixtures()
  return fixtures.filter(f => f.league === league)
}

export async function getFixturesByStatus(status: Fixture['status']): Promise<Fixture[]> {
  const fixtures = await getFixtures()
  return fixtures.filter(f => f.status === status)
}

export async function getUpcomingFixtures(limit?: number): Promise<Fixture[]> {
  const fixtures = await getFixtures()
  const today = new Date().toISOString().split('T')[0]
  const upcoming = fixtures
    .filter(f => f.date >= today && f.status !== 'completed')
    .sort((a, b) => a.date.localeCompare(b.date))
  return limit ? upcoming.slice(0, limit) : upcoming
}

export async function getRecentResults(limit?: number): Promise<Fixture[]> {
  const fixtures = await getFixtures()
  const completed = fixtures
    .filter(f => f.status === 'completed')
    .sort((a, b) => b.date.localeCompare(a.date))
  return limit ? completed.slice(0, limit) : completed
}

export async function createFixture(fixture: Fixture): Promise<Fixture> {
  try {
    const row = await insertOne('fixtures', fixture as unknown as Record<string, unknown>)
    return mapFixture(row)
  } catch (error) {
    if (!isMissingScorersColumnError(error)) throw error

    const { scorers, ...fallbackFixture } = fixture
    const row = await insertOne('fixtures', fallbackFixture as unknown as Record<string, unknown>)
    return {
      ...mapFixture(row),
      scorers: [],
    }
  }
}

export async function updateFixture(id: string, updates: Partial<Fixture>): Promise<Fixture | undefined> {
  const payload = {
    ...updates,
    updatedAt: new Date().toISOString(),
  } as unknown as Record<string, unknown>

  try {
    const row = await updateOne('fixtures', id, payload)
    return row ? mapFixture(row) : undefined
  } catch (error) {
    if (!isMissingScorersColumnError(error)) throw error

    const { scorers, ...fallbackPayload } = payload
    const row = await updateOne('fixtures', id, fallbackPayload)
    return row ? { ...mapFixture(row), scorers: [] } : undefined
  }
}

export async function deleteFixture(id: string): Promise<boolean> {
  return deleteById('fixtures', id)
}

export async function batchCreateFixtures(fixtures: Fixture[]): Promise<{ success: number; failed: number }> {
  try {
    await insertMany(
      'fixtures',
      fixtures as unknown as Record<string, unknown>[]
    )
  } catch (error) {
    if (!isMissingScorersColumnError(error)) throw error

    const fallbackFixtures = fixtures.map(({ scorers, ...rest }) => rest)
    await insertMany(
      'fixtures',
      fallbackFixtures as unknown as Record<string, unknown>[]
    )
  }
  return { success: fixtures.length, failed: 0 }
}

// Fixtures with Teams populated
export async function getFixturesWithTeams(): Promise<FixtureWithTeams[]> {
  const [fixtures, teams] = await Promise.all([getFixtures(), getTeams()])
  const teamMap = new Map(teams.map(t => [t.id, t]))
  
  return fixtures.map(f => {
    const { homeTeamId, awayTeamId, ...rest } = f
    return {
      ...rest,
      homeTeam: teamMap.get(homeTeamId)!,
      awayTeam: teamMap.get(awayTeamId)!
    }
  }).filter(f => f.homeTeam && f.awayTeam)
}

export async function getFixtureWithTeams(id: string): Promise<FixtureWithTeams | undefined> {
  const all = await getFixturesWithTeams()
  return all.find(f => f.id === id)
}

// Standings
export async function getStandings(): Promise<Standing[]> {
  const rows = await selectAll('standings')
  return rows.map(mapStanding)
}

export async function getStandingsByLeague(league: string): Promise<Standing[]> {
  const standings = await getStandings()
  return standings
    .filter(s => s.league === league)
    .sort((a, b) => a.position - b.position)
}

export async function getStandingByTeam(teamId: string): Promise<Standing | undefined> {
  const standings = await getStandings()
  return standings.find(s => s.teamId === teamId)
}

export async function updateStanding(id: string, updates: Partial<Standing>): Promise<Standing | undefined> {
  const row = await updateOne('standings', id, updates as unknown as Record<string, unknown>)
  return row ? mapStanding(row) : undefined
}

// Update standings when a result is entered
export async function updateStandingsForResult(
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
  league: string
): Promise<void> {
  const standings = await getStandings()
  const homeStanding = standings.find(s => s.teamId === homeTeamId && s.league === league)
  const awayStanding = standings.find(s => s.teamId === awayTeamId && s.league === league)

  if (!homeStanding || !awayStanding) return
  
  homeStanding.played++
  awayStanding.played++
  homeStanding.goalsFor += homeScore
  homeStanding.goalsAgainst += awayScore
  awayStanding.goalsFor += awayScore
  awayStanding.goalsAgainst += homeScore
  homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst
  awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst
  
  let homeForm: 'W' | 'D' | 'L'
  let awayForm: 'W' | 'D' | 'L'
  
  if (homeScore > awayScore) {
    homeStanding.won++
    homeStanding.points += 3
    awayStanding.lost++
    homeForm = 'W'
    awayForm = 'L'
  } else if (homeScore < awayScore) {
    awayStanding.won++
    awayStanding.points += 3
    homeStanding.lost++
    homeForm = 'L'
    awayForm = 'W'
  } else {
    homeStanding.drawn++
    awayStanding.drawn++
    homeStanding.points++
    awayStanding.points++
    homeForm = 'D'
    awayForm = 'D'
  }
  
  homeStanding.form = [homeForm, ...homeStanding.form.slice(0, 4)]
  awayStanding.form = [awayForm, ...awayStanding.form.slice(0, 4)]
  
  const leagueStandings = standings
    .filter(s => s.league === league)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })
  
  leagueStandings.forEach((s, index) => {
    s.position = index + 1
  })

  await upsertMany(
    'standings',
    leagueStandings as unknown as Record<string, unknown>[]
  )
}

// Standings with Teams populated
export async function getStandingsWithTeams(league: string): Promise<StandingWithTeam[]> {
  const [standings, teams] = await Promise.all([
    getStandingsByLeague(league),
    getTeams()
  ])
  const teamMap = new Map(teams.map(t => [t.id, t]))
  
  return standings.map(s => ({
    ...s,
    team: teamMap.get(s.teamId)!
  })).filter(s => s.team)
}

// Admins
export async function getAdmins(): Promise<Admin[]> {
  const data = await readJsonFile<{ admins: Admin[] }>('admins.json')
  return data.admins
}

export async function getAdminByEmail(email: string): Promise<Admin | undefined> {
  const admins = await getAdmins()
  return admins.find(a => a.email === email)
}

export async function getAdminById(id: string): Promise<Admin | undefined> {
  const admins = await getAdmins()
  return admins.find(a => a.id === id)
}

export async function createAdmin(admin: Admin): Promise<Admin> {
  const data = await readJsonFile<{ admins: Admin[]; activityLogs: ActivityLog[] }>('admins.json')
  data.admins.push(admin)
  await writeJsonFile('admins.json', data)
  return admin
}

export async function updateAdmin(id: string, updates: Partial<Admin>): Promise<Admin | undefined> {
  const data = await readJsonFile<{ admins: Admin[]; activityLogs: ActivityLog[] }>('admins.json')
  const index = data.admins.findIndex(a => a.id === id)
  if (index === -1) return undefined
  data.admins[index] = { ...data.admins[index], ...updates }
  await writeJsonFile('admins.json', data)
  return data.admins[index]
}

export async function deleteAdmin(id: string): Promise<boolean> {
  const data = await readJsonFile<{ admins: Admin[]; activityLogs: ActivityLog[] }>('admins.json')
  const index = data.admins.findIndex(a => a.id === id)
  if (index === -1) return false
  data.admins.splice(index, 1)
  await writeJsonFile('admins.json', data)
  return true
}

// Activity Logs
export async function getActivityLogs(limit?: number): Promise<ActivityLog[]> {
  const data = await readJsonFile<{ admins: Admin[]; activityLogs: ActivityLog[] }>('admins.json')
  const sorted = data.activityLogs.sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )
  return limit ? sorted.slice(0, limit) : sorted
}

export async function createActivityLog(log: ActivityLog): Promise<void> {
  const data = await readJsonFile<{ admins: Admin[]; activityLogs: ActivityLog[] }>('admins.json')
  data.activityLogs.push(log)
  await writeJsonFile('admins.json', data)
}
