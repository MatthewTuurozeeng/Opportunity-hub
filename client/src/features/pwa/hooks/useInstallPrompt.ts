import { useSyncExternalStore } from 'react'

import { getInstallPromptState, promptToInstall, subscribeToInstallPrompt } from './installPrompt'

function isRunningAsInstalledApp(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // Safari on iOS
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function isAppleMobileDevice(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export type InstallAvailability =
  /** Already running as an installed app. */
  | 'installed'
  /** The browser offers a one-click install. */
  | 'prompt'
  /** iPhone or iPad: install from Safari's Share menu. */
  | 'ios-instructions'
  /** Install from the browser menu, or the browser does not support it. */
  | 'browser-menu'

export function useInstallPrompt() {
  const { promptEvent, wasInstalled } = useSyncExternalStore(subscribeToInstallPrompt, getInstallPromptState, getInstallPromptState)

  let availability: InstallAvailability = 'browser-menu'
  if (wasInstalled || isRunningAsInstalledApp()) availability = 'installed'
  else if (promptEvent) availability = 'prompt'
  else if (isAppleMobileDevice()) availability = 'ios-instructions'

  return { availability, install: promptToInstall }
}
