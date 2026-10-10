create table if not exists users (
  id uuid default gen_random_uuid() primary key,
  email text not null unique,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Example insert
insert into users (email, password_hash)
values ('user@example.com', 'hashed_password_here');

-- Example login lookup
select *
from users
where email = 'user@example.com';
