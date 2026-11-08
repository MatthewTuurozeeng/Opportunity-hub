/**
 * Theme preference: light, dark, or follow the device ("system").
 *
 * The choice is saved per device in localStorage and applied as the `dark`
 * class on <html>. public/theme-init.js applies it before first paint; this
 * store keeps it in sync afterwards, including when the device setting changes.
 */

export const THEME_PREFERENCES = ['light', 'dark', 'system'] as const
export type ThemePreference = (typeof THEME_PREFERENCES)[number]
export type ResolvedTheme = 'light' | 'dark'

const STORAGE_KEY = 'opportunityhub-theme'
const DARK_QUERY = '(prefers-color-scheme: dark)'

export interface ThemeState {
  preference: ThemePreference
  resolved: ResolvedTheme
}

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value)
}

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isThemePreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

function resolve(preference: ThemePreference): ResolvedTheme {
  if (preference !== 'system') return preference
  return window.matchMedia(DARK_QUERY).matches ? 'dark' : 'light'
}

function apply(resolved: ResolvedTheme) {
  document.documentElement.classList.toggle('dark', resolved === 'dark')
}

let state: ThemeState | null = null
const listeners = new Set<() => void>()

function setState(preference: ThemePreference) {
  state = { preference, resolved: resolve(preference) }
  apply(state.resolved)
  listeners.forEach((listener) => listener())
}

export function getThemeState(): ThemeState {
  if (!state) {
    const preference = readPreference()
    state = { preference, resolved: resolve(preference) }
  }
  return state
}

export function subscribeToTheme(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function setThemePreference(preference: ThemePreference) {
  try {
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // Not saved (storage blocked), but still applied for this visit.
  }
  setState(preference)
}

/** Follow device changes while "system" is selected, and other tabs' choices. */
export function startThemeSync() {
  window.matchMedia(DARK_QUERY).addEventListener('change', () => {
    if (getThemeState().preference === 'system') setState('system')
  })

  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEY) setState(readPreference())
  })

  apply(getThemeState().resolved)
}
