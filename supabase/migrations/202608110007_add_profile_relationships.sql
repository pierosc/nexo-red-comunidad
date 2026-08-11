-- Relaciones personales adicionales entre miembros de Nexo.
create table if not exists public.profile_relationships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  related_profile_id uuid not null references public.profiles(id) on delete cascade,
  relationship_type text not null,
  custom_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profile_relationships_distinct_people check (profile_id <> related_profile_id),
  constraint profile_relationships_type check (
    relationship_type in (
      'spouse',
      'partner',
      'parent',
      'child',
      'sibling',
      'friend',
      'classmate',
      'colleague',
      'mentor',
      'mentee',
      'relative',
      'other'
    )
  ),
  constraint profile_relationships_custom_label check (
    (relationship_type = 'other' and custom_label is not null and char_length(trim(custom_label)) between 2 and 60)
    or (relationship_type <> 'other' and custom_label is null)
  ),
  constraint profile_relationships_unique unique (profile_id, related_profile_id, relationship_type)
);

create index if not exists profile_relationships_profile_idx
  on public.profile_relationships (profile_id);
create index if not exists profile_relationships_related_profile_idx
  on public.profile_relationships (related_profile_id);

drop trigger if exists profile_relationships_set_updated_at on public.profile_relationships;
create trigger profile_relationships_set_updated_at
before update on public.profile_relationships
for each row execute function public.set_updated_at();

alter table public.profile_relationships enable row level security;

drop policy if exists "Authenticated members can view relationships" on public.profile_relationships;
create policy "Authenticated members can view relationships"
on public.profile_relationships for select
to authenticated
using (true);

drop policy if exists "Members can create their own relationships" on public.profile_relationships;
create policy "Members can create their own relationships"
on public.profile_relationships for insert
to authenticated
with check (
  profile_id = (
    select id
    from public.profiles
    where clerk_user_id = (select auth.jwt()->>'sub')
  )
);

drop policy if exists "Members can update their own relationships" on public.profile_relationships;
create policy "Members can update their own relationships"
on public.profile_relationships for update
to authenticated
using (
  profile_id = (
    select id
    from public.profiles
    where clerk_user_id = (select auth.jwt()->>'sub')
  )
)
with check (
  profile_id = (
    select id
    from public.profiles
    where clerk_user_id = (select auth.jwt()->>'sub')
  )
);

drop policy if exists "Members can delete their own relationships" on public.profile_relationships;
create policy "Members can delete their own relationships"
on public.profile_relationships for delete
to authenticated
using (
  profile_id = (
    select id
    from public.profiles
    where clerk_user_id = (select auth.jwt()->>'sub')
  )
);

grant select, insert, update, delete on public.profile_relationships to authenticated;
