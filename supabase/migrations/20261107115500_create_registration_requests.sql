create table if not exists public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  parent_nom text not null,
  parent_prenom text not null,
  email text not null,
  telephone text,
  children jsonb not null default '[]'::jsonb,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parent_id)
);

create index if not exists registration_requests_status_idx
  on public.registration_requests (status, created_at desc);

alter table public.registration_requests enable row level security;

create policy "Parents can create their registration request"
  on public.registration_requests
  for insert
  to authenticated
  with check (auth.uid() = parent_id);

create policy "Parents can view their registration request"
  on public.registration_requests
  for select
  to authenticated
  using (auth.uid() = parent_id);

create or replace function public.handle_pending_registration()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, nom, prenom, full_name, email, telephone, role)
  values (
    new.id,
    metadata ->> 'nom',
    metadata ->> 'prenom',
    metadata ->> 'full_name',
    new.email,
    metadata ->> 'telephone',
    'pending'
  )
  on conflict (id) do update set
    nom = excluded.nom,
    prenom = excluded.prenom,
    full_name = excluded.full_name,
    email = excluded.email,
    telephone = excluded.telephone,
    role = 'pending';

  insert into public.registration_requests (
    parent_id,
    parent_nom,
    parent_prenom,
    email,
    telephone,
    children,
    status
  )
  values (
    new.id,
    coalesce(metadata ->> 'nom', ''),
    coalesce(metadata ->> 'prenom', ''),
    coalesce(new.email, ''),
    metadata ->> 'telephone',
    coalesce(metadata -> 'children', '[]'::jsonb),
    'pending'
  )
  on conflict (parent_id) do update set
    parent_nom = excluded.parent_nom,
    parent_prenom = excluded.parent_prenom,
    email = excluded.email,
    telephone = excluded.telephone,
    children = excluded.children,
    status = 'pending',
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_pending_registration on auth.users;
create trigger on_auth_user_pending_registration
  after insert on auth.users
  for each row execute function public.handle_pending_registration();

create policy "Administrators can view registration requests"
  on public.registration_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('prof', 'teacher', 'professeur')
    )
  );

create or replace function public.approve_registration(request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_parent_id uuid;
begin
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('prof', 'teacher', 'professeur')
  ) then
    raise exception 'Acces refuse';
  end if;

  select parent_id into target_parent_id
  from public.registration_requests
  where id = request_id and status = 'pending';

  if target_parent_id is null then
    raise exception 'Demande introuvable ou deja traite';
  end if;

  update public.profiles
  set role = 'parent'
  where id = target_parent_id;

  update public.registration_requests
  set status = 'approved', updated_at = now()
  where id = request_id;
end;
$$;

revoke all on function public.approve_registration(uuid) from public;
grant execute on function public.approve_registration(uuid) to authenticated;

create or replace function public.reject_registration(request_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  target_parent_id uuid;
begin
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('prof', 'teacher', 'professeur')
  ) then
    raise exception 'Acces refuse';
  end if;

  select parent_id into target_parent_id
  from public.registration_requests
  where id = request_id and status = 'pending';

  if target_parent_id is null then
    raise exception 'Demande introuvable ou deja traite';
  end if;

  update public.registration_requests
  set status = 'rejected', updated_at = now()
  where id = request_id;
end;
$$;

revoke all on function public.reject_registration(uuid) from public;
grant execute on function public.reject_registration(uuid) to authenticated;
