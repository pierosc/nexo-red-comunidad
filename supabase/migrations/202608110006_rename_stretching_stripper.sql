-- Corrige el nombre de la opción de estiramiento y conserva perfiles existentes.
alter table public.profiles
  drop constraint if exists profiles_stretching_value;

update public.profiles
set stretching = 'Stripper'
where stretching = 'Streapper / striper';

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
      'Stripper',
      'Modelo',
      'Azúcar'
    )
  );
