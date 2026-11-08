import { cn } from '@/lib/utils'

import { useTheme } from '../hooks/useTheme'
import { THEME_OPTIONS } from '../themeOptions'

/** Large Light / Dark / System choice for Settings, built on native radio buttons. */
export function ThemeSelector() {
  const { preference, resolvedTheme, setPreference } = useTheme()

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="sr-only">Theme</legend>
      <div className="grid gap-2 sm:grid-cols-3">
        {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
          <label
            key={value}
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors',
              'has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring',
              preference === value ? 'border-primary bg-secondary' : 'border-border hover:bg-muted/60',
            )}
          >
            <input
              type="radio"
              name="theme"
              value={value}
              checked={preference === value}
              onChange={() => setPreference(value)}
              className="sr-only"
            />
            <Icon className="size-4 shrink-0" aria-hidden="true" />
            <span className="font-medium">{label}</span>
          </label>
        ))}
      </div>
      {preference === 'system' && (
        <p className="text-supporting text-muted-foreground">
          Following your device, which is currently using the {resolvedTheme} theme.
        </p>
      )}
    </fieldset>
  )
}
