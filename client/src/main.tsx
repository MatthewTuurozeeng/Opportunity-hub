import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import { ConfigurationErrorPage } from '@/components/shared/ConfigurationErrorPage'
import { startCapturingInstallPrompt } from '@/features/pwa/hooks/installPrompt'
import { startThemeSync } from '@/features/theme/themeStore'
import { isEnvConfigured, missingEnvVariables } from '@/lib/env'
import '@/styles/globals.css'

// Before anything else renders: the browser may offer installation immediately.
startCapturingInstallPrompt()
startThemeSync()

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element "#root" was not found in index.html.')
}

const root = createRoot(rootElement)

if (isEnvConfigured) {
  // Loaded only when configured, so the Supabase client is never created without its settings.
  const { App } = await import('@/App')
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
} else {
  root.render(<ConfigurationErrorPage missingVariables={missingEnvVariables} />)
}
