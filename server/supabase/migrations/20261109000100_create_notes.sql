-- =============================================================================
-- Notes and reflections (README section 2.8).
--
-- A note may stand alone or belong to one application. Deleting the application
-- keeps the note and only clears the link, so lessons learned are not lost.
-- =============================================================================

create type public.note_category as enum (
  'interview_preparation',
  'interview_questions',
  'interview_reflection',
  'feedback_received',
  'strengths',
  'areas_for_improvement',
  'lessons_learned',
  'follow_up',
  'general'
);

create table public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  application_id uuid,
  category public.note_category not null default 'general',
  title text not null check (char_length(trim(title)) between 1 and 200),
  content text not null check (char_length(trim(content)) between 1 and 20000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (application_id, user_id)
    references public.applications (id, user_id)
    on delete set null (application_id)
);

comment on table public.notes is 'Personal notes and reflections, optionally linked to an application.';

create trigger set_notes_updated_at before update on public.notes
  for each row execute function public.set_updated_at();

create index notes_user_id_updated_at_idx on public.notes (user_id, updated_at desc);
create index notes_application_id_idx on public.notes (application_id);

-- -----------------------------------------------------------------------------
-- Row Level Security: owner-only, like every other user table.
-- -----------------------------------------------------------------------------

alter table public.notes enable row level security;

revoke all on public.notes from anon;

create policy "Users can manage their own notes"
  on public.notes for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
