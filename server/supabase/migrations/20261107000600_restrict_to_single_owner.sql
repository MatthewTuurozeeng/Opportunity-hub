-- =============================================================================
-- OpportunityHub has exactly one owner.
--
-- Sign-up stays enabled so the owner can create their account from the app,
-- but the database rejects every account after the first. This is enforced
-- here rather than in the frontend, so it cannot be bypassed by calling the
-- Supabase Auth API directly.
-- =============================================================================

create function public.prevent_additional_users()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  -- Serialize concurrent sign-ups so two cannot both pass the check.
  perform pg_advisory_xact_lock(hashtext('opportunityhub_single_owner'));

  if exists (select 1 from auth.users) then
    raise exception 'OpportunityHub supports a single owner account. Sign-up is closed.'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger enforce_single_owner
  before insert on auth.users
  for each row execute function public.prevent_additional_users();

-- Lets the sign-in page decide whether to offer "Create account".
-- Reveals only whether an owner exists, nothing else.
create function public.owner_account_exists()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from auth.users);
$$;

revoke all on function public.owner_account_exists() from public;
grant execute on function public.owner_account_exists() to anon, authenticated;
