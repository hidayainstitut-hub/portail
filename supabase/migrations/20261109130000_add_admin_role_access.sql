create table if not exists public.registration_requests (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid not null references auth.users(id) on delete cascade,
  parent_nom text not null,
  parent_prenom text not null,
  email text not null,
  telephone text,
  children jsonb not null default '[]'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (parent_id)
);

create index if not exists registration_requests_status_idx
  on public.registration_requests (status, created_at desc);

alter table public.registration_requests enable row level security;

drop policy if exists "Parents can create their registration request"
  on public.registration_requests;
drop policy if exists "Parents can view their registration request"
  on public.registration_requests;
drop policy if exists "Administrators can view registration requests"
  on public.registration_requests;

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

create policy "Administrators can view registration requests"
  on public.registration_requests
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and lower(btrim(role)) = 'admin'
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
      and lower(btrim(role)) = 'admin'
  ) then
    raise exception 'Acces refuse';
  end if;

  select parent_id into target_parent_id
  from public.registration_requests
  where id = request_id and status = 'pending';

  if target_parent_id is null then
    raise exception 'Demande introuvable ou deja traitee';
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
begin
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and lower(btrim(role)) = 'admin'
  ) then
    raise exception 'Acces refuse';
  end if;

  update public.registration_requests
  set status = 'rejected', updated_at = now()
  where id = request_id
    and status = 'pending';

  if not found then
    raise exception 'Demande introuvable ou deja traitee';
  end if;
end;
$$;

revoke all on function public.reject_registration(uuid) from public;
grant execute on function public.reject_registration(uuid) to authenticated;

create or replace function public.update_profile_administration(
  target_profile_id uuid,
  target_group_id text,
  target_group_nom text,
  target_payment_status text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and lower(btrim(role)) = 'admin'
  ) then
    raise exception 'Acces refuse';
  end if;

  if target_payment_status not in ('Payé', 'En attente') then
    raise exception 'Statut de paiement invalide';
  end if;

  update public.profiles
  set
    group_id = nullif(target_group_id, ''),
    "groupeId" = nullif(target_group_id, ''),
    "groupeNom" = nullif(target_group_nom, ''),
    groupe = nullif(target_group_nom, ''),
    payment_status = target_payment_status
  where id = target_profile_id;

  if not found then
    raise exception 'Profil introuvable';
  end if;
end;
$$;

revoke all on function public.update_profile_administration(uuid, text, text, text) from public;
grant execute on function public.update_profile_administration(uuid, text, text, text) to authenticated;

drop policy if exists "Professors manage courses" on public.courses;

create policy "Professors manage courses"
  on public.courses
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and lower(btrim(role)) in ('admin', 'prof', 'teacher', 'professeur')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and lower(btrim(role)) in ('admin', 'prof', 'teacher', 'professeur')
    )
  );