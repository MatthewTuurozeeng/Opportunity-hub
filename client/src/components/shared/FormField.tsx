import type { ComponentProps } from 'react'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FormFieldProps extends ComponentProps<typeof Input> {
  id: string
  label: string
  errorMessage?: string
  hint?: string
}

/** Labelled input with accessible hint and error text. */
export function FormField({ id, label, errorMessage, hint, ...inputProps }: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined
  const errorId = errorMessage ? `${id}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} aria-invalid={Boolean(errorMessage)} aria-describedby={describedBy} {...inputProps} />
      {hint && !errorMessage && (
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
