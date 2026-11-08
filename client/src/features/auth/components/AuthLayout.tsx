import type { ReactNode } from 'react'

import { Link } from 'react-router'

import { AppMark } from '@/components/shared/AppMark'
import { ThemeToggle } from '@/features/theme/components/ThemeToggle'
import { ROUTE_PATHS } from '@/routes/routePaths'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

/** Centered card layout shared by the sign-in and sign-up pages. */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="relative flex min-h-svh items-center justify-center px-4 py-10">
      <ThemeToggle className="absolute top-3 right-3" />
      <div className="flex w-full max-w-sm flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <Link
            to={ROUTE_PATHS.HOME}
            aria-label="OpportunityHub home"
            className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AppMark className="size-11" />
          </Link>
          <div className="flex flex-col gap-1">
            <h1 className="text-page-title font-semibold tracking-tight">{title}</h1>
            <p className="text-body text-muted-foreground">{description}</p>
          </div>
        </header>

        <div className="rounded-lg border border-border bg-card p-6">{children}</div>

        {footer && <div className="text-center text-body text-muted-foreground">{footer}</div>}

        <Link
          to={ROUTE_PATHS.HOME}
          className="text-center text-supporting text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          ← Back to home
        </Link>
      </div>
    </main>
  )
}
