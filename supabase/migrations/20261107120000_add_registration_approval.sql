drop policy if exists "Administrators can view registration requests"
  on public.registration_requests;

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
begin
  if not exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role in ('prof', 'teacher', 'professeur')
  ) then
    raise exception 'Acces refuse';
  end if;

  update public.registration_requests
  set status = 'rejected', updated_at = now()
  where id = request_id
    and status = 'pending';

  if not found then
    raise exception 'Demande introuvable ou deja traite';
  end if;
end;
$$;

revoke all on function public.reject_registration(uuid) from public;
grant execute on function public.reject_registration(uuid) to authenticated;
