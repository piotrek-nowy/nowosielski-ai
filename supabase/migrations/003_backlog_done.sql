-- Add done column to backlog
alter table public.backlog
  add column if not exists done boolean default false;

-- Allow 'killer' in difficulty (extend check constraint)
alter table public.backlog
  drop constraint if exists backlog_difficulty_check;
alter table public.backlog
  add constraint backlog_difficulty_check
  check (difficulty in ('easy', 'medium', 'hard', 'killer'));
