-- Nuevos datos opcionales del perfil.
alter table public.profiles add column if not exists instagram_url text;
alter table public.profiles add column if not exists hobbies text;
alter table public.profiles add column if not exists address text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_hobbies_length'
  ) then
    alter table public.profiles
      add constraint profiles_hobbies_length
      check (hobbies is null or char_length(hobbies) <= 500);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'profiles_address_length'
  ) then
    alter table public.profiles
      add constraint profiles_address_length
      check (address is null or char_length(address) <= 240);
  end if;
end
$$;
