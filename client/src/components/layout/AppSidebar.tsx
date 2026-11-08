import { AddApplicationButton } from '@/components/shared/AddApplicationButton'
import { SignOutButton } from '@/features/auth/components/SignOutButton'
import { ThemeToggle } from '@/features/theme/components/ThemeToggle'

import { AppLogo } from './AppLogo'
import { SidebarNavigation } from './SidebarNavigation'

/** Fixed left sidebar shown on desktop (lg and up). */
export function AppSidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col gap-6 overflow-y-auto border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex">
      <div className="px-2">
        <AppLogo />
      </div>
      <AddApplicationButton className="w-full" />
      <SidebarNavigation />
      <div className="mt-auto">
        <ThemeToggle showLabel className="mb-2 w-full" />
        <SignOutButton />
      </div>
    </aside>
  )
}
