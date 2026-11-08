import {
  ArrowRight,
  BarChart3,
  Briefcase,
  CalendarDays,
  Database,
  FileText,
  KeyRound,
  Lock,
  Mail,
  MonitorSmartphone,
  NotebookPen,
  ShieldCheck,
  UserCheck,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from 'react-router'

import { AppMark } from '@/components/shared/AppMark'
import { buttonVariants } from '@/components/ui/button'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { cn } from '@/lib/utils'
import { ROUTE_PATHS } from '@/routes/routePaths'

import { ProductPreview } from '../components/ProductPreview'

const CURRENT_YEAR = new Date().getFullYear()

interface Feature {
  title: string
  description: string
  icon: LucideIcon
  iconClassName: string
}

const FEATURES: Feature[] = [
  {
    title: 'Applications & status',
    description: 'Record every opportunity, save drafts, and follow each application from Submitted to a final outcome, with a full status history.',
    icon: Briefcase,
    iconClassName: 'bg-violet-100 text-violet-600',
  },
  {
    title: 'Document library',
    description: 'Upload your CV, transcripts and letters once, reuse them across applications, and keep every version you sent.',
    icon: FileText,
    iconClassName: 'bg-amber-100 text-amber-700',
  },
  {
    title: 'Calendar & timeline',
    description: 'Deadlines, interviews, assessments and follow-up reminders on one calendar, with a timeline for each application.',
    icon: CalendarDays,
    iconClassName: 'bg-rose-100 text-rose-600',
  },
  {
    title: 'Communications',
    description: 'Log confirmations, invitations and follow-ups so you always know who said what, and when.',
    icon: Mail,
    iconClassName: 'bg-cyan-100 text-cyan-700',
  },
  {
    title: 'Notes & reflections',
    description: 'Prepare for interviews, capture the questions you were asked, and keep the lessons for next time.',
    icon: NotebookPen,
    iconClassName: 'bg-orange-100 text-orange-700',
  },
  {
    title: 'Dashboard & analytics',
    description: 'See what is due, what is pending and how you are doing, with honest success and interview rates.',
    icon: BarChart3,
    iconClassName: 'bg-emerald-100 text-emerald-700',
  },
  {
    title: 'Export & backup',
    description: 'Download your records as spreadsheets or a full backup whenever you like. Your data stays yours.',
    icon: Database,
    iconClassName: 'bg-blue-100 text-blue-600',
  },
  {
    title: 'Phone and desktop',
    description: 'Works in any modern browser and installs like an app on your phone, tablet or computer.',
    icon: MonitorSmartphone,
    iconClassName: 'bg-slate-100 text-slate-600',
  },
]

const STEPS = [
  {
    title: 'Get your invitation',
    description: 'OpportunityHub is invite-only. Once the owner adds your email address, you can create your account.',
  },
  {
    title: 'Add your opportunities',
    description: 'Record scholarships, internships, jobs and grants as you find them, with deadlines and links.',
  },
  {
    title: 'Track every step',
    description: 'Attach documents, update statuses, schedule interviews and log messages until the final answer.',
  },
]

const PRIVACY_POINTS: { title: string; description: string; icon: LucideIcon }[] = [
  {
    title: 'Only you see your data',
    description: 'Every account is separate. Database rules stop anyone else, including other members, from reading your records.',
    icon: Lock,
  },
  {
    title: 'Private documents',
    description: 'Files are kept in private storage and opened through short-lived links that expire.',
    icon: ShieldCheck,
  },
  {
    title: 'Invite-only accounts',
    description: 'Only invited email addresses can sign up, and the rule is enforced by the database itself.',
    icon: UserCheck,
  },
  {
    title: 'Nothing left on shared devices',
    description: 'The app never stores your records or documents on the device for offline use.',
    icon: KeyRound,
  },
]

const SECTION_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#privacy', label: 'Privacy' },
]

function AuthActions({ className, size = 'default' }: { className?: string; size?: 'default' | 'lg' }) {
  const { session, isLoading } = useAuth()

  if (isLoading) return <div className={cn('h-9', className)} />

  if (session) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Link to={ROUTE_PATHS.DASHBOARD} className={buttonVariants({ size })}>
          Open dashboard
          <ArrowRight aria-hidden="true" />
        </Link>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Link to={ROUTE_PATHS.LOGIN} className={buttonVariants({ variant: 'ghost', size })}>
        Sign in
      </Link>
      <Link to={ROUTE_PATHS.SIGN_UP} className={buttonVariants({ size })}>
        Sign up
      </Link>
    </div>
  )
}

export function LandingPage() {
  const { session } = useAuth()

  return (
    <div className="min-h-svh bg-background">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:ring-2 focus:ring-ring"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to={ROUTE_PATHS.HOME}
            className="flex items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <AppMark />
            <span className="text-card-title font-semibold text-foreground">OpportunityHub</span>
          </Link>
          <nav aria-label="Page sections" className="hidden items-center gap-6 md:flex">
            {SECTION_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-body font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <AuthActions />
        </div>
      </header>

      <main id="main-content">
        {/* Hero */}
        <section className="mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[1.05fr_1fr] lg:px-8">
          <div className="flex flex-col gap-6">
            <p className="text-body font-medium tracking-wide text-muted-foreground">
              opportunities<span className="text-golden-yellow">.</span> applications
              <span className="text-golden-yellow">.</span> progress<span className="text-golden-yellow">.</span>
            </p>
            <h1 className="text-4xl leading-tight font-semibold tracking-tight text-heading sm:text-5xl sm:leading-tight">
              Every application, from first find to final answer.
            </h1>
            <p className="max-w-xl text-lg leading-8 text-muted-foreground">
              OpportunityHub brings your scholarships, internships, jobs and grants into one private workspace, with
              deadlines, documents, messages and progress in one place instead of scattered spreadsheets and inboxes.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              {session ? (
                <Link to={ROUTE_PATHS.DASHBOARD} className={buttonVariants({ size: 'lg' })}>
                  Open your dashboard
                  <ArrowRight aria-hidden="true" />
                </Link>
              ) : (
                <>
                  <Link to={ROUTE_PATHS.SIGN_UP} className={buttonVariants({ size: 'lg' })}>
                    Get started
                    <ArrowRight aria-hidden="true" />
                  </Link>
                  <Link to={ROUTE_PATHS.LOGIN} className={buttonVariants({ variant: 'outline', size: 'lg' })}>
                    Sign in
                  </Link>
                </>
              )}
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-2 text-supporting text-muted-foreground">
              {['Invite-only', 'Private by design', 'Works on phone and desktop'].map((point) => (
                <li key={point} className="flex items-center gap-1.5">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-golden-yellow" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <ProductPreview />
        </section>

        {/* Features */}
        <section id="features" aria-labelledby="features-heading" className="scroll-mt-20 border-t border-border bg-card">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <div className="mb-10 flex max-w-2xl flex-col gap-3">
              <h2 id="features-heading" className="text-3xl font-semibold tracking-tight text-heading">
                Everything an application needs, in one place
              </h2>
              <p className="text-lg leading-8 text-muted-foreground">
                Stop piecing together deadlines from your inbox, files from your downloads and progress from memory.
              </p>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map(({ title, description, icon: Icon, iconClassName }) => (
                <li key={title} className="flex flex-col gap-3 rounded-lg border border-border bg-background p-5">
                  <span
                    aria-hidden="true"
                    className={cn('flex size-10 items-center justify-center rounded-lg', iconClassName)}
                  >
                    <Icon className="size-5" />
                  </span>
                  <h3 className="text-card-title font-semibold">{title}</h3>
                  <p className="text-body text-muted-foreground">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-20 border-t border-border">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <h2 id="how-heading" className="mb-10 text-3xl font-semibold tracking-tight text-heading">
              How it works
            </h2>
            <ol className="grid gap-6 md:grid-cols-3">
              {STEPS.map((step, index) => (
                <li key={step.title} className="flex flex-col gap-3">
                  <span
                    aria-hidden="true"
                    className="flex size-10 items-center justify-center rounded-full bg-primary text-body font-semibold text-primary-foreground"
                  >
                    {index + 1}
                  </span>
                  <h3 className="text-section-heading font-semibold">{step.title}</h3>
                  <p className="text-body text-muted-foreground">{step.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Privacy */}
        <section id="privacy" aria-labelledby="privacy-heading" className="scroll-mt-20 bg-midnight-navy text-pure-white">
          <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 md:py-20 lg:px-8">
            <div className="mb-10 flex max-w-2xl flex-col gap-3">
              <h2 id="privacy-heading" className="text-3xl font-semibold tracking-tight text-pure-white">
                Private by design
              </h2>
              <p className="text-lg leading-8 text-slate-300">
                Applications hold personal details, transcripts and identification. OpportunityHub treats them that way.
              </p>
            </div>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {PRIVACY_POINTS.map(({ title, description, icon: Icon }) => (
                <li key={title} className="flex flex-col gap-3">
                  <Icon className="size-6 text-golden-yellow" aria-hidden="true" />
                  <h3 className="text-card-title font-semibold text-pure-white">{title}</h3>
                  <p className="text-body text-slate-300">{description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Final call to action */}
        <section aria-labelledby="cta-heading" className="border-b border-border">
          <div className="mx-auto flex w-full max-w-3xl flex-col items-center gap-5 px-4 py-16 text-center sm:px-6 md:py-20">
            <h2 id="cta-heading" className="text-3xl font-semibold tracking-tight text-heading">
              Ready to get organized?
            </h2>
            <p className="text-lg leading-8 text-muted-foreground">
              {session
                ? 'Pick up where you left off.'
                : 'If you have been invited, create your account with the email address your invitation was sent to.'}
            </p>
            <AuthActions size="lg" className="justify-center" />
          </div>
        </section>
      </main>

      <footer className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-3 px-4 py-8 text-supporting text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
        <p className="flex items-center gap-2">
          <AppMark className="size-5" />© {CURRENT_YEAR} OpportunityHub
        </p>
        <nav aria-label="Footer" className="flex gap-4">
          <Link to={ROUTE_PATHS.LOGIN} className="hover:text-foreground hover:underline">
            Sign in
          </Link>
          <Link to={ROUTE_PATHS.SIGN_UP} className="hover:text-foreground hover:underline">
            Sign up
          </Link>
        </nav>
      </footer>
    </div>
  )
}
