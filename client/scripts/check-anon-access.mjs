// Read-only security check against the live Supabase project.
//
// Signs in as nobody (the public publishable key only) and verifies that a
// signed-out visitor cannot read any table, list or open stored documents, or
// call the write functions. It never creates, changes or deletes anything.
//
// Usage (from client/):  npm run security:check

import { createClient } from '@supabase/supabase-js'

const url = process.env.VITE_SUPABASE_URL
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!url || !publishableKey) {
  console.error('Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY (see client/.env).')
  process.exit(2)
}

const supabase = createClient(url, publishableKey, { auth: { persistSession: false, autoRefreshToken: false } })

const TABLES = [
  'profiles',
  'categories',
  'opportunities',
  'applications',
  'application_status_history',
  'documents',
  'application_documents',
  'application_events',
  'communications',
  'notes',
  'signup_invitations',
]

const results = []

function record(check, passed, detail) {
  results.push({ check, result: passed ? 'PASS' : 'FAIL', detail })
}

// 1. No table is readable. A permission error or an empty result both mean no data leaked.
for (const table of TABLES) {
  const { data, error } = await supabase.from(table).select('*').limit(1)
  const leaked = !error && data.length > 0
  record(`read ${table}`, !leaked, error ? `blocked (${error.code ?? error.message})` : `${data.length} rows visible`)
}

// 2. The documents bucket cannot be listed or opened.
{
  const { data, error } = await supabase.storage.from('documents').list('', { limit: 1 })
  const leaked = !error && data.length > 0
  record('list documents bucket', !leaked, error ? `blocked (${error.message})` : `${data.length} entries visible`)
}
{
  const { data, error } = await supabase.storage
    .from('documents')
    .createSignedUrl('00000000-0000-0000-0000-000000000000/probe.pdf', 60)
  record('sign a document URL', Boolean(error) && !data, error ? `blocked (${error.message})` : 'a signed URL was issued')
}
{
  const { data } = supabase.storage.from('documents').getPublicUrl('00000000-0000-0000-0000-000000000000/probe.pdf')
  const response = await fetch(data.publicUrl)
  record('open a public document URL', !response.ok, `HTTP ${response.status}`)
}

// 3. Write functions refuse signed-out callers.
{
  const { error } = await supabase.rpc('create_opportunity_application', { p_opportunity: {}, p_application: {} })
  record('call create_opportunity_application', Boolean(error), error ? `blocked (${error.code ?? error.message})` : 'call succeeded')
}
{
  const { error } = await supabase.rpc('change_application_status', {
    p_application_id: '00000000-0000-0000-0000-000000000000',
    p_status: 'submitted',
  })
  record('call change_application_status', Boolean(error), error ? `blocked (${error.code ?? error.message})` : 'call succeeded')
}

// 4. The one intentionally public function reveals only a yes/no.
{
  const { data, error } = await supabase.rpc('owner_account_exists')
  record('owner_account_exists returns only a boolean', !error && typeof data === 'boolean', error ? error.message : `returned ${data}`)
}

console.table(results)

const failures = results.filter((result) => result.result === 'FAIL')
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed: signed-out visitors can reach data they should not.`)
  process.exit(1)
}
console.log(`\nAll ${results.length} checks passed: signed-out visitors cannot read or write your data.`)
