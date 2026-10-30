-- MAYA Pocket Office automatic session closeouts
-- Server-owned, workspace- and client-vault-isolated persistence.

create table if not exists public.maya_pocket_office_sessions (
  id text not null,
  workspace_id text not null,
  client_vault_id text not null default 'personal',
  role text not null,
  title text not null,
  transcript jsonb not null default '[]'::jsonb,
  status text not null default 'active',
  last_activity_at timestamptz not null default now(),
  closed_at timestamptz,
  closeout jsonb,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (workspace_id, client_vault_id, id),
  constraint maya_pocket_office_sessions_role_check
    check (role in (
      'ceo','coo','cmo','cfo','cto','cio','cro','cd',
      'admin','hr','legal','strategy-room'
    )),
  constraint maya_pocket_office_sessions_status_check
    check (status in ('active','closed','auto_closed'))
);

create index if not exists maya_pocket_office_sessions_scope_activity_idx
  on public.maya_pocket_office_sessions
  (workspace_id, client_vault_id, last_activity_at desc);

alter table public.maya_pocket_office_sessions enable row level security;

-- Browser clients never receive direct table access. Authenticated MAYA API routes
-- enforce both workspace_id and client_vault_id on every read and write.
revoke all on public.maya_pocket_office_sessions from anon, authenticated;
grant select, insert, update, delete
  on public.maya_pocket_office_sessions to service_role;
