-- Initial schema for the portfolio backend.
-- Matches docs/06-architecture-infrastructure.md §3 (data model) and
-- docs/07-api-contract.md (field-level contract consumed by the NestJS API).
--
-- NestJS connects via a direct Postgres connection (Prisma), not through
-- Supabase's PostgREST auto-REST layer (architecture doc §6), so RLS below
-- doesn't gate the backend itself. It exists as defense in depth: the
-- frontend only ever holds the anon key, and enabling RLS with zero
-- policies means that key can't read or write anything via PostgREST
-- directly, even by accident — every access path goes through the NestJS
-- API's own business logic (e.g. "never return unpublished content").

create extension if not exists "pgcrypto";

-- Shared trigger: keep `updated_at` current on every row update, so no
-- write path (including ones added later) can forget to set it manually.
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- projects ------------------------------------------------------------

create table projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  summary text not null,
  problem text not null,
  role text not null,
  outcome text not null,
  stack text[] not null default '{}',
  image_url text not null,
  repo_url text,
  demo_url text,
  featured boolean not null default false,
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint projects_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint projects_stack_not_empty check (array_length(stack, 1) > 0)
);

create index projects_published_updated_at_idx
  on projects (updated_at desc)
  where published = true;

create trigger projects_set_updated_at
  before update on projects
  for each row execute function set_updated_at();

alter table projects enable row level security;

-- posts ---------------------------------------------------------------

create table posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text not null,
  content text not null,
  image_url text not null,
  read_minutes integer not null,
  published boolean not null default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint posts_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint posts_read_minutes_positive check (read_minutes > 0)
);

create index posts_published_published_at_idx
  on posts (published_at desc)
  where published = true;

create trigger posts_set_updated_at
  before update on posts
  for each row execute function set_updated_at();

alter table posts enable row level security;

-- resume ----------------------------------------------------------------
-- Single-row table: the whole resume is one record (architecture doc §3).

create table resume (
  id uuid primary key default gen_random_uuid(),
  summary text not null default '',
  experience jsonb not null default '[]',
  education jsonb not null default '[]',
  skills text[] not null default '{}',
  pdf_url text,
  updated_at timestamptz not null default now()
);

create trigger resume_set_updated_at
  before update on resume
  for each row execute function set_updated_at();

alter table resume enable row level security;

-- Seed the single resume row now so `GET /api/resume` has something to
-- return from day one instead of every environment needing a manual insert.
insert into resume (summary, experience, education, skills)
values ('', '[]', '[]', '{}');

-- contact_submissions -----------------------------------------------------

create table contact_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'unread',
  created_at timestamptz not null default now(),
  constraint contact_submissions_status_valid
    check (status in ('unread', 'read', 'archived')),
  constraint contact_submissions_name_length check (char_length(name) between 1 and 200),
  constraint contact_submissions_message_length check (char_length(message) between 1 and 5000)
);

create index contact_submissions_created_at_idx
  on contact_submissions (created_at desc);

alter table contact_submissions enable row level security;
