-- =============================================================================
-- Record every application status change automatically.
--
-- History rows are written by this trigger only. Users cannot insert, change or
-- delete history directly (see the RLS migration); they may only edit the notes.
-- =============================================================================

create function public.record_application_status_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.application_status_history (user_id, application_id, previous_status, new_status)
    values (new.user_id, new.id, null, new.status);
  elsif new.status is distinct from old.status then
    insert into public.application_status_history (user_id, application_id, previous_status, new_status)
    values (new.user_id, new.id, old.status, new.status);
  end if;

  return new;
end;
$$;

create trigger record_application_status_on_insert
  after insert on public.applications
  for each row execute function public.record_application_status_change();

create trigger record_application_status_on_update
  after update of status on public.applications
  for each row execute function public.record_application_status_change();
