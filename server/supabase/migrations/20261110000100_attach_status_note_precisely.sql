-- =============================================================================
-- Attach a status-change note to exactly the history row that change created.
--
-- The original function picked the newest row by changed_at. changed_at uses
-- now(), which is the same for every statement in a transaction, so two status
-- changes in one transaction could attach the note to the wrong row. Matching
-- the previous and new status (and an empty note) removes that ambiguity.
-- Behaviour is otherwise unchanged.
-- =============================================================================

create or replace function public.change_application_status(
  p_application_id uuid,
  p_status public.application_status,
  p_note text default null
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_current_status public.application_status;
begin
  select status into v_current_status
  from public.applications
  where id = p_application_id;

  if not found then
    raise exception 'Application not found.' using errcode = 'P0002';
  end if;

  if v_current_status = p_status then
    return;
  end if;

  update public.applications
  set status = p_status,
      submitted_at = case
        when p_status = 'draft' then null
        when p_status = 'submitted' then coalesce(submitted_at, now())
        else submitted_at
      end
  where id = p_application_id;

  -- The status trigger has just written the history row for this exact change.
  if nullif(trim(p_note), '') is not null then
    update public.application_status_history
    set notes = trim(p_note)
    where id = (
      select id
      from public.application_status_history
      where application_id = p_application_id
        and previous_status = v_current_status
        and new_status = p_status
        and notes is null
      order by changed_at desc
      limit 1
    );
  end if;
end;
$$;
