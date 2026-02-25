-- Table: posts
create table public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  content text,
  excerpt text,
  cover_image_url text,
  category text,
  lang text not null default 'pl' check (lang in ('pl', 'en')),
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_slug_idx on public.posts (slug);
create index posts_published_idx on public.posts (published) where published = true;
create index posts_created_at_idx on public.posts (created_at desc);

-- Trigger: update updated_at on row change
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

-- RLS
alter table public.posts enable row level security;

-- SELECT: public for published posts only
create policy "Public read published posts"
  on public.posts for select
  using (published = true);

-- Authenticated users: full CRUD
create policy "Authenticated insert posts"
  on public.posts for insert
  to authenticated
  with check (true);

create policy "Authenticated update posts"
  on public.posts for update
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated delete posts"
  on public.posts for delete
  to authenticated
  using (true);

-- Authenticated can read all (including drafts) for admin
create policy "Authenticated read all posts"
  on public.posts for select
  to authenticated
  using (true);
