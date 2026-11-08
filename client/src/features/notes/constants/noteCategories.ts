import type { Enums } from '@/types/database.types'

export type NoteCategory = Enums<'note_category'>

/** Note categories (README section 2.8), in display order. Mirrors the database enum. */
export const NOTE_CATEGORIES = [
  'interview_preparation',
  'interview_questions',
  'interview_reflection',
  'feedback_received',
  'strengths',
  'areas_for_improvement',
  'lessons_learned',
  'follow_up',
  'general',
] as const satisfies readonly NoteCategory[]

export const NOTE_CATEGORY_LABELS: Record<NoteCategory, string> = {
  interview_preparation: 'Interview preparation',
  interview_questions: 'Interview questions',
  interview_reflection: 'Interview reflection',
  feedback_received: 'Feedback received',
  strengths: 'Strengths demonstrated',
  areas_for_improvement: 'Areas for improvement',
  lessons_learned: 'Lessons learned',
  follow_up: 'Follow-up considerations',
  general: 'General note',
}
