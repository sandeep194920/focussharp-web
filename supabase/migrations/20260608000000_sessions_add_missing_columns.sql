alter table public.sessions
  add column if not exists cat_name   text,
  add column if not exists cat_color  text,
  add column if not exists started_at bigint,
  add column if not exists completed  boolean not null default true,
  add column if not exists type       text    not null default 'focus';
