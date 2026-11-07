import { CloudUpload, X } from 'lucide-react'
import { type DragEvent, useId, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { ALLOWED_FILE_TYPES_LABEL, FILE_INPUT_ACCEPT, MAX_FILE_SIZE_BYTES } from '../constants/fileRules'
import { formatFileSize, resolveMimeType } from '../utils/fileUtils'
import { DocumentFileIcon } from './DocumentFileIcon'

interface FileDropZoneProps {
  file: File | null
  onFileChange: (file: File | null) => void
  errorMessage?: string | null
  disabled?: boolean
}

/** File picker that also accepts drag and drop. Keyboard users use the native file input. */
export function FileDropZone({ file, onFileChange, errorMessage, disabled }: FileDropZoneProps) {
  const inputId = useId()
  const errorId = `${inputId}-error`
  const [isDragging, setIsDragging] = useState(false)

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (disabled) return

    const droppedFile = event.dataTransfer.files.item(0)
    if (droppedFile) onFileChange(droppedFile)
  }

  if (file) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 p-3">
          <DocumentFileIcon mimeType={resolveMimeType(file) ?? file.type} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-body font-medium">{file.name}</p>
            <p className="text-supporting text-muted-foreground">{formatFileSize(file.size)}</p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            onClick={() => onFileChange(null)}
            disabled={disabled}
            aria-label={`Remove ${file.name}`}
          >
            <X aria-hidden="true" />
          </Button>
        </div>
        {errorMessage && (
          <p role="alert" className="text-supporting text-destructive">
            {errorMessage}
          </p>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={inputId}
        onDragOver={(event) => {
          event.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex cursor-pointer flex-col items-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors',
          'has-[input:focus-visible]:ring-2 has-[input:focus-visible]:ring-ring',
          isDragging ? 'border-primary bg-secondary' : 'border-border hover:bg-muted/50',
          errorMessage && 'border-destructive/50',
        )}
      >
        <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-secondary-foreground">
          <CloudUpload className="size-5" aria-hidden="true" />
        </span>
        <span className="text-body font-medium">
          <span className="text-primary underline underline-offset-4">Choose a file</span> or drag it here
        </span>
        <span className="text-supporting text-muted-foreground">
          {ALLOWED_FILE_TYPES_LABEL}, up to {formatFileSize(MAX_FILE_SIZE_BYTES)}
        </span>
        <input
          id={inputId}
          type="file"
          accept={FILE_INPUT_ACCEPT}
          className="sr-only"
          disabled={disabled}
          aria-invalid={Boolean(errorMessage)}
          aria-describedby={errorMessage ? errorId : undefined}
          onChange={(event) => {
            onFileChange(event.target.files?.item(0) ?? null)
            event.target.value = ''
          }}
        />
      </label>
      {errorMessage && (
        <p id={errorId} role="alert" className="text-supporting text-destructive">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
