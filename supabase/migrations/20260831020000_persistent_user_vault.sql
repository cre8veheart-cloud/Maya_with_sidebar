-- MAYA Persistent Workspace Foundation
-- Server-owned profile and executive lens storage.
-- Application routes isolate rows by the signed beta-session subject.

create table if not exists public.maya_user_profiles (
  workspace_id text primary key,
  profile jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.maya_role_lenses (
  workspace_id text not null,
  role text not null,
  lens jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (workspace_id, role),
  constraint maya_role_lenses_role_check
    check (role in ('ceo','coo','cmo','cfo','cto','cio','cro','cd','admin','hr','legal'))
);

alter table public.maya_user_profiles enable row level security;
alter table public.maya_role_lenses enable row level security;

-- No browser-facing policy is created. The service role is server-only and
-- API routes enforce the authenticated workspace boundary.
revoke all on public.maya_user_profiles from anon, authenticated;
revoke all on public.maya_role_lenses from anon, authenticated;
grant select, insert, update, delete on public.maya_user_profiles to service_role;
grant select, insert, update, delete on public.maya_role_lenses to service_role;
