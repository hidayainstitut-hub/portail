create table if not exists public.attendances (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  group_id text not null,
  attendance_date date not null,
  status text not null check (status in ('Présent', 'Absent')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (student_id, group_id, attendance_date)
);

create index if not exists attendances_group_date_idx
  on public.attendances (group_id, attendance_date);
