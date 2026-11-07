import { cn } from '@/lib/utils'

interface AppMarkProps {
  className?: string
}

/** The OpportunityHub brand mark. Matches public/favicon.svg. */
export function AppMark({ className }: AppMarkProps) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('size-8 shrink-0', className)}>
      <rect width="32" height="32" rx="8" className="fill-forest-green" />
      <g
        transform="translate(1 -2)"
        fill="none"
        stroke="white"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M7.5 22 L13 16.5 L17 20.5 L24.5 13" />
        <path d="M19.5 12.5 H25 V18" />
      </g>
      <circle cx="8.5" cy="20" r="2.25" className="fill-golden-yellow" />
    </svg>
  )
}
