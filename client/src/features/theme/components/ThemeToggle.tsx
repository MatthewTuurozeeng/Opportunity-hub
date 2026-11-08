import { Moon, Sun } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

import { useTheme } from '../hooks/useTheme'
import { THEME_OPTIONS } from '../themeOptions'
import { THEME_PREFERENCES, type ThemePreference } from '../themeStore'

function isThemePreference(value: unknown): value is ThemePreference {
  return typeof value === 'string' && (THEME_PREFERENCES as readonly string[]).includes(value)
}

interface ThemeToggleProps {
  className?: string
  /** Show the current theme's name next to the icon (e.g. in the sidebar). */
  showLabel?: boolean
}

/** Compact Light / Dark / System menu. */
export function ThemeToggle({ className, showLabel = false }: ThemeToggleProps) {
  const { preference, resolvedTheme, setPreference } = useTheme()
  const currentLabel = THEME_OPTIONS.find((option) => option.value === preference)?.label ?? 'System'
  const Icon = resolvedTheme === 'dark' ? Moon : Sun

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            size={showLabel ? 'default' : 'icon'}
            className={cn(showLabel && 'justify-start gap-3 px-3 text-muted-foreground', className)}
            aria-label={`Theme: ${currentLabel}. Change theme`}
          />
        }
      >
        <Icon aria-hidden="true" />
        {showLabel && <span>Theme: {currentLabel}</span>}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Theme</DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={preference}
            onValueChange={(value) => isThemePreference(value) && setPreference(value)}
          >
            {THEME_OPTIONS.map(({ value, label, icon: OptionIcon }) => (
              <DropdownMenuRadioItem key={value} value={value}>
                <OptionIcon aria-hidden="true" />
                {label}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
