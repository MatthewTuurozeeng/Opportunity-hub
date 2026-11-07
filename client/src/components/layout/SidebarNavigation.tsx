import { NavLink } from 'react-router'

import { cn } from '@/lib/utils'

import { NAVIGATION_ITEMS } from './navigationItems'

interface SidebarNavigationProps {
  onNavigate?: () => void
}

export function SidebarNavigation({ onNavigate }: SidebarNavigationProps) {
  return (
    <nav aria-label="Main navigation">
      <ul className="flex flex-col gap-1">
        {NAVIGATION_ITEMS.map(({ label, path, icon: Icon, iconClassName }) => (
          <li key={path}>
            <NavLink
              to={path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'group flex items-center gap-3 rounded-lg px-2 py-1.5 text-body transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-sidebar-accent font-semibold text-sidebar-accent-foreground'
                    : 'font-medium text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    aria-hidden="true"
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-md transition-transform group-hover:scale-105',
                      iconClassName,
                      isActive && 'shadow-sm ring-1 ring-current/20',
                    )}
                  >
                    <Icon className="size-4" strokeWidth={2.25} />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
