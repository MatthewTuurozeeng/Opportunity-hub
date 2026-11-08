-- =============================================================================
-- All-day application events.
--
-- Deadlines, reminders and notifications usually have a date but no time of
-- day. An all-day event stores local midnight of its date in starts_at and has
-- no end time; clients display it by date only.
-- =============================================================================

alter table public.application_events
  add column is_all_day boolean not null default false;

alter table public.application_events
  add constraint all_day_has_no_end check (not is_all_day or ends_at is null);

comment on column public.application_events.is_all_day is
  'True when the event has a date but no time of day. starts_at holds local midnight of that date.';
