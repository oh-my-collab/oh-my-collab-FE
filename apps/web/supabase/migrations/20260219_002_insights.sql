-- Insights view for contribution transparency
create or replace view public.v_member_contribution_scores as
with task_component as (
  select
    t.workspace_id,
    coalesce(t.assignee_id, t.updated_by) as user_id,
    sum(case when t.status = 'done' then greatest(t.difficulty, 1) else 0 end)::numeric as task_score
  from public.tasks t
  group by t.workspace_id, coalesce(t.assignee_id, t.updated_by)
),
docs_component as (
  select
    d.workspace_id,
    d.updated_by as user_id,
    count(*)::numeric as docs_score
  from public.docs d
  group by d.workspace_id, d.updated_by
),
goal_component as (
  select
    g.workspace_id,
    g.updated_by as user_id,
    count(*)::numeric as goal_score
  from public.goal_key_results g
  group by g.workspace_id, g.updated_by
),
collab_component as (
  select
    a.workspace_id,
    a.actor_user_id as user_id,
    count(*)::numeric as collab_score
  from public.activity_events a
  where a.event_type in ('comment', 'review', 'blocker_resolved')
  group by a.workspace_id, a.actor_user_id
),
all_members as (
  select workspace_id, user_id from public.workspace_members
  union
  select workspace_id, user_id from task_component
  union
  select workspace_id, user_id from docs_component
  union
  select workspace_id, user_id from goal_component
  union
  select workspace_id, user_id from collab_component
),
scored as (
  select
    m.workspace_id,
    m.user_id,
    coalesce(t.task_score, 0) as task_score,
    coalesce(d.docs_score, 0) as docs_score,
    coalesce(g.goal_score, 0) as goal_score,
    coalesce(c.collab_score, 0) as collab_score
  from all_members m
  left join task_component t on t.workspace_id = m.workspace_id and t.user_id = m.user_id
  left join docs_component d on d.workspace_id = m.workspace_id and d.user_id = m.user_id
  left join goal_component g on g.workspace_id = m.workspace_id and g.user_id = m.user_id
  left join collab_component c on c.workspace_id = m.workspace_id and c.user_id = m.user_id
),
normalized as (
  select
    s.*,
    s.task_score / greatest(max(s.task_score) over (partition by s.workspace_id), 1) as task_norm,
    s.docs_score / greatest(max(s.docs_score) over (partition by s.workspace_id), 1) as docs_norm,
    s.goal_score / greatest(max(s.goal_score) over (partition by s.workspace_id), 1) as goal_norm,
    s.collab_score / greatest(max(s.collab_score) over (partition by s.workspace_id), 1) as collab_norm
  from scored s
)
select
  workspace_id,
  user_id,
  task_score,
  docs_score,
  goal_score,
  collab_score,
  round((0.40 * task_norm + 0.20 * docs_norm + 0.25 * goal_norm + 0.15 * collab_norm)::numeric, 4) as contribution_score
from normalized;
