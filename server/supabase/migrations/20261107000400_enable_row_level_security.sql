-- =============================================================================
-- Row Level Security: a signed-in user can access only their own rows.
-- Anonymous (signed-out) requests can access nothing.
-- `(select auth.uid())` is evaluated once per query rather than once per row.
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.opportunities enable row level security;
alter table public.applications enable row level security;
alter table public.application_status_history enable row level security;
alter table public.documents enable row level security;
alter table public.application_documents enable row level security;
alter table public.application_events enable row level security;
alter table public.communications enable row level security;

-- Signed-out visitors get no table access at all.
revoke all on all tables in schema public from anon;

-- -----------------------------------------------------------------------------
-- profiles: created by trigger, never deleted by the user directly
-- -----------------------------------------------------------------------------

revoke insert, delete on public.profiles from authenticated;

create policy "Users can view their own profile"
  on public.profiles for select to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- -----------------------------------------------------------------------------
-- Owner-only access for regular user tables
-- -----------------------------------------------------------------------------

create policy "Users can manage their own categories"
  on public.categories for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their own opportunities"
  on public.opportunities for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their own applications"
  on public.applications for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their own documents"
  on public.documents for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their own application documents"
  on public.application_documents for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their own application events"
  on public.application_events for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can manage their own communications"
  on public.communications for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- application_status_history: read-only except for the notes column
-- -----------------------------------------------------------------------------

revoke insert, update, delete on public.application_status_history from authenticated;
grant update (notes) on public.application_status_history to authenticated;

create policy "Users can view their own status history"
  on public.application_status_history for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add notes to their own status history"
  on public.application_status_history for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
