import { ThemeToggle } from '@/features/theme/components/ThemeToggle'

import { AppLogo } from './AppLogo'
import { MobileNavigation } from './MobileNavigation'

/** Compact top bar shown on mobile and tablet (below lg). */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-2 border-b border-border bg-card px-3 lg:hidden">
      <MobileNavigation />
      <AppLogo />
      <ThemeToggle className="ml-auto" />
    </header>
  )
}
