// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'

type ChangeListener = () => void

/** In-memory storage; Node's own experimental localStorage can shadow jsdom's. */
function createMemoryStorage(): Storage {
  const values = new Map<string, string>()
  return {
    get length() {
      return values.size
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    removeItem: (key) => void values.delete(key),
    setItem: (key, value) => void values.set(key, String(value)),
  }
}

/** A controllable stand-in for the device's dark-mode setting. */
function mockDeviceTheme(prefersDark: boolean) {
  const listeners: ChangeListener[] = []
  const media = {
    matches: prefersDark,
    addEventListener: (_event: string, listener: ChangeListener) => listeners.push(listener),
  }
  window.matchMedia = vi.fn(() => media) as unknown as typeof window.matchMedia
  return {
    setPrefersDark(value: boolean) {
      media.matches = value
      listeners.forEach((listener) => listener())
    },
  }
}

async function loadStore() {
  // A fresh module per test, so state does not leak between tests.
  vi.resetModules()
  return import('./themeStore')
}

describe('themeStore', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage())
    document.documentElement.classList.remove('dark')
  })

  it('follows the device by default', async () => {
    mockDeviceTheme(true)
    const store = await loadStore()
    store.startThemeSync()

    expect(store.getThemeState()).toEqual({ preference: 'system', resolved: 'dark' })
    expect(document.documentElement).toHaveClass('dark')
  })

  it('saves and applies an explicit choice', async () => {
    mockDeviceTheme(true)
    const store = await loadStore()
    store.startThemeSync()

    store.setThemePreference('light')

    expect(localStorage.getItem('opportunityhub-theme')).toBe('light')
    expect(store.getThemeState()).toEqual({ preference: 'light', resolved: 'light' })
    expect(document.documentElement).not.toHaveClass('dark')
  })

  it('restores the saved choice on the next visit', async () => {
    mockDeviceTheme(false)
    localStorage.setItem('opportunityhub-theme', 'dark')
    const store = await loadStore()

    expect(store.getThemeState()).toEqual({ preference: 'dark', resolved: 'dark' })
  })

  it('tracks device changes only while "system" is selected', async () => {
    const device = mockDeviceTheme(false)
    const store = await loadStore()
    store.startThemeSync()

    device.setPrefersDark(true)
    expect(store.getThemeState().resolved).toBe('dark')

    store.setThemePreference('light')
    device.setPrefersDark(false)
    device.setPrefersDark(true)
    expect(store.getThemeState().resolved).toBe('light')
  })

  it('forgets the saved choice when switching back to "system"', async () => {
    mockDeviceTheme(false)
    const store = await loadStore()
    store.setThemePreference('dark')
    store.setThemePreference('system')

    expect(localStorage.getItem('opportunityhub-theme')).toBeNull()
    expect(store.getThemeState()).toEqual({ preference: 'system', resolved: 'light' })
  })

  it('ignores unknown saved values', async () => {
    mockDeviceTheme(false)
    localStorage.setItem('opportunityhub-theme', 'purple')
    const store = await loadStore()

    expect(store.getThemeState().preference).toBe('system')
  })
})
