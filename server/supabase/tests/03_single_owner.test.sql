-- =============================================================================
-- OpportunityHub accepts exactly one account. Rolled back at the end.
-- =============================================================================

begin;
create extension if not exists pgtap with schema extensions;
select plan(4);

select is(public.owner_account_exists(), false, 'no owner exists before sign-up');

select lives_ok(
  $$ insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'owner@example.test') $$,
  'the first account can be created'
);

select is(public.owner_account_exists(), true, 'the owner now exists');

select throws_ok(
  $$ insert into auth.users (id, email) values ('22222222-2222-2222-2222-222222222222', 'second@example.test') $$,
  'P0001',
  'OpportunityHub supports a single owner account. Sign-up is closed.',
  'every later sign-up is rejected by the database'
);

select * from finish();
rollback;
