import { FileImage, FileText, FileType2, type LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface FileIconStyle {
  icon: LucideIcon
  className: string
  label: string
}

function getFileIconStyle(mimeType: string): FileIconStyle {
  if (mimeType === 'application/pdf') return { icon: FileText, className: 'bg-red-50 text-red-600', label: 'PDF' }
  if (mimeType.startsWith('image/')) return { icon: FileImage, className: 'bg-emerald-50 text-emerald-700', label: 'Image' }
  if (mimeType.includes('word')) return { icon: FileType2, className: 'bg-blue-50 text-blue-600', label: 'Word' }
  return { icon: FileText, className: 'bg-slate-100 text-slate-600', label: 'Text' }
}

interface DocumentFileIconProps {
  mimeType: string
  className?: string
}

export function DocumentFileIcon({ mimeType, className }: DocumentFileIconProps) {
  const { icon: Icon, className: colorClassName, label } = getFileIconStyle(mimeType)

  return (
    <span
      className={cn('flex size-9 shrink-0 items-center justify-center rounded-md', colorClassName, className)}
      title={`${label} file`}
    >
      <Icon className="size-4.5" aria-hidden="true" />
      <span className="sr-only">{label} file</span>
    </span>
  )
}
