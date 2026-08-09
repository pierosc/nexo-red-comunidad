-- Encuadre persistente de fotos y nomenclatura real de promociones.
alter table public.profiles
  add column if not exists photo_zoom numeric(3,2) not null default 1,
  add column if not exists photo_position_x smallint not null default 50,
  add column if not exists photo_position_y smallint not null default 50;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_photo_zoom_range') then
    alter table public.profiles add constraint profiles_photo_zoom_range check (photo_zoom between 1 and 2);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_photo_position_x_range') then
    alter table public.profiles add constraint profiles_photo_position_x_range check (photo_position_x between 0 and 100);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_photo_position_y_range') then
    alter table public.profiles add constraint profiles_photo_position_y_range check (photo_position_y between 0 and 100);
  end if;
end
$$;

update public.profiles
set cohort = case cohort
  when 'Promoción 2015' then 'Lima 198'
  when 'Promoción 2016' then 'Lima 199'
  when 'Promoción 2017' then 'Lima 200'
  when 'Promoción 2018' then 'Lima 201'
  when 'Promoción 2019' then 'Lima 202'
  when 'Promoción 2020' then 'Lima 203'
  when 'Promoción 2021' then 'Lima 204'
  when 'Promoción 2022' then 'Lima 205'
  else cohort
end
where cohort in (
  'Promoción 2015', 'Promoción 2016', 'Promoción 2017', 'Promoción 2018',
  'Promoción 2019', 'Promoción 2020', 'Promoción 2021', 'Promoción 2022'
);
