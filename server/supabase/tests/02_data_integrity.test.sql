-- =============================================================================
-- Data integrity: status history, the application write functions, document
-- links and what is kept or removed when an application is deleted.
-- Runs as the signed-in owner. Rolled back at the end.
-- =============================================================================

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'owner@example.test');

-- Holds the id of the application created below, for later statements.
create temporary table test_ids (application_id uuid) on commit drop;
grant all on test_ids to authenticated;

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}',
  true
);

-- -----------------------------------------------------------------------------
-- Sign-up creates a profile and the default categories
-- -----------------------------------------------------------------------------

select is((select count(*)::int from public.profiles), 1, 'a profile is created on sign-up');
select is((select count(*)::int from public.categories), 8, 'eight default categories are created on sign-up');

-- -----------------------------------------------------------------------------
-- Creating an application writes both records and the first history entry
-- -----------------------------------------------------------------------------

insert into test_ids
select public.create_opportunity_application(
  '{"title": "Data Fellowship", "organization": "Acme"}'::jsonb,
  '{}'::jsonb
);

select is((select count(*)::int from public.opportunities), 1, 'the opportunity is created');
select is((select status::text from public.applications), 'draft', 'a new application defaults to draft');
select results_eq(
  $$ select previous_status::text, new_status::text from public.application_status_history $$,
  $$ values (null::text, 'draft'::text) $$,
  'the initial status is recorded in the history'
);

-- -----------------------------------------------------------------------------
-- Changing status records history, notes and submission dates
-- -----------------------------------------------------------------------------

select lives_ok(
  $$ select public.change_application_status((select application_id from test_ids), 'submitted', '  Sent online  ') $$,
  'status can be changed with a note'
);
select is((select count(*)::int from public.application_status_history), 2, 'the change is recorded');
select results_eq(
  $$ select previous_status::text, new_status::text, notes
     from public.application_status_history where previous_status is not null $$,
  $$ values ('draft'::text, 'submitted'::text, 'Sent online'::text) $$,
  'the history entry has both statuses and the trimmed note'
);
select isnt((select submitted_at from public.applications), null, 'submitting records a submission date');

select lives_ok(
  $$ select public.change_application_status((select application_id from test_ids), 'submitted') $$,
  'choosing the same status is allowed'
);
select is((select count(*)::int from public.application_status_history), 2, 'an unchanged status adds no history');

select lives_ok(
  $$ select public.change_application_status((select application_id from test_ids), 'draft') $$,
  'an application can move back to draft'
);
select is((select submitted_at from public.applications), null, 'moving back to draft clears the submission date');

-- -----------------------------------------------------------------------------
-- History is append-only except for notes
-- -----------------------------------------------------------------------------

select lives_ok(
  $$ update public.application_status_history set notes = 'Edited note' $$,
  'history notes can be edited'
);
select throws_ok(
  $$ update public.application_status_history set new_status = 'successful' $$,
  '42501',
  null,
  'recorded statuses cannot be rewritten'
);
select throws_ok(
  $$ delete from public.application_status_history $$,
  '42501',
  null,
  'history cannot be deleted directly'
);

-- -----------------------------------------------------------------------------
-- Validation in the database
-- -----------------------------------------------------------------------------

select throws_ok(
  $$ update public.applications set submitted_at = now() $$,
  '23514',
  null,
  'a draft cannot have a submission date'
);
select throws_ok(
  $$ update public.opportunities set application_url = 'javascript:alert(1)' $$,
  '23514',
  null,
  'opportunity links must be web addresses'
);
select throws_ok(
  $$ insert into public.application_events (event_type, title, starts_at, ends_at)
     values ('interview', 'Backwards', now(), now() - interval '1 hour') $$,
  '23514',
  null,
  'an event cannot end before it starts'
);
select throws_ok(
  $$ insert into public.application_events (event_type, title, starts_at, ends_at, is_all_day)
     values ('other', 'All day with end', now(), now() + interval '1 hour', true) $$,
  '23514',
  null,
  'an all-day event cannot have an end time'
);
select throws_ok(
  $$ insert into public.documents (name, file_name, mime_type, size_bytes, storage_path)
     values ('Misplaced', 'x.pdf', 'application/pdf', 10, 'someone-else/x.pdf') $$,
  '23514',
  null,
  'documents must be stored in the owner''s folder'
);

-- -----------------------------------------------------------------------------
-- Documents linked to an application cannot be deleted until unlinked
-- -----------------------------------------------------------------------------

insert into public.documents (id, name, file_name, mime_type, size_bytes, storage_path)
values (
  'b0000000-0000-0000-0000-000000000001',
  'CV',
  'cv.pdf',
  'application/pdf',
  10,
  '11111111-1111-1111-1111-111111111111/cv.pdf'
);
insert into public.application_documents (application_id, document_id)
select application_id, 'b0000000-0000-0000-0000-000000000001' from test_ids;

select throws_ok(
  $$ delete from public.documents where id = 'b0000000-0000-0000-0000-000000000001' $$,
  '23503',
  null,
  'a document used by an application cannot be deleted'
);

-- -----------------------------------------------------------------------------
-- Deleting an application removes its records but keeps documents and notes
-- -----------------------------------------------------------------------------

insert into public.application_events (application_id, event_type, title, starts_at)
select application_id, 'interview', 'Interview', now() from test_ids;
insert into public.communications (application_id, direction, subject, communicated_at, attachment_document_id)
select application_id, 'received', 'Confirmation', now(), 'b0000000-0000-0000-0000-000000000001' from test_ids;
insert into public.notes (application_id, title, content)
select application_id, 'Lesson', 'Apply earlier' from test_ids;

delete from public.opportunities;

select is_empty('select id from public.applications', 'the application is deleted with its opportunity');
select is_empty('select id from public.application_status_history', 'its status history is deleted');
select is_empty('select id from public.application_events', 'its events are deleted');
select is_empty('select id from public.communications', 'its communications are deleted');
select is_empty('select document_id from public.application_documents', 'its document links are removed');
select is((select count(*)::int from public.documents), 1, 'the document stays in the library');
select results_eq(
  $$ select title, application_id from public.notes $$,
  $$ values ('Lesson'::text, null::uuid) $$,
  'the note is kept and unlinked'
);

select * from finish();
rollback;
