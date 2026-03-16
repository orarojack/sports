import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env')
  if (!fs.existsSync(envPath)) return

  const content = fs.readFileSync(envPath, 'utf8')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const idx = line.indexOf('=')
    if (idx === -1) continue
    const key = line.slice(0, idx).trim()
    const value = line.slice(idx + 1).trim()
    if (!process.env[key]) process.env[key] = value
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function toSnake(obj) {
  if (Array.isArray(obj)) return obj.map(toSnake)
  if (obj && typeof obj === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(obj)) {
      const snake = k.replace(/[A-Z]/g, m => `_${m.toLowerCase()}`)
      out[snake] = toSnake(v)
    }
    return out
  }
  return obj
}

async function upsertInChunks(client, table, rows, chunkSize = 200) {
  if (!rows.length) return
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize)
    const { error } = await client.from(table).upsert(chunk, { onConflict: 'id' })
    if (error) throw new Error(`${table} upsert failed: ${error.message}`)
  }
}

async function main() {
  loadEnvFile()

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env')
  }

  const client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  const leagues = readJson(path.join(process.cwd(), 'data', 'leagues.json')).leagues
  const teams = readJson(path.join(process.cwd(), 'data', 'teams.json')).teams
  const fixtures = readJson(path.join(process.cwd(), 'data', 'fixtures.json')).fixtures.map(f => ({
    ...f,
    scorers: Array.isArray(f.scorers) ? f.scorers : [],
  }))
  const standings = readJson(path.join(process.cwd(), 'data', 'standings.json')).standings
  const adminsBlob = readJson(path.join(process.cwd(), 'data', 'admins.json'))
  const admins = adminsBlob.admins || []
  const activityLogs = adminsBlob.activityLogs || []

  // FK order
  await upsertInChunks(client, 'leagues', toSnake(leagues))
  await upsertInChunks(client, 'teams', toSnake(teams))
  await upsertInChunks(client, 'standings', toSnake(standings))
  try {
    await upsertInChunks(client, 'fixtures', toSnake(fixtures))
  } catch (error) {
    const message = String(error?.message || error)
    if (message.includes("Could not find the 'scorers' column")) {
      console.warn("fixtures.scores column missing, seeding fixtures without scorers")
      const fixturesWithoutScorers = fixtures.map(({ scorers, ...rest }) => rest)
      await upsertInChunks(client, 'fixtures', toSnake(fixturesWithoutScorers))
    } else {
      throw error
    }
  }
  await upsertInChunks(client, 'admins', toSnake(admins))
  await upsertInChunks(client, 'activity_logs', toSnake(activityLogs))

  const [{ count: leaguesCount }, { count: teamsCount }, { count: fixturesCount }, { count: standingsCount }] =
    await Promise.all([
      client.from('leagues').select('*', { count: 'exact', head: true }),
      client.from('teams').select('*', { count: 'exact', head: true }),
      client.from('fixtures').select('*', { count: 'exact', head: true }),
      client.from('standings').select('*', { count: 'exact', head: true }),
    ])

  console.log('Seed completed')
  console.log(`leagues: ${leaguesCount ?? 0}`)
  console.log(`teams: ${teamsCount ?? 0}`)
  console.log(`fixtures: ${fixturesCount ?? 0}`)
  console.log(`standings: ${standingsCount ?? 0}`)
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
