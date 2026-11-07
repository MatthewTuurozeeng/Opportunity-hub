import type { ReactNode } from 'react'

import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** Accessibility props to spread onto the wrapped input, select or textarea. */
export interface FormControlInputProps {
  id: string
  'aria-invalid': boolean
  'aria-describedby': string | undefined
  'aria-required': boolean | undefined
}

interface FormControlProps {
  id: string
  label: string
  hint?: string
  errorMessage?: string
  isRequired?: boolean
  className?: string
  children: (inputProps: FormControlInputProps) => ReactNode
}

/** Label, hint and error text wired to any form control for screen readers. */
export function FormControl({ id, label, hint, errorMessage, isRequired, className, children }: FormControlProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = errorMessage ? `${id}-error` : undefined

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <Label htmlFor={id}>
        {label}
        {isRequired && (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </Label>
      {children({
        id,
        'aria-invalid': Boolean(errorMessage),
        'aria-describedby': [hintId, errorId].filter(Boolean).join(' ') || undefined,
        'aria-required': isRequired || undefined,
      })}
      {hint && (
        <p id={hintId} className="text-supporting text-muted-foreground">
          {hint}
        </p>
      )}
      {errorMessage && (
        <p id={errorId} className="text-supporting text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
