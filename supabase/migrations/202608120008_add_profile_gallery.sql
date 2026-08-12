-- Galería de enlaces públicos para mostrar fotos adicionales en cada perfil.
alter table public.profiles
  add column if not exists gallery_urls text[] not null default '{}'::text[];

update public.profiles
set gallery_urls = (coalesce(gallery_urls, '{}'::text[]))[1:8]
where gallery_urls is null or cardinality(gallery_urls) > 8;

alter table public.profiles
  alter column gallery_urls set default '{}'::text[],
  alter column gallery_urls set not null;

alter table public.profiles
  drop constraint if exists profiles_gallery_urls_limit;
alter table public.profiles
  add constraint profiles_gallery_urls_limit
  check (cardinality(gallery_urls) <= 8);
