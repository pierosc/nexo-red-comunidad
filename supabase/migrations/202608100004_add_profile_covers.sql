-- Portada personalizable para cada perfil.
alter table public.profiles
  add column if not exists cover_url text,
  add column if not exists cover_zoom numeric(3,2) not null default 1,
  add column if not exists cover_position_x smallint not null default 50,
  add column if not exists cover_position_y smallint not null default 50;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_cover_zoom_range') then
    alter table public.profiles add constraint profiles_cover_zoom_range check (cover_zoom between 1 and 2);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_cover_position_x_range') then
    alter table public.profiles add constraint profiles_cover_position_x_range check (cover_position_x between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_cover_position_y_range') then
    alter table public.profiles add constraint profiles_cover_position_y_range check (cover_position_y between 0 and 100);
  end if;
end
$$;
