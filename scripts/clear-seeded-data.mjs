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

async function clearTable(client, table) {
  const { error } = await client.from(table).delete().neq('id', '__none__')
  if (error) throw new Error(`${table} clear failed: ${error.message}`)
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

  // FK-safe order
  await clearTable(client, 'fixtures')
  await clearTable(client, 'standings')
  await clearTable(client, 'teams')
  await clearTable(client, 'leagues')
  await clearTable(client, 'activity_logs')

  const [{ count: leagues }, { count: teams }, { count: fixtures }, { count: standings }] =
    await Promise.all([
      client.from('leagues').select('*', { count: 'exact', head: true }),
      client.from('teams').select('*', { count: 'exact', head: true }),
      client.from('fixtures').select('*', { count: 'exact', head: true }),
      client.from('standings').select('*', { count: 'exact', head: true }),
    ])

  console.log('Cleanup completed')
  console.log(`leagues: ${leagues ?? 0}`)
  console.log(`teams: ${teams ?? 0}`)
  console.log(`fixtures: ${fixtures ?? 0}`)
  console.log(`standings: ${standings ?? 0}`)
}

main().catch(err => {
  console.error(err.message || err)
  process.exit(1)
})
