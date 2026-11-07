-- =============================================================================
-- Create a profile and default opportunity categories for each new auth user.
-- =============================================================================

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');

  insert into public.categories (user_id, name)
  select new.id, category_name
  from unnest(array[
    'Scholarships',
    'Internships',
    'Employment',
    'Fellowships',
    'Grants and Funding',
    'Conferences and Programmes',
    'Competitions',
    'Other Opportunities'
  ]) as category_name;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
