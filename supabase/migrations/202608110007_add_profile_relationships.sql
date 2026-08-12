-- Hobbies estructurados para permitir filtros y agrupaciones consistentes.
alter table public.profiles
  add column if not exists hobbies_list text[] not null default '{}'::text[];

-- Conserva los hobbies que ya se habían escrito como texto libre.
with legacy_hobbies as (
  select profile.id,
    left(btrim(parsed.item), 40) as hobby,
    parsed.position
  from public.profiles profile
  cross join lateral unnest(
    regexp_split_to_array(coalesce(profile.hobbies, ''), E'[,;\n]+')
  ) with ordinality as parsed(item, position)
  where cardinality(profile.hobbies_list) = 0
    and btrim(parsed.item) <> ''
), unique_hobbies as (
  select distinct on (id, lower(hobby)) id, hobby, position
  from legacy_hobbies
  order by id, lower(hobby), position
), hobby_backfill as (
  select id, (array_agg(hobby order by position))[1:12] as values
  from unique_hobbies
  group by id
)
update public.profiles profile
set hobbies_list = hobby_backfill.values
from hobby_backfill
where profile.id = hobby_backfill.id;

update public.profiles
set hobbies_list = (coalesce(hobbies_list, '{}'::text[]))[1:12]
where hobbies_list is null or cardinality(hobbies_list) > 12;

alter table public.profiles
  alter column hobbies_list set default '{}'::text[],
  alter column hobbies_list set not null;

alter table public.profiles
  drop constraint if exists profiles_hobbies_list_limit;
alter table public.profiles
  add constraint profiles_hobbies_list_limit
  check (cardinality(hobbies_list) <= 12);

-- Una relación personal por cada pareja de personas.
create table if not exists public.profile_relationships (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  related_profile_id uuid not null references public.profiles(id) on delete cascade,
  relationship_type text not null,
  custom_label text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profile_relationships
  drop constraint if exists profile_relationships_distinct_people;
alter table public.profile_relationships
  add constraint profile_relationships_distinct_people
  check (profile_id <> related_profile_id);

alter table public.profile_relationships
  drop constraint if exists profile_relationships_type;
alter table public.profile_relationships
  add constraint profile_relationships_type
  check (
    relationship_type in (
      'spouse',
      'partner',
      'parent',
      'child',
      'sibling',
      'grandparent',
      'grandchild',
      'uncle_aunt',
      'nephew_niece',
      'cousin',
      'relative',
      'friend',
      'classmate',
      'colleague',
      'mentor',
      'mentee',
      'neighbor',
      'other'
    )
  );

alter table public.profile_relationships
  drop constraint if exists profile_relationships_custom_label;
alter table public.profile_relationships
  add constraint profile_relationships_custom_label
  check (
    (relationship_type = 'other' and custom_label is not null and char_length(btrim(custom_label)) between 2 and 60)
    or (relationship_type <> 'other' and custom_label is null)
  );

-- La versión anterior permitía más de un tipo de relación entre la misma pareja.
alter table public.profile_relationships
  drop constraint if exists profile_relationships_unique;

with duplicate_relationships as (
  select id,
    row_number() over (
      partition by least(profile_id, related_profile_id), greatest(profile_id, related_profile_id)
      order by updated_at desc, created_at desc, id desc
    ) as duplicate_number
  from public.profile_relationships
)
delete from public.profile_relationships
where id in (
  select id from duplicate_relationships where duplicate_number > 1
);

create unique index if not exists profile_relationships_one_pair_idx
  on public.profile_relationships (
    least(profile_id, related_profile_id),
    greatest(profile_id, related_profile_id)
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
drop policy if exists "Members can update their own relationships" on public.profile_relationships;
drop policy if exists "Members can delete their own relationships" on public.profile_relationships;

revoke all on public.profile_relationships from anon, authenticated;
grant select on public.profile_relationships to authenticated;

-- La función centraliza la escritura y reemplaza cualquier vínculo previo entre la pareja.
create or replace function public.set_profile_relationship(
  p_related_profile_id uuid,
  p_relationship_type text,
  p_custom_label text default null
)
returns public.profile_relationships
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid;
  v_custom_label text;
  v_relationship public.profile_relationships;
begin
  select id
  into v_profile_id
  from public.profiles
  where clerk_user_id = (select auth.jwt()->>'sub');

  if v_profile_id is null then
    raise exception 'No existe un perfil para la cuenta activa.';
  end if;

  if p_related_profile_id is null or p_related_profile_id = v_profile_id then
    raise exception 'La relación seleccionada no es válida.';
  end if;

  if not exists (select 1 from public.profiles where id = p_related_profile_id) then
    raise exception 'La persona seleccionada no existe.';
  end if;

  if p_relationship_type not in (
    'spouse', 'partner', 'parent', 'child', 'sibling', 'grandparent', 'grandchild',
    'uncle_aunt', 'nephew_niece', 'cousin', 'relative', 'friend', 'classmate',
    'colleague', 'mentor', 'mentee', 'neighbor', 'other'
  ) then
    raise exception 'El tipo de relación no es válido.';
  end if;

  v_custom_label := nullif(btrim(p_custom_label), '');
  if p_relationship_type = 'other' then
    if v_custom_label is null or char_length(v_custom_label) not between 2 and 60 then
      raise exception 'La relación personalizada debe tener entre 2 y 60 caracteres.';
    end if;
  else
    v_custom_label := null;
  end if;

  update public.profile_relationships
  set profile_id = v_profile_id,
      related_profile_id = p_related_profile_id,
      relationship_type = p_relationship_type,
      custom_label = v_custom_label,
      updated_at = now()
  where least(profile_id, related_profile_id) = least(v_profile_id, p_related_profile_id)
    and greatest(profile_id, related_profile_id) = greatest(v_profile_id, p_related_profile_id)
  returning * into v_relationship;

  if v_relationship.id is null then
    insert into public.profile_relationships (
      profile_id,
      related_profile_id,
      relationship_type,
      custom_label
    ) values (
      v_profile_id,
      p_related_profile_id,
      p_relationship_type,
      v_custom_label
    )
    returning * into v_relationship;
  end if;

  return v_relationship;
end;
$$;

revoke all on function public.set_profile_relationship(uuid, text, text) from public;
grant execute on function public.set_profile_relationship(uuid, text, text) to authenticated;
