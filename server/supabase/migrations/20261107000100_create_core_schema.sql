-- =============================================================================
-- OpportunityHub core schema
--
-- Ownership: every user-owned table has a `user_id` column. Child tables reference
-- their parent through a composite foreign key on (id, user_id), so a record can
-- only ever be linked to a parent owned by the same user. This is enforced by the
-- database itself, not only by Row Level Security or frontend code.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Enumerated types
-- -----------------------------------------------------------------------------

create type public.application_status as enum (
  'draft',
  'submitted',
  'under_review',
  'shortlisted',
  'interview',
  'assessment',
  'successful',
  'unsuccessful',
  'withdrawn',
  'no_response'
);

create type public.document_category as enum (
  'curriculum_vitae',
  'cover_letter',
  'academic_transcript',
  'recommendation_letter',
  'certificate',
  'personal_statement',
  'essay_writing_sample',
  'identification_document',
  'application_form',
  'other'
);

create type public.communication_type as enum (
  'application_confirmation',
  'interview_invitation',
  'follow_up',
  'assessment_notification',
  'acceptance_notification',
  'rejection_notification',
  'general_inquiry',
  'other'
);

create type public.communication_direction as enum ('received', 'sent');

create type public.application_event_type as enum (
  'application_deadline',
  'submission',
  'shortlisting_notification',
  'interview_invitation',
  'interview',
  'assessment',
  'follow_up_reminder',
  'acceptance_notification',
  'rejection_notification',
  'other'
);

-- -----------------------------------------------------------------------------
-- Shared trigger function: keep updated_at current
-- -----------------------------------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- profiles: one row per auth user
-- -----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text check (char_length(full_name) <= 120),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'User profile information. One row per authenticated user.';

-- -----------------------------------------------------------------------------
-- categories: user-manageable opportunity categories
-- -----------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 60),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, name),
  unique (id, user_id)
);

comment on table public.categories is 'Opportunity categories such as Scholarships or Internships.';

-- -----------------------------------------------------------------------------
-- opportunities: an opportunity can exist before any application is made
-- -----------------------------------------------------------------------------

create table public.opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  category_id uuid,
  title text not null check (char_length(trim(title)) between 1 and 200),
  organization text not null check (char_length(trim(organization)) between 1 and 200),
  location text check (char_length(location) <= 200),
  description text,
  application_url text check (application_url ~* '^https?://'),
  source text check (char_length(source) <= 200),
  deadline timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  -- Deleting a category keeps the opportunity and clears only its category.
  foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete set null (category_id)
);

comment on table public.opportunities is 'Recorded opportunities. created_at is the date the opportunity was added.';

-- -----------------------------------------------------------------------------
-- applications: one application per opportunity (initial version)
-- -----------------------------------------------------------------------------

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  opportunity_id uuid not null,
  status public.application_status not null default 'draft',
  submitted_at timestamptz,
  application_method text check (char_length(application_method) <= 120),
  reference_number text check (char_length(reference_number) <= 120),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (opportunity_id),
  unique (id, user_id),
  -- A draft has not been submitted, so it cannot have a submission date.
  constraint draft_has_no_submission_date check (status <> 'draft' or submitted_at is null),
  foreign key (opportunity_id, user_id)
    references public.opportunities (id, user_id)
    on delete cascade
);

comment on table public.applications is 'Application records and their current status.';

-- -----------------------------------------------------------------------------
-- application_status_history: written only by trigger (see status history migration)
-- -----------------------------------------------------------------------------

create table public.application_status_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  application_id uuid not null,
  previous_status public.application_status,
  new_status public.application_status not null,
  changed_at timestamptz not null default now(),
  notes text,
  foreign key (application_id, user_id)
    references public.applications (id, user_id)
    on delete cascade
);

comment on table public.application_status_history is
  'Every application status change. previous_status is null for the initial status.';

-- -----------------------------------------------------------------------------
-- documents: central library, independent of applications
-- -----------------------------------------------------------------------------

create table public.documents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- All versions of the same document share a version_group_id.
  version_group_id uuid not null default gen_random_uuid(),
  version integer not null default 1 check (version >= 1),
  name text not null check (char_length(trim(name)) between 1 and 200),
  category public.document_category not null default 'other',
  description text,
  file_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  storage_path text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (id, user_id),
  unique (user_id, version_group_id, version),
  -- Files must live in the owner's folder: <user_id>/<file>.
  constraint storage_path_in_owner_folder check (storage_path like user_id::text || '/%')
);

comment on table public.documents is
  'Document metadata. Files live in the private "documents" storage bucket. created_at is the upload date.';

-- -----------------------------------------------------------------------------
-- application_documents: many-to-many between applications and documents
-- -----------------------------------------------------------------------------

create table public.application_documents (
  application_id uuid not null,
  document_id uuid not null,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (application_id, document_id),
  foreign key (application_id, user_id)
    references public.applications (id, user_id)
    on delete cascade,
  -- A document that is linked to an application cannot be deleted directly;
  -- the link must be removed first, preserving what was submitted.
  -- (NO ACTION rather than RESTRICT so deleting a whole account still cascades.)
  foreign key (document_id, user_id)
    references public.documents (id, user_id)
    on delete no action
);

comment on table public.application_documents is 'Links documents to the applications they were used in.';

-- -----------------------------------------------------------------------------
-- application_events: deadlines, interviews, assessments, reminders
-- -----------------------------------------------------------------------------

create table public.application_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  -- Optional: an event may stand alone or belong to an application.
  application_id uuid,
  event_type public.application_event_type not null,
  title text not null check (char_length(trim(title)) between 1 and 200),
  description text,
  location text check (char_length(location) <= 200),
  starts_at timestamptz not null,
  ends_at timestamptz,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint ends_after_start check (ends_at is null or ends_at >= starts_at),
  foreign key (application_id, user_id)
    references public.applications (id, user_id)
    on delete cascade
);

comment on table public.application_events is 'Calendar events. An application may have many events.';

-- -----------------------------------------------------------------------------
-- communications: manually recorded messages for an application
-- -----------------------------------------------------------------------------

create table public.communications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  application_id uuid not null,
  communication_type public.communication_type not null default 'other',
  direction public.communication_direction not null,
  subject text not null check (char_length(trim(subject)) between 1 and 300),
  sender text check (char_length(sender) <= 200),
  recipient text check (char_length(recipient) <= 200),
  communicated_at timestamptz not null,
  summary text,
  content text,
  external_link text check (external_link ~* '^https?://'),
  attachment_document_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  foreign key (application_id, user_id)
    references public.applications (id, user_id)
    on delete cascade,
  foreign key (attachment_document_id, user_id)
    references public.documents (id, user_id)
    on delete set null (attachment_document_id)
);

comment on table public.communications is 'Sent and received communications related to an application.';

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------

create trigger set_profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger set_opportunities_updated_at before update on public.opportunities
  for each row execute function public.set_updated_at();
create trigger set_applications_updated_at before update on public.applications
  for each row execute function public.set_updated_at();
create trigger set_documents_updated_at before update on public.documents
  for each row execute function public.set_updated_at();
create trigger set_application_events_updated_at before update on public.application_events
  for each row execute function public.set_updated_at();
create trigger set_communications_updated_at before update on public.communications
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Indexes for frequent queries and foreign keys
-- -----------------------------------------------------------------------------

create index opportunities_user_id_deadline_idx on public.opportunities (user_id, deadline);
create index opportunities_category_id_idx on public.opportunities (category_id);
create index applications_user_id_status_idx on public.applications (user_id, status);
create index applications_user_id_updated_at_idx on public.applications (user_id, updated_at desc);
create index application_status_history_application_id_idx
  on public.application_status_history (application_id, changed_at desc);
create index documents_user_id_category_idx on public.documents (user_id, category);
create index application_documents_document_id_idx on public.application_documents (document_id);
create index application_events_user_id_starts_at_idx on public.application_events (user_id, starts_at);
create index application_events_application_id_idx on public.application_events (application_id);
create index communications_application_id_idx
  on public.communications (application_id, communicated_at desc);
create index communications_attachment_document_id_idx on public.communications (attachment_document_id);
