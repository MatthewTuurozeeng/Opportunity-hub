import { CircleCheck, Download, Share, SquarePlus, WifiOff } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { useInstallPrompt } from '@/features/pwa/hooks/useInstallPrompt'
import { useOnlineStatus } from '@/features/pwa/hooks/useOnlineStatus'
import { ThemeSelector } from '@/features/theme/components/ThemeSelector'

import { SettingsSection } from './SettingsSection'

function InstallSection() {
  const { availability, install } = useInstallPrompt()

  async function handleInstall() {
    const accepted = await install()
    if (accepted) toast.success('OpportunityHub is installed.')
  }

  return (
    <SettingsSection
      title="Install the app"
      description="Install OpportunityHub to open it from your home screen, dock or Start menu in its own window."
    >
      {availability === 'installed' && (
        <p className="flex items-center gap-2 text-body">
          <CircleCheck className="size-4 text-success-green" aria-hidden="true" />
          You are using the installed app.
        </p>
      )}

      {availability === 'prompt' && (
        <Button className="w-fit" onClick={handleInstall}>
          <Download aria-hidden="true" />
          Install OpportunityHub
        </Button>
      )}

      {availability === 'ios-instructions' && (
        <ol className="flex flex-col gap-2 text-body">
          <li className="flex items-center gap-2">
            <span className="font-medium">1.</span> In Safari, tap <Share className="size-4" aria-label="Share" /> Share.
          </li>
          <li className="flex items-center gap-2">
            <span className="font-medium">2.</span> Choose <SquarePlus className="size-4" aria-hidden="true" />
            <span className="font-medium">Add to Home Screen</span>.
          </li>
        </ol>
      )}

      {availability === 'browser-menu' && (
        <p className="text-body text-muted-foreground">
          Use your browser's menu to install: in Chrome or Edge, choose <span className="font-medium">Install
          OpportunityHub</span> (or <span className="font-medium">Save and share › Install page as app</span>). In Safari on
          a Mac, choose <span className="font-medium">File › Add to Dock</span>.
        </p>
      )}
    </SettingsSection>
  )
}

function AboutSection() {
  const isOnline = useOnlineStatus()

  return (
    <SettingsSection title="About">
      <dl className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1">
          <dt className="text-supporting text-muted-foreground">Version</dt>
          <dd className="text-body tabular-nums">{__APP_VERSION__}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-supporting text-muted-foreground">Connection</dt>
          <dd className="flex items-center gap-1.5 text-body">
            {isOnline ? (
              <>
                <CircleCheck className="size-4 text-success-green" aria-hidden="true" /> Online
              </>
            ) : (
              <>
                <WifiOff className="size-4 text-amber-700" aria-hidden="true" /> Offline
              </>
            )}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-supporting text-muted-foreground">Offline use</dt>
          <dd className="text-body">The app opens offline; your records need a connection.</dd>
        </div>
      </dl>
      <p className="text-supporting text-muted-foreground">
        Updates install when you choose <span className="font-medium">Reload</span> on the update notice, so unsaved work is
        never interrupted.
      </p>
    </SettingsSection>
  )
}

function AppearanceSection() {
  return (
    <SettingsSection
      title="Appearance"
      description="Choose a light or dark theme, or follow your device's setting. The choice is saved on this device."
    >
      <ThemeSelector />
    </SettingsSection>
  )
}

export function AppSettings() {
  return (
    <div className="flex flex-col gap-4">
      <AppearanceSection />
      <InstallSection />
      <AboutSection />
    </div>
  )
}
