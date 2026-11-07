const REQUIRED_ENV_VARIABLES = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_PUBLISHABLE_KEY'] as const

/** Names of required environment variables that are empty or missing. */
export const missingEnvVariables = REQUIRED_ENV_VARIABLES.filter(
  (variableName) => !import.meta.env[variableName]?.trim(),
)

export const isEnvConfigured = missingEnvVariables.length === 0

export const env = {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  supabasePublishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
}
