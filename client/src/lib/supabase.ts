import { createClient } from '@supabase/supabase-js'

import type { Database } from '@/types/database.types'

import { env, isEnvConfigured, missingEnvVariables } from './env'

if (!isEnvConfigured) {
  throw new Error(`Missing environment variables: ${missingEnvVariables.join(', ')}`)
}

/**
 * The single, fully typed Supabase client for the app. Uses the publishable key only;
 * the service-role key must never be used in frontend code.
 * Regenerate `Database` types with `npm run db:types` after schema changes.
 */
export const supabase = createClient<Database>(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
