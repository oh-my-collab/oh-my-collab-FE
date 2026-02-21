create or replace function public.reorder_workspace_tasks(
  p_workspace_id uuid,
  p_ordered_task_ids uuid[],
  p_actor_user_id uuid
)
returns void
language plpgsql
security invoker
as $$
declare
  workspace_task_count integer;
  input_task_count integer;
  distinct_input_count integer;
  matched_task_count integer;
begin
  input_task_count := coalesce(array_length(p_ordered_task_ids, 1), 0);
  if input_task_count = 0 then
    raise exception 'INVALID_INPUT';
  end if;

  select count(*) into workspace_task_count
  from public.tasks
  where workspace_id = p_workspace_id;

  select count(distinct task_id) into distinct_input_count
  from unnest(p_ordered_task_ids) as ordered(task_id);

  if distinct_input_count <> input_task_count then
    raise exception 'INVALID_INPUT';
  end if;

  select count(*) into matched_task_count
  from public.tasks
  where workspace_id = p_workspace_id
    and id = any(p_ordered_task_ids);

  if matched_task_count <> workspace_task_count or matched_task_count <> input_task_count then
    raise exception 'INVALID_INPUT';
  end if;

  with reordered as (
    select
      ordered.task_id,
      ordered.ordinality
    from unnest(p_ordered_task_ids) with ordinality as ordered(task_id, ordinality)
  )
  update public.tasks as task
  set
    sort_order = reordered.ordinality * 100,
    updated_by = p_actor_user_id,
    updated_at = timezone('utc', now())
  from reordered
  where task.workspace_id = p_workspace_id
    and task.id = reordered.task_id;
end;
$$;

revoke all on function public.reorder_workspace_tasks(uuid, uuid[], uuid) from public;
grant execute on function public.reorder_workspace_tasks(uuid, uuid[], uuid) to authenticated;
grant execute on function public.reorder_workspace_tasks(uuid, uuid[], uuid) to service_role;
