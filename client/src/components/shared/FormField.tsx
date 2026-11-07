import type { ComponentProps } from 'react'

import { Input } from '@/components/ui/input'

import { FormControl } from './FormControl'

interface FormFieldProps extends ComponentProps<typeof Input> {
  id: string
  label: string
  errorMessage?: string
  hint?: string
  isRequired?: boolean
  /** Applied to the field wrapper (label + input + messages). */
  className?: string
  inputClassName?: string
}

/** Labelled text input with accessible hint and error text. */
export function FormField({
  id,
  label,
  errorMessage,
  hint,
  isRequired,
  className,
  inputClassName,
  ...inputProps
}: FormFieldProps) {
  return (
    <FormControl id={id} label={label} hint={hint} errorMessage={errorMessage} isRequired={isRequired} className={className}>
      {(controlProps) => <Input className={inputClassName} {...controlProps} {...inputProps} />}
    </FormControl>
  )
}
