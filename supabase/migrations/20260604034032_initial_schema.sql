-- ============================================================
-- profiles
-- ============================================================
create table public.profiles (
  id           uuid    primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  avatar_url   text,
  is_pro       boolean default false
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ============================================================
-- categories
-- ============================================================
create table public.categories (
  id         text    primary key,
  user_id    uuid    references auth.users(id) on delete cascade not null,
  name       text    not null,
  color      text    not null,
  created_at bigint  not null
);

alter table public.categories enable row level security;

create policy "Users can view own categories"
  on public.categories for select
  using (auth.uid() = user_id);

create policy "Users can insert own categories"
  on public.categories for insert
  with check (auth.uid() = user_id);

create policy "Users can update own categories"
  on public.categories for update
  using (auth.uid() = user_id);

create policy "Users can delete own categories"
  on public.categories for delete
  using (auth.uid() = user_id);

create index categories_user_id_idx on public.categories(user_id);

-- ============================================================
-- sessions
-- ============================================================
create table public.sessions (
  id            text    primary key,
  user_id       uuid    references auth.users(id) on delete cascade not null,
  cat_id        text,
  duration_mins integer not null,
  completed_at  bigint  not null,
  note          text
);

alter table public.sessions enable row level security;

create policy "Users can view own sessions"
  on public.sessions for select
  using (auth.uid() = user_id);

create policy "Users can insert own sessions"
  on public.sessions for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own sessions"
  on public.sessions for delete
  using (auth.uid() = user_id);

create index sessions_user_id_idx      on public.sessions(user_id);
create index sessions_completed_at_idx on public.sessions(completed_at);

-- ============================================================
-- waitlist
-- ============================================================
create table public.waitlist (
  id         uuid        default gen_random_uuid() primary key,
  email      text        unique not null,
  created_at timestamptz default now()
);

alter table public.waitlist enable row level security;

create policy "Anyone can join waitlist"
  on public.waitlist for insert
  with check (true);

-- ============================================================
-- trigger: auto-create profile on signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
