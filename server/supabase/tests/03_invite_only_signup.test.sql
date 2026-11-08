-- =============================================================================
-- Sign-up is invite-only: the first account becomes the owner, and later
-- accounts need an invitation from the owner. Rolled back at the end.
-- =============================================================================

begin;
create extension if not exists pgtap with schema extensions;
select no_plan();

select is(public.owner_account_exists(), false, 'no owner exists before the first sign-up');

select lives_ok(
  $$ insert into auth.users (id, email) values ('11111111-1111-1111-1111-111111111111', 'owner@example.test') $$,
  'the first account can be created'
);
select is(
  (select role::text from public.profiles where id = '11111111-1111-1111-1111-111111111111'),
  'owner',
  'the first account becomes the owner'
);
select is(public.owner_account_exists(), true, 'the owner now exists');

select throws_ok(
  $$ insert into auth.users (id, email) values ('22222222-2222-2222-2222-222222222222', 'stranger@example.test') $$,
  'P0001',
  'Sign-up is by invitation only.',
  'an uninvited address is rejected by the database'
);

-- The owner invites a friend.
set local role authenticated;
select set_config(
  'request.jwt.claims',
  '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}',
  true
);

select lives_ok(
  $$ insert into public.signup_invitations (email, note) values ('friend@example.test', 'Classmate') $$,
  'the owner can invite an email address'
);
select throws_ok(
  $$ insert into public.signup_invitations (email) values ('Not An Email') $$,
  '23514',
  null,
  'invitations must be lower-case email addresses'
);
select throws_ok(
  $$ update public.signup_invitations set accepted_at = now() $$,
  '42501',
  null,
  'only the database marks invitations as accepted'
);

reset role;

select lives_ok(
  $$ insert into auth.users (id, email) values ('33333333-3333-3333-3333-333333333333', 'Friend@Example.test') $$,
  'an invited address can sign up, whatever its capitalisation'
);
select is(
  (select role::text from public.profiles where id = '33333333-3333-3333-3333-333333333333'),
  'member',
  'invited accounts are members'
);
select isnt(
  (select accepted_at from public.signup_invitations where email = 'friend@example.test'),
  null,
  'the invitation is marked as accepted'
);
select is(
  (select count(*)::int from public.categories where user_id = '33333333-3333-3333-3333-333333333333'),
  8,
  'invited accounts get their own default categories'
);

select * from finish();
rollback;
