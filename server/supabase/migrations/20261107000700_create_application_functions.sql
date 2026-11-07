-- =============================================================================
-- Atomic write operations for opportunities and applications.
--
-- An opportunity and its application are saved together, so these functions
-- write both in one transaction: either both succeed or neither does.
--
-- They run as SECURITY INVOKER (the default), so Row Level Security, column
-- defaults (user_id = auth.uid()) and ownership foreign keys all still apply.
-- Input is JSON keyed by column name; unknown keys are ignored.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Create an opportunity and its application. Returns the new application id.
-- -----------------------------------------------------------------------------

create function public.create_opportunity_application(p_opportunity jsonb, p_application jsonb)
returns uuid
language plpgsql
set search_path = ''
as $$
declare
  v_opportunity_id uuid;
  v_application_id uuid;
begin
  insert into public.opportunities (
    title, organization, category_id, location, description, application_url, source, deadline
  )
  select title, organization, category_id, location, description, application_url, source, deadline
  from jsonb_populate_record(null::public.opportunities, p_opportunity)
  returning id into v_opportunity_id;

  insert into public.applications (
    opportunity_id, status, submitted_at, application_method, reference_number, notes
  )
  select v_opportunity_id, coalesce(status, 'draft'), submitted_at, application_method, reference_number, notes
  from jsonb_populate_record(null::public.applications, p_application)
  returning id into v_application_id;

  return v_application_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Update an application and its opportunity. Every editable column is replaced
-- with the value supplied (missing keys become null), matching a full form save.
-- -----------------------------------------------------------------------------

create function public.update_opportunity_application(
  p_application_id uuid,
  p_opportunity jsonb,
  p_application jsonb
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_opportunity_id uuid;
  v_opportunity public.opportunities;
  v_application public.applications;
begin
  select opportunity_id into v_opportunity_id
  from public.applications
  where id = p_application_id;

  if v_opportunity_id is null then
    raise exception 'Application not found.' using errcode = 'P0002';
  end if;

  v_opportunity := jsonb_populate_record(null::public.opportunities, p_opportunity);
  v_application := jsonb_populate_record(null::public.applications, p_application);

  update public.opportunities
  set title = v_opportunity.title,
      organization = v_opportunity.organization,
      category_id = v_opportunity.category_id,
      location = v_opportunity.location,
      description = v_opportunity.description,
      application_url = v_opportunity.application_url,
      source = v_opportunity.source,
      deadline = v_opportunity.deadline
  where id = v_opportunity_id;

  update public.applications
  set status = coalesce(v_application.status, status),
      submitted_at = v_application.submitted_at,
      application_method = v_application.application_method,
      reference_number = v_application.reference_number,
      notes = v_application.notes
  where id = p_application_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Change an application's status, optionally with a note on the history entry.
--
-- - Moving to 'submitted' without a submission date records today's date.
-- - Moving back to 'draft' clears the submission date (a draft is unsubmitted).
-- -----------------------------------------------------------------------------

create function public.change_application_status(
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

  -- The status trigger has just written the history row; attach the note to it.
  if nullif(trim(p_note), '') is not null then
    update public.application_status_history
    set notes = trim(p_note)
    where id = (
      select id
      from public.application_status_history
      where application_id = p_application_id
      order by changed_at desc
      limit 1
    );
  end if;
end;
$$;

-- Only signed-in users may call these functions.
revoke all on function public.create_opportunity_application(jsonb, jsonb) from public, anon;
revoke all on function public.update_opportunity_application(uuid, jsonb, jsonb) from public, anon;
revoke all on function public.change_application_status(uuid, public.application_status, text) from public, anon;
grant execute on function public.create_opportunity_application(jsonb, jsonb) to authenticated;
grant execute on function public.update_opportunity_application(uuid, jsonb, jsonb) to authenticated;
grant execute on function public.change_application_status(uuid, public.application_status, text) to authenticated;
