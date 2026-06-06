-- Fix waitlist RLS to explicitly allow anonymous inserts
drop policy if exists "Anyone can join waitlist" on public.waitlist;

create policy "Anyone can join waitlist"
  on public.waitlist for insert
  to anon, authenticated
  with check (true);
