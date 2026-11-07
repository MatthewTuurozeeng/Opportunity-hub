import { NavLink } from 'react-router'
import { cn } from '@/lib/utils'

import { NAVIGATION_ITEMS } from './navigationItems'

interface SidebarNavigationProps {
  onNavigate?: () => void
}

export function SidebarNavigation({ onNavigate }: SidebarNavigationProps) {
  return (
    <nav aria-label="Main navigation">
      <ul className="flex flex-col gap-0.5">
        {NAVIGATION_ITEMS.map(({ label, path, icon: Icon }) => (
          <li key={path}>
            <NavLink
              to={path}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-body font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )
              }
            >
              <Icon className="size-4 shrink-0" aria-hidden="true" />
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
