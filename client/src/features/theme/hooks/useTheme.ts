import { useSyncExternalStore } from 'react'

import { getThemeState, setThemePreference, subscribeToTheme } from '../themeStore'

export function useTheme() {
  const { preference, resolved } = useSyncExternalStore(subscribeToTheme, getThemeState, getThemeState)
  return { preference, resolvedTheme: resolved, setPreference: setThemePreference }
}
