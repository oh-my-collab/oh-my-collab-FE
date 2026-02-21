-- Admin reviews and evaluation support

do $$
begin
  if exists (
    select 1
    from information_schema.table_constraints
    where table_schema = 'public'
      and table_name = 'workspace_members'
      and constraint_name = 'workspace_members_role_check'
  ) then
    alter table public.workspace_members
      drop constraint workspace_members_role_check;
  end if;
end $$;

alter table public.workspace_members
  add constraint workspace_members_role_check
  check (role in ('owner', 'admin', 'member'));

create or replace function public.is_workspace_admin(target_workspace uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = target_workspace
      and wm.user_id = auth.uid()
      and wm.role in ('owner', 'admin')
  );
$$;

create table if not exists public.performance_cycles (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  title text not null,
  period_start timestamptz not null,
  period_end timestamptz not null,
  status text not null default 'draft' check (status in ('draft', 'open', 'closed')),
  weights_json jsonb not null default '{"execution":40,"docs":20,"goals":25,"collaboration":15}'::jsonb,
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.performance_reviews (
  id uuid primary key default gen_random_uuid(),
  cycle_id uuid not null references public.performance_cycles(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null,
  evidence_snapshot_json jsonb not null default '{}'::jsonb,
  score_preview numeric not null default 0,
  manager_note text,
  final_rating text,
  locked_at timestamptz,
  updated_by uuid not null,
  updated_at timestamptz not null default now(),
  unique (cycle_id, user_id)
);

create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_user_id uuid not null,
  action text not null,
  target_user_id uuid,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_performance_cycles_workspace
  on public.performance_cycles(workspace_id);
create index if not exists idx_performance_reviews_workspace_cycle
  on public.performance_reviews(workspace_id, cycle_id);
create index if not exists idx_admin_audit_logs_workspace
  on public.admin_audit_logs(workspace_id, created_at desc);

alter table public.performance_cycles enable row level security;
alter table public.performance_reviews enable row level security;
alter table public.admin_audit_logs enable row level security;

drop policy if exists performance_cycles_select_member on public.performance_cycles;
create policy performance_cycles_select_member
on public.performance_cycles for select
using (public.is_workspace_member(workspace_id));

drop policy if exists performance_cycles_admin_all on public.performance_cycles;
create policy performance_cycles_admin_all
on public.performance_cycles for all
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

drop policy if exists performance_reviews_select_member on public.performance_reviews;
create policy performance_reviews_select_member
on public.performance_reviews for select
using (public.is_workspace_member(workspace_id));

drop policy if exists performance_reviews_admin_all on public.performance_reviews;
create policy performance_reviews_admin_all
on public.performance_reviews for all
using (public.is_workspace_admin(workspace_id))
with check (public.is_workspace_admin(workspace_id));

drop policy if exists admin_audit_logs_admin_read on public.admin_audit_logs;
create policy admin_audit_logs_admin_read
on public.admin_audit_logs for select
using (public.is_workspace_admin(workspace_id));

drop policy if exists admin_audit_logs_admin_insert on public.admin_audit_logs;
create policy admin_audit_logs_admin_insert
on public.admin_audit_logs for insert
with check (public.is_workspace_admin(workspace_id));
