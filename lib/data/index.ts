import { promises as fs } from 'fs'
import path from 'path'
import type { 
  Team, 
  Fixture, 
  FixtureWithTeams,
  Standing, 
  StandingWithTeam,
  League, 
  Admin,
  ActivityLog 
} from '@/lib/types'

const dataDir = path.join(process.cwd(), 'data')

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

// Teams
export async function getTeams(): Promise<Team[]> {
  const data = await readJsonFile<{ teams: Team[] }>('teams.json')
  return data.teams
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
  const data = await readJsonFile<{ teams: Team[] }>('teams.json')
  data.teams.push(team)
  await writeJsonFile('teams.json', data)
  return team
}

export async function updateTeam(id: string, updates: Partial<Team>): Promise<Team | undefined> {
  const data = await readJsonFile<{ teams: Team[] }>('teams.json')
  const index = data.teams.findIndex(t => t.id === id)
  if (index === -1) return undefined
  data.teams[index] = { ...data.teams[index], ...updates }
  await writeJsonFile('teams.json', data)
  return data.teams[index]
}

export async function deleteTeam(id: string): Promise<boolean> {
  const data = await readJsonFile<{ teams: Team[] }>('teams.json')
  const index = data.teams.findIndex(t => t.id === id)
  if (index === -1) return false
  data.teams.splice(index, 1)
  await writeJsonFile('teams.json', data)
  return true
}

// Leagues
export async function getLeagues(): Promise<League[]> {
  const data = await readJsonFile<{ leagues: League[] }>('leagues.json')
  return data.leagues
}

export async function getLeagueById(id: string): Promise<League | undefined> {
  const leagues = await getLeagues()
  return leagues.find(l => l.id === id)
}

// Fixtures
export async function getFixtures(): Promise<Fixture[]> {
  const data = await readJsonFile<{ fixtures: Fixture[] }>('fixtures.json')
  return data.fixtures
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
  const data = await readJsonFile<{ fixtures: Fixture[] }>('fixtures.json')
  data.fixtures.push(fixture)
  await writeJsonFile('fixtures.json', data)
  return fixture
}

export async function updateFixture(id: string, updates: Partial<Fixture>): Promise<Fixture | undefined> {
  const data = await readJsonFile<{ fixtures: Fixture[] }>('fixtures.json')
  const index = data.fixtures.findIndex(f => f.id === id)
  if (index === -1) return undefined
  data.fixtures[index] = { 
    ...data.fixtures[index], 
    ...updates,
    updatedAt: new Date().toISOString()
  }
  await writeJsonFile('fixtures.json', data)
  return data.fixtures[index]
}

export async function deleteFixture(id: string): Promise<boolean> {
  const data = await readJsonFile<{ fixtures: Fixture[] }>('fixtures.json')
  const index = data.fixtures.findIndex(f => f.id === id)
  if (index === -1) return false
  data.fixtures.splice(index, 1)
  await writeJsonFile('fixtures.json', data)
  return true
}

export async function batchCreateFixtures(fixtures: Fixture[]): Promise<{ success: number; failed: number }> {
  const data = await readJsonFile<{ fixtures: Fixture[] }>('fixtures.json')
  let success = 0
  let failed = 0
  
  for (const fixture of fixtures) {
    try {
      data.fixtures.push(fixture)
      success++
    } catch {
      failed++
    }
  }
  
  await writeJsonFile('fixtures.json', data)
  return { success, failed }
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
  const data = await readJsonFile<{ standings: Standing[] }>('standings.json')
  return data.standings
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
  const data = await readJsonFile<{ standings: Standing[] }>('standings.json')
  const index = data.standings.findIndex(s => s.id === id)
  if (index === -1) return undefined
  data.standings[index] = { ...data.standings[index], ...updates }
  await writeJsonFile('standings.json', data)
  return data.standings[index]
}

// Update standings when a result is entered
export async function updateStandingsForResult(
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
  league: string
): Promise<void> {
  const data = await readJsonFile<{ standings: Standing[] }>('standings.json')
  
  const homeStanding = data.standings.find(s => s.teamId === homeTeamId && s.league === league)
  const awayStanding = data.standings.find(s => s.teamId === awayTeamId && s.league === league)
  
  if (!homeStanding || !awayStanding) return
  
  // Update stats
  homeStanding.played++
  awayStanding.played++
  homeStanding.goalsFor += homeScore
  homeStanding.goalsAgainst += awayScore
  awayStanding.goalsFor += awayScore
  awayStanding.goalsAgainst += homeScore
  homeStanding.goalDifference = homeStanding.goalsFor - homeStanding.goalsAgainst
  awayStanding.goalDifference = awayStanding.goalsFor - awayStanding.goalsAgainst
  
  // Determine result
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
  
  // Update form (keep last 5)
  homeStanding.form = [homeForm, ...homeStanding.form.slice(0, 4)]
  awayStanding.form = [awayForm, ...awayStanding.form.slice(0, 4)]
  
  // Recalculate positions for this league
  const leagueStandings = data.standings
    .filter(s => s.league === league)
    .sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference
      return b.goalsFor - a.goalsFor
    })
  
  leagueStandings.forEach((s, index) => {
    const original = data.standings.find(st => st.id === s.id)
    if (original) original.position = index + 1
  })
  
  await writeJsonFile('standings.json', data)
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
