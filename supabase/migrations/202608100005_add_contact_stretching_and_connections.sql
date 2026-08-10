-- Datos de contacto adicionales y registro seguro de conexiones de enrolamiento.
alter table public.profiles
  add column if not exists phone text,
  add column if not exists facebook_url text,
  add column if not exists stretching text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_phone_length') then
    alter table public.profiles
      add constraint profiles_phone_length
      check (phone is null or char_length(phone) <= 40);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_facebook_url_length') then
    alter table public.profiles
      add constraint profiles_facebook_url_length
      check (facebook_url is null or char_length(facebook_url) <= 500);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'profiles_stretching_value') then
    alter table public.profiles
      add constraint profiles_stretching_value
      check (
        stretching is null or stretching in (
          'Mimo',
          'Odalisca',
          'Novia',
          'Puma',
          'Bailarina',
          'Mariposa',
          'Cupido',
          'Gaviota',
          'Streapper / striper',
          'Modelo',
          'Azúcar'
        )
      );
  end if;
end
$$;

create or replace function public.set_enrollment_connection(
  p_enroller_id uuid,
  p_enrollee_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_profile_id uuid;
begin
  select id
  into caller_profile_id
  from public.profiles
  where clerk_user_id = auth.jwt()->>'sub';

  if caller_profile_id is null then
    raise exception 'No existe un perfil para la cuenta actual.' using errcode = '42501';
  end if;

  if p_enroller_id is null or p_enrollee_id is null or p_enroller_id = p_enrollee_id then
    raise exception 'La conexión seleccionada no es válida.' using errcode = '22023';
  end if;

  if caller_profile_id <> p_enroller_id and caller_profile_id <> p_enrollee_id then
    raise exception 'Solo puedes registrar conexiones en las que participas.' using errcode = '42501';
  end if;

  if not exists (select 1 from public.profiles where id = p_enroller_id)
    or not exists (select 1 from public.profiles where id = p_enrollee_id) then
    raise exception 'No encontramos una de las personas seleccionadas.' using errcode = '22023';
  end if;

  if exists (
    with recursive ancestry as (
      select id, enrolled_by_id
      from public.profiles
      where id = p_enroller_id
      union
      select parent.id, parent.enrolled_by_id
      from public.profiles parent
      join ancestry child on parent.id = child.enrolled_by_id
    )
    select 1 from ancestry where id = p_enrollee_id
  ) then
    raise exception 'Esta conexión crearía un ciclo en el árbol.' using errcode = '22023';
  end if;

  update public.profiles
  set enrolled_by_id = p_enroller_id
  where id = p_enrollee_id;
end;
$$;

revoke all on function public.set_enrollment_connection(uuid, uuid) from public;
grant execute on function public.set_enrollment_connection(uuid, uuid) to authenticated;
