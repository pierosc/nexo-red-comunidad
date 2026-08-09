-- Nexo: perfiles y árbol de enrolamiento
create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  clerk_user_id text not null unique,
  full_name text not null check (char_length(full_name) between 2 and 120),
  photo_url text,
  bio text check (bio is null or char_length(bio) <= 320),
  cohort text not null check (char_length(cohort) between 2 and 80),
  birth_date date,
  city text,
  country text,
  profession text,
  linkedin_url text,
  instagram_url text,
  hobbies text check (hobbies is null or char_length(hobbies) <= 500),
  address text check (address is null or char_length(address) <= 240),
  enrolled_by_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_cannot_enroll_itself check (enrolled_by_id is null or enrolled_by_id <> id)
);

create index if not exists profiles_cohort_idx on public.profiles (cohort);
create index if not exists profiles_enrolled_by_idx on public.profiles (enrolled_by_id);
create index if not exists profiles_full_name_idx on public.profiles (full_name);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "Authenticated members can view profiles" on public.profiles;
create policy "Authenticated members can view profiles"
on public.profiles for select
to authenticated
using (true);

drop policy if exists "Members can create their own profile" on public.profiles;
create policy "Members can create their own profile"
on public.profiles for insert
to authenticated
with check ((select auth.jwt()->>'sub') = clerk_user_id);

drop policy if exists "Members can update their own profile" on public.profiles;
create policy "Members can update their own profile"
on public.profiles for update
to authenticated
using ((select auth.jwt()->>'sub') = clerk_user_id)
with check ((select auth.jwt()->>'sub') = clerk_user_id);

drop policy if exists "Members can delete their own profile" on public.profiles;
create policy "Members can delete their own profile"
on public.profiles for delete
to authenticated
using ((select auth.jwt()->>'sub') = clerk_user_id);

grant usage on schema public to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
