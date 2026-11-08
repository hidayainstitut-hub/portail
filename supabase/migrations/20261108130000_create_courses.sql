create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  group_id text not null,
  group_name text not null,
  scheduled_at timestamptz not null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_group_schedule_idx
  on public.courses (group_id, scheduled_at);

alter table public.courses enable row level security;

create policy "Professors manage courses"
  on public.courses
  for all
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('prof', 'teacher', 'professeur')
    )
  )
  with check (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role in ('prof', 'teacher', 'professeur')
    )
  );

create policy "Students view their group courses"
  on public.courses
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles
      where id = auth.uid()
        and role = 'student'
        and (
          group_id = courses.group_id
          or "groupeId" = courses.group_id
          or "groupeNom" = courses.group_name
          or groupe = courses.group_name
        )
    )
  );

create policy "Parents view courses for their children"
  on public.courses
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.profiles child
      where child.parent_id = auth.uid()
        and child.role = 'student'
        and (
          child.group_id = courses.group_id
          or child."groupeId" = courses.group_id
          or child."groupeNom" = courses.group_name
          or child.groupe = courses.group_name
        )
    )
  );
