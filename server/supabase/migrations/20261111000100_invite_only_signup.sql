-- =============================================================================
-- Invite-only sign-up.
--
-- Replaces the single-owner rule:
-- - The first account is the owner.
-- - After that, only email addresses the owner has invited can sign up.
-- - Every account's data stays private to that account (existing RLS).
--
-- Enforced in the database, so it cannot be bypassed by calling the Supabase
-- Auth API directly.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Roles: the owner manages invitations; everyone else is a member.
-- -----------------------------------------------------------------------------

create type public.profile_role as enum ('owner', 'member');

alter table public.profiles
  add column role public.profile_role not null default 'member';

-- The existing account (the earliest one) is the owner.
update public.profiles
set role = 'owner'
where id = (select id from auth.users order by created_at limit 1);

-- Users may edit their name, never their role.
revoke update on public.profiles from authenticated;
grant update (full_name) on public.profiles to authenticated;

-- Whether the signed-in user is the owner. SECURITY DEFINER so policies can call
-- it without recursing through the profiles policy.
create function public.is_owner()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'owner'
  );
$$;

revoke all on function public.is_owner() from public;
grant execute on function public.is_owner() to authenticated;

-- -----------------------------------------------------------------------------
-- Invitations
-- -----------------------------------------------------------------------------

create table public.signup_invitations (
  id uuid primary key default gen_random_uuid(),
  -- Stored lower-case so matching ignores capitalisation.
  email text not null unique
    check (email = lower(trim(email)) and email ~ '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]+$'),
  note text check (char_length(note) <= 200),
  invited_by uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Set automatically when the invited address signs up.
  accepted_at timestamptz
);

comment on table public.signup_invitations is 'Email addresses the owner has invited to create an account.';

create index signup_invitations_invited_by_idx on public.signup_invitations (invited_by);

alter table public.signup_invitations enable row level security;
revoke all on public.signup_invitations from anon;
-- accepted_at is maintained by the database only.
revoke update on public.signup_invitations from authenticated;
grant update (note) on public.signup_invitations to authenticated;

create policy "The owner can manage invitations"
  on public.signup_invitations for all to authenticated
  using ((select public.is_owner()))
  with check ((select public.is_owner()) and invited_by = (select auth.uid()));

-- -----------------------------------------------------------------------------
-- Sign-up rule. The existing trigger on auth.users (enforce_single_owner) calls
-- this function, so replacing the function changes the rule without touching
-- the auth schema's triggers, which belong to Supabase's auth service.
-- -----------------------------------------------------------------------------

create or replace function public.prevent_additional_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Serialize concurrent sign-ups so two cannot both become the owner.
  perform pg_advisory_xact_lock(hashtext('opportunityhub_signup'));

  -- The very first account is always allowed: it becomes the owner.
  if not exists (select 1 from auth.users) then
    return new;
  end if;

  if exists (
    select 1 from public.signup_invitations
    where email = lower(trim(new.email))
  ) then
    return new;
  end if;

  raise exception 'Sign-up is by invitation only.'
    using errcode = 'P0001';
end;
$$;

comment on function public.prevent_additional_users() is
  'Allows the first account (the owner) and invited email addresses only. Fired by trigger enforce_single_owner.';

-- -----------------------------------------------------------------------------
-- New accounts: profile with its role, default categories, and mark the
-- invitation as accepted.
-- -----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    case when exists (select 1 from public.profiles) then 'member' else 'owner' end::public.profile_role
  );

  insert into public.categories (user_id, name)
  select new.id, category_name
  from unnest(array[
    'Scholarships',
    'Internships',
    'Employment',
    'Fellowships',
    'Grants and Funding',
    'Conferences and Programmes',
    'Competitions',
    'Other Opportunities'
  ]) as category_name;

  update public.signup_invitations
  set accepted_at = now()
  where email = lower(trim(new.email)) and accepted_at is null;

  return new;
end;
$$;
