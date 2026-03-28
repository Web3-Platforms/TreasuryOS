alter table app_users
  add column if not exists display_name text not null default 'Operator',
  add column if not exists roles text[] not null default '{}'::text[],
  add column if not exists status text not null default 'active',
  add column if not exists password_salt text,
  add column if not exists password_hash text,
  add column if not exists last_login_at timestamptz;

update app_users
set roles = case
  when coalesce(array_length(roles, 1), 0) = 0 then array[role]
  else roles
end;

alter table app_users
  alter column roles set not null,
  alter column roles set default '{}'::text[];

create table if not exists auth_sessions (
  id text primary key,
  user_id text not null references app_users(id),
  token_id text not null unique,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  ip_address text,
  user_agent text,
  revoked_at timestamptz
);
