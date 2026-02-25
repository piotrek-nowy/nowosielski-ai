-- Table: backlog
create table public.backlog (
  id serial primary key,
  created_at timestamptz not null default now(),
  name text not null,
  difficulty text check (difficulty in ('easy', 'medium', 'hard')),
  category text check (category in ('random', 'fun', 'AI', 'praca', 'edukacja')),
  estimated_time integer,
  estimated_date date,
  actual_time integer,
  actual_date date
);

create index backlog_created_at_idx on public.backlog (created_at desc);

-- RLS
alter table public.backlog enable row level security;

-- SELECT: public for everyone
create policy "Public read backlog"
  on public.backlog for select
  using (true);

-- Authenticated users: full CRUD
create policy "Authenticated insert backlog"
  on public.backlog for insert
  to authenticated
  with check (true);

create policy "Authenticated update backlog"
  on public.backlog for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated delete backlog"
  on public.backlog for delete
  to authenticated
  using (true);
