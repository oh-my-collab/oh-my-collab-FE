-- Task planning fields for backlog/sprint/blocker/deadline UX.

alter table public.tasks
  add column if not exists sprint_key text,
  add column if not exists is_blocked boolean not null default false,
  add column if not exists blocked_reason text,
  add column if not exists sort_order numeric not null default 1000;

update public.tasks
set sort_order = 1000
where sort_order is null;

create index if not exists idx_tasks_workspace_sort
  on public.tasks(workspace_id, sort_order, created_at);

create index if not exists idx_tasks_workspace_sprint
  on public.tasks(workspace_id, sprint_key);

create index if not exists idx_tasks_workspace_blocked
  on public.tasks(workspace_id, is_blocked);
