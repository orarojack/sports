// League Types
export interface League {
  id: string
  name: string
  shortName: string
  season: string
  logo: string
  zones: string[]
}

// Team Types
export interface Team {
  id: string
  name: string
  shortName: string
  logo: string
  league: string
  zone: string
  homeVenue: string
  founded?: number
  createdAt: string
}

// Fixture Status
export type FixtureStatus = 'scheduled' | 'live' | 'completed' | 'postponed'

export interface GoalScorer {
  teamId: string
  playerName: string
  minute?: number | null
}

// Fixture Types
export interface Fixture {
  id: string
  matchday: number
  season: string
  league: string
  homeTeamId: string
  awayTeamId: string
  venue: string
  date: string
  time: string
  status: FixtureStatus
  homeScore: number | null
  awayScore: number | null
  scorers: GoalScorer[]
  broadcastTime?: string
  createdAt: string
  updatedAt: string
}

// Fixture with populated team data
export interface FixtureWithTeams extends Omit<Fixture, 'homeTeamId' | 'awayTeamId'> {
  homeTeam: Team
  awayTeam: Team
}

// Standing Types
export interface Standing {
  id: string
  teamId: string
  league: string
  season: string
  played: number
  won: number
  drawn: number
  lost: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  points: number
  form: ('W' | 'D' | 'L')[]
  position: number
}

// Standing with populated team data
export interface StandingWithTeam extends Standing {
  team: Team
}

// Admin User Types
export type AdminRole = 'super_admin' | 'editor' | 'viewer'

export interface Admin {
  id: string
  email: string
  passwordHash: string
  role: AdminRole
  name: string
  createdAt: string
}

// Auth Types
export interface AdminSession {
  id: string
  email: string
  role: AdminRole
  name: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Activity Log
export interface ActivityLog {
  id: string
  adminId: string
  adminName: string
  action: string
  entity: string
  entityId: string
  details?: string
  createdAt: string
}

// Batch Upload Types
export interface BatchUploadResult {
  success: number
  failed: number
  errors: string[]
}
