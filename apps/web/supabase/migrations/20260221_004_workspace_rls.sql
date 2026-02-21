-- Workspace creation and membership role update RLS hardening.

drop policy if exists workspaces_insert_creator on public.workspaces;
create policy workspaces_insert_creator
on public.workspaces for insert
with check (created_by = auth.uid());

drop policy if exists workspace_members_insert_owner_bootstrap on public.workspace_members;
create policy workspace_members_insert_owner_bootstrap
on public.workspace_members for insert
with check (
  user_id = auth.uid()
  and role = 'owner'
  and exists (
    select 1
    from public.workspaces w
    where w.id = workspace_id
      and w.created_by = auth.uid()
  )
);

drop policy if exists workspace_members_owner_role_update on public.workspace_members;
create policy workspace_members_owner_role_update
on public.workspace_members for update
using (
  role <> 'owner'
  and exists (
    select 1
    from public.workspace_members actor
    where actor.workspace_id = workspace_members.workspace_id
      and actor.user_id = auth.uid()
      and actor.role = 'owner'
  )
)
with check (
  role in ('admin', 'member')
  and exists (
    select 1
    from public.workspace_members actor
    where actor.workspace_id = workspace_members.workspace_id
      and actor.user_id = auth.uid()
      and actor.role = 'owner'
  )
);
