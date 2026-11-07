import type { ReactNode } from 'react'

import { AppMark } from '@/components/shared/AppMark'

interface AuthLayoutProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

/** Centered card layout shared by the sign-in and sign-up pages. */
export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <header className="flex flex-col items-center gap-3 text-center">
          <AppMark className="size-11" />
          <div className="flex flex-col gap-1">
            <h1 className="text-page-title font-semibold tracking-tight">{title}</h1>
            <p className="text-body text-muted-foreground">{description}</p>
          </div>
        </header>

        <div className="rounded-lg border border-border bg-card p-6">{children}</div>

        {footer && <div className="text-center text-body text-muted-foreground">{footer}</div>}
      </div>
    </main>
  )
}
