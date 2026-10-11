-- Create the table if it doesn't exist
create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Enable RLS (safe to re-run)
alter table users enable row level security;

-- Drop and recreate policies so re-runs don't fail
drop policy if exists "allow insert from server" on users;
drop policy if exists "allow select from server" on users;

create policy "allow insert from server"
  on users for insert
  with check (true);

create policy "allow select from server"
  on users for select
  using (true);