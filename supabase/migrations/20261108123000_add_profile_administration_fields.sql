alter table public.profiles
  add column if not exists payment_status text,
  add column if not exists group_id text,
  add column if not exists groupe text,
  add column if not exists "groupeNom" text,
  add column if not exists "groupeId" text;

update public.profiles
set payment_status = 'En attente'
where payment_status is null;

alter table public.profiles
  alter column payment_status set default 'En attente';

alter table public.profiles
  drop constraint if exists profiles_payment_status_check;

alter table public.profiles
  add constraint profiles_payment_status_check
  check (payment_status in ('Payé', 'En attente'));

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
      and role in ('prof', 'teacher', 'professeur')
  ) then
    raise exception 'Accès refusé';
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
