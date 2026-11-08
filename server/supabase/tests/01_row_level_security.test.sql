-- =============================================================================
-- Row Level Security: a signed-in user can reach only their own rows, and a
-- signed-out visitor can reach nothing.
--
-- The app allows a single owner, so a second account can never exist in
-- production. To prove isolation anyway, this test briefly disables the
-- single-owner trigger to create an "intruder" account. Everything runs in one
-- transaction that is rolled back at the end.
-- =============================================================================

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

-- -----------------------------------------------------------------------------
-- Fixtures (written as the database superuser, which bypasses RLS)
-- -----------------------------------------------------------------------------

alter table auth.users disable trigger enforce_single_owner;
insert into auth.users (id, email) values
  ('11111111-1111-1111-1111-111111111111', 'owner@example.test'),
  ('22222222-2222-2222-2222-222222222222', 'intruder@example.test');
alter table auth.users enable trigger enforce_single_owner;

insert into public.opportunities (id, user_id, title, organization)
values ('a0000000-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'Owner fellowship', 'Acme');

insert into public.applications (id, user_id, opportunity_id, status)
values (
  'a0000000-0000-0000-0000-000000000002',
  '11111111-1111-1111-1111-111111111111',
  'a0000000-0000-0000-0000-000000000001',
  'draft'
);

insert into public.documents (id, user_id, name, file_name, mime_type, size_bytes, storage_path)
values (
  'a0000000-0000-0000-0000-000000000003',
  '11111111-1111-1111-1111-111111111111',
  'Owner CV',
  'cv.pdf',
  'application/pdf',
  1024,
  '11111111-1111-1111-1111-111111111111/cv.pdf'
);

insert into public.application_documents (application_id, document_id, user_id)
values (
  'a0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
  '11111111-1111-1111-1111-111111111111'
);

insert into public.application_events (user_id, application_id, event_type, title, starts_at)
values (
  '11111111-1111-1111-1111-111111111111',
  'a0000000-0000-0000-0000-000000000002',
  'interview',
  'Owner interview',
  now() + interval '7 days'
);

insert into public.communications (user_id, application_id, direction, subject, communicated_at)
values (
  '11111111-1111-1111-1111-111111111111',
  'a0000000-0000-0000-0000-000000000002',
  'received',
  'Owner confirmation',
  now()
);

insert into public.notes (user_id, application_id, title, content)
values (
  '11111111-1111-1111-1111-111111111111',
  'a0000000-0000-0000-0000-000000000002',
  'Owner reflection',
  'Private thoughts'
);

insert into storage.objects (bucket_id, name)
values ('documents', '11111111-1111-1111-1111-111111111111/cv.pdf');

-- -----------------------------------------------------------------------------
-- Signed in as the intruder
-- -----------------------------------------------------------------------------

set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}',
  true
);

-- Reading: only the intruder's own profile and default categories are visible.
select is((select count(*)::int from public.profiles), 1, 'intruder sees only their own profile');
select is(
  (select count(*)::int from public.categories where user_id <> '22222222-2222-2222-2222-222222222222'),
  0,
  'intruder sees none of the owner''s categories'
);
select is_empty('select id from public.opportunities', 'intruder cannot read opportunities');
select is_empty('select id from public.applications', 'intruder cannot read applications');
select is_empty('select id from public.application_status_history', 'intruder cannot read status history');
select is_empty('select id from public.documents', 'intruder cannot read documents');
select is_empty('select document_id from public.application_documents', 'intruder cannot read document links');
select is_empty('select id from public.application_events', 'intruder cannot read events');
select is_empty('select id from public.communications', 'intruder cannot read communications');
select is_empty('select id from public.notes', 'intruder cannot read notes');
select is_empty(
  $$ select id from storage.objects where bucket_id = 'documents' $$,
  'intruder cannot see the owner''s stored files'
);

-- Changing: updates and deletes silently match nothing.
select is_empty(
  $$ update public.opportunities set title = 'Hacked' where id = 'a0000000-0000-0000-0000-000000000001' returning id $$,
  'intruder cannot update the owner''s opportunity'
);
select is_empty(
  $$ update public.applications set status = 'withdrawn' where id = 'a0000000-0000-0000-0000-000000000002' returning id $$,
  'intruder cannot update the owner''s application'
);
select is_empty(
  $$ delete from public.documents where id = 'a0000000-0000-0000-0000-000000000003' returning id $$,
  'intruder cannot delete the owner''s document'
);
select is_empty(
  $$ delete from public.notes returning id $$,
  'intruder cannot delete the owner''s notes'
);

-- Writing rows that claim to belong to the owner is refused.
select throws_ok(
  $$ insert into public.notes (user_id, title, content)
     values ('11111111-1111-1111-1111-111111111111', 'Forged', 'Forged') $$,
  '42501',
  null,
  'intruder cannot create a row owned by someone else'
);

-- Linking the intruder's own rows to the owner's application is refused by the ownership foreign keys.
select throws_ok(
  $$ insert into public.application_events (application_id, event_type, title, starts_at)
     values ('a0000000-0000-0000-0000-000000000002', 'interview', 'Sneaky', now()) $$,
  '23503',
  null,
  'intruder cannot attach an event to the owner''s application'
);
select throws_ok(
  $$ insert into public.notes (application_id, title, content)
     values ('a0000000-0000-0000-0000-000000000002', 'Sneaky', 'Sneaky') $$,
  '23503',
  null,
  'intruder cannot attach a note to the owner''s application'
);

-- The write functions cannot reach the owner's application.
select throws_ok(
  $$ select public.change_application_status('a0000000-0000-0000-0000-000000000002', 'withdrawn') $$,
  'P0002',
  null,
  'intruder cannot change the owner''s application status'
);

-- Status history is written only by the database.
select throws_ok(
  $$ insert into public.application_status_history (user_id, application_id, new_status)
     values ('22222222-2222-2222-2222-222222222222', 'a0000000-0000-0000-0000-000000000002', 'successful') $$,
  '42501',
  null,
  'status history cannot be inserted directly'
);

-- Storage: uploads into another user's folder are refused.
select throws_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('documents', '11111111-1111-1111-1111-111111111111/planted.pdf') $$,
  '42501',
  null,
  'intruder cannot upload into the owner''s storage folder'
);

-- -----------------------------------------------------------------------------
-- Signed in as the owner: their data is all there (RLS is not simply blocking everything)
-- -----------------------------------------------------------------------------

reset role;
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}',
  true
);

select is((select title from public.opportunities), 'Owner fellowship', 'owner''s opportunity is unchanged');
select is((select status::text from public.applications), 'draft', 'owner''s application is unchanged');
select is((select count(*)::int from public.documents), 1, 'owner''s document still exists');
select is((select count(*)::int from public.notes), 1, 'owner''s note still exists');
select is(
  (select count(*)::int from storage.objects where bucket_id = 'documents'),
  1,
  'owner can see their stored file'
);
select lives_ok(
  $$ insert into storage.objects (bucket_id, name)
     values ('documents', '11111111-1111-1111-1111-111111111111/new.pdf') $$,
  'owner can upload into their own folder'
);

-- -----------------------------------------------------------------------------
-- Signed out
-- -----------------------------------------------------------------------------

reset role;
set local role anon;
select set_config('request.jwt.claims', '{"role": "anon"}', true);

select throws_ok('select id from public.opportunities', '42501', null, 'signed-out visitors cannot read opportunities');
select throws_ok('select id from public.documents', '42501', null, 'signed-out visitors cannot read documents');
select throws_ok('select id from public.notes', '42501', null, 'signed-out visitors cannot read notes');
select is_empty(
  $$ select id from storage.objects where bucket_id = 'documents' $$,
  'signed-out visitors cannot see stored files'
);
select is(public.owner_account_exists(), true, 'signed-out visitors learn only that an owner exists');

select * from finish();
rollback;
