-- Conversaciones persistentes para promociones Lima y hobbies.
create table if not exists public.community_messages (
  id uuid primary key default gen_random_uuid(),
  channel_type text not null check (channel_type in ('cohort', 'hobby')),
  channel_key text not null check (char_length(btrim(channel_key)) between 1 and 80),
  author_profile_id uuid not null references public.profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists community_messages_channel_created_idx
  on public.community_messages (channel_type, channel_key, created_at desc);
create index if not exists community_messages_author_idx
  on public.community_messages (author_profile_id);

-- Guarda hasta dónde leyó cada persona en cada conversación y funciona entre dispositivos.
create table if not exists public.community_channel_reads (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  channel_type text not null check (channel_type in ('cohort', 'hobby')),
  channel_key text not null check (char_length(btrim(channel_key)) between 1 and 80),
  last_read_at timestamptz not null default now(),
  primary key (profile_id, channel_type, channel_key)
);

alter table public.community_messages enable row level security;
alter table public.community_channel_reads enable row level security;

drop policy if exists "Authenticated members can view community messages" on public.community_messages;
create policy "Authenticated members can view community messages"
on public.community_messages for select
to authenticated
using (true);

drop policy if exists "Members can view their community reads" on public.community_channel_reads;
create policy "Members can view their community reads"
on public.community_channel_reads for select
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = community_channel_reads.profile_id
      and profiles.clerk_user_id = (select auth.jwt()->>'sub')
  )
);

revoke all on public.community_messages from anon, authenticated;
revoke all on public.community_channel_reads from anon, authenticated;
grant select on public.community_messages to authenticated;
grant select on public.community_channel_reads to authenticated;

create or replace function public.post_community_message(
  p_channel_type text,
  p_channel_key text,
  p_body text
)
returns public.community_messages
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid;
  v_channel_key text;
  v_body text;
  v_message public.community_messages;
begin
  select id
  into v_profile_id
  from public.profiles
  where clerk_user_id = (select auth.jwt()->>'sub');

  if v_profile_id is null then
    raise exception 'No existe un perfil para la cuenta activa.';
  end if;

  if p_channel_type not in ('cohort', 'hobby') then
    raise exception 'El tipo de conversación no es válido.';
  end if;

  v_channel_key := btrim(coalesce(p_channel_key, ''));
  v_body := btrim(coalesce(p_body, ''));

  if char_length(v_channel_key) not between 1 and 80 then
    raise exception 'La conversación seleccionada no es válida.';
  end if;

  if char_length(v_body) not between 1 and 1000 then
    raise exception 'El mensaje debe tener entre 1 y 1000 caracteres.';
  end if;

  insert into public.community_messages (
    channel_type,
    channel_key,
    author_profile_id,
    body
  ) values (
    p_channel_type,
    v_channel_key,
    v_profile_id,
    v_body
  )
  returning * into v_message;

  return v_message;
end;
$$;

create or replace function public.mark_community_channel_read(
  p_channel_type text,
  p_channel_key text
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile_id uuid;
  v_channel_key text;
  v_read_at timestamptz := now();
begin
  select id
  into v_profile_id
  from public.profiles
  where clerk_user_id = (select auth.jwt()->>'sub');

  if v_profile_id is null then
    raise exception 'No existe un perfil para la cuenta activa.';
  end if;

  if p_channel_type not in ('cohort', 'hobby') then
    raise exception 'El tipo de conversación no es válido.';
  end if;

  v_channel_key := btrim(coalesce(p_channel_key, ''));
  if char_length(v_channel_key) not between 1 and 80 then
    raise exception 'La conversación seleccionada no es válida.';
  end if;

  insert into public.community_channel_reads (
    profile_id,
    channel_type,
    channel_key,
    last_read_at
  ) values (
    v_profile_id,
    p_channel_type,
    v_channel_key,
    v_read_at
  )
  on conflict (profile_id, channel_type, channel_key)
  do update set last_read_at = excluded.last_read_at;

  return v_read_at;
end;
$$;

revoke all on function public.post_community_message(text, text, text) from public;
revoke all on function public.mark_community_channel_read(text, text) from public;
grant execute on function public.post_community_message(text, text, text) to authenticated;
grant execute on function public.mark_community_channel_read(text, text) to authenticated;

-- Envía mensajes nuevos al cliente sin recargar la página.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'community_messages'
  ) then
    alter publication supabase_realtime add table public.community_messages;
  end if;
end;
$$;
