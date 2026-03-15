-- Run this in Supabase Dashboard → SQL Editor to create the buildings table.

create table if not exists public.buildings (
  id integer primary key,
  name text not null,
  lat double precision not null,
  lng double precision not null,
  category text not null,
  description text default '',
  facilities jsonb default '[]'::jsonb,
  photo text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional: enable RLS. Your API uses the service role key which bypasses RLS.
-- alter table public.buildings enable row level security;
