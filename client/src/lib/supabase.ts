import { createClient } from '@supabase/supabase-js'

import { env, isEnvConfigured, missingEnvVariables } from './env'

if (!isEnvConfigured) {
  throw new Error(`Missing environment variables: ${missingEnvVariables.join(', ')}`)
}

/**
 * The single Supabase client for the app. Uses the publishable key only;
 * the service-role key must never be used in frontend code.
 *
 * Once the database is linked, generate types with `npm run db:types` and pass
 * `Database` from `@/types/database.types` as the generic: createClient<Database>(...).
 */
export const supabase = createClient(env.supabaseUrl, env.supabasePublishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
