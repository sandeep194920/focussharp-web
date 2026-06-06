-- Add source column to waitlist to track where signups came from (landing page, blog, etc.)
alter table public.waitlist add column source text;
