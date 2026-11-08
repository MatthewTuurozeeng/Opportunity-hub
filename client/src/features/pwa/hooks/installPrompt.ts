/**
 * Captures the browser's install prompt as early as possible.
 *
 * Chromium fires `beforeinstallprompt` once, usually before the Settings page
 * mounts, so it is stored here at start-up and read later through
 * `useInstallPrompt`. Safari never fires it; iPhone and iPad users install
 * from the Share menu instead.
 */

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

interface InstallPromptState {
  /** The deferred prompt, when the browser offers installation. */
  promptEvent: BeforeInstallPromptEvent | null
  /** True once installed during this session. */
  wasInstalled: boolean
}

let state: InstallPromptState = { promptEvent: null, wasInstalled: false }
const listeners = new Set<() => void>()

function setState(nextState: Partial<InstallPromptState>) {
  state = { ...state, ...nextState }
  listeners.forEach((listener) => listener())
}

export function subscribeToInstallPrompt(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function getInstallPromptState(): InstallPromptState {
  return state
}

export function startCapturingInstallPrompt() {
  window.addEventListener('beforeinstallprompt', (event) => {
    // Keep the browser's own mini-infobar from appearing; Settings offers the install button.
    event.preventDefault()
    setState({ promptEvent: event as BeforeInstallPromptEvent })
  })

  window.addEventListener('appinstalled', () => {
    setState({ promptEvent: null, wasInstalled: true })
  })
}

/** Shows the browser's install dialog. Resolves to true when the user accepts. */
export async function promptToInstall(): Promise<boolean> {
  const { promptEvent } = state
  if (!promptEvent) return false

  await promptEvent.prompt()
  const { outcome } = await promptEvent.userChoice
  // A prompt can only be used once.
  setState({ promptEvent: null, wasInstalled: outcome === 'accepted' })
  return outcome === 'accepted'
}
