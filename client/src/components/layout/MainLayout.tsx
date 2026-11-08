import { Outlet } from 'react-router'

import { OfflineBanner } from '@/features/pwa/components/OfflineBanner'

import { AppHeader } from './AppHeader'
import { AppSidebar } from './AppSidebar'

export function MainLayout() {
  return (
    <div className="min-h-svh">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>
      <AppSidebar />
      <AppHeader />
      <main id="main-content" className="lg:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <OfflineBanner />
          <Outlet />
        </div>
      </main>
    </div>
  )
}
