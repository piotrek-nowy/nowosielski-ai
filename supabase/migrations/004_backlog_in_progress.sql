-- Add in_progress column to backlog (gear icon = currently working on)
alter table public.backlog
  add column if not exists in_progress boolean default false;
