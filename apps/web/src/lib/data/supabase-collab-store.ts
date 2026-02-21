import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ActivityEvent,
  AdminAuditLog,
  BuildEvidencePackResult,
  CollabStore,
  CreatePerformanceCycleInput,
  CreateDocInput,
  CreateGoalInput,
  CreateKeyResultInput,
  CreateTaskInput,
  CreateWorkspaceInput,
  Doc,
  Goal,
  InsightsSummary,
  KeyResult,
  PerformanceCycle,
  PerformanceReview,
  ReorderTasksInput,
  Task,
  TaskListPageInput,
  UpdatePerformanceCycleInput,
  UpdateDocInput,
  UpdateKeyResultProgressInput,
  UpdateTaskInput,
  UpdateWorkspaceMembershipRoleInput,
  UpsertPerformanceReviewInput,
  Workspace,
  WorkspaceMembership,
} from "./collab-store";

type AnyRow = Record<string, unknown>;

function toWorkspace(row: AnyRow): Workspace {
  return {
    id: String(row.id),
    name: String(row.name),
    createdBy: String(row.created_by),
    createdAt: String(row.created_at),
  };
}

function toMembership(row: AnyRow): WorkspaceMembership {
  return {
    workspaceId: String(row.workspace_id),
    userId: String(row.user_id),
    role: (row.role as WorkspaceMembership["role"]) ?? "member",
    joinedAt: String(row.joined_at),
  };
}

function toDoc(row: AnyRow): Doc {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    title: String(row.title),
    content: String(row.content ?? ""),
    templateKey: String(row.template_key) as Doc["templateKey"],
    createdBy: String(row.created_by),
    updatedBy: String(row.updated_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toTask(row: AnyRow): Task {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    status: String(row.status) as Task["status"],
    assigneeId: row.assignee_id ? String(row.assignee_id) : undefined,
    priority: String(row.priority) as Task["priority"],
    difficulty: Number(row.difficulty ?? 1),
    dueDate: row.due_date ? String(row.due_date) : undefined,
    checklist: Array.isArray(row.checklist)
      ? row.checklist.map((item) => String(item))
      : [],
    repeat: String(row.repeat_rule ?? "none") as Task["repeat"],
    sprintKey: row.sprint_key ? String(row.sprint_key) : undefined,
    isBlocked: Boolean(row.is_blocked),
    blockedReason: row.blocked_reason ? String(row.blocked_reason) : undefined,
    sortOrder:
      typeof row.sort_order === "number"
        ? row.sort_order
        : row.sort_order
          ? Number(row.sort_order)
          : undefined,
    createdBy: String(row.created_by),
    updatedBy: String(row.updated_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

const TASK_SELECT_FIELDS =
  "id, workspace_id, title, description, status, assignee_id, priority, difficulty, due_date, checklist, repeat_rule, sprint_key, is_blocked, blocked_reason, sort_order, created_by, updated_by, created_at, updated_at";

function toGoal(row: AnyRow): Goal {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    targetDate: row.target_date ? String(row.target_date) : undefined,
    createdBy: String(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toKeyResult(row: AnyRow): KeyResult {
  return {
    id: String(row.id),
    goalId: String(row.goal_id),
    workspaceId: String(row.workspace_id),
    title: String(row.title),
    metric: String(row.metric),
    targetValue: Number(row.target_value),
    currentValue: Number(row.current_value),
    progress: Number(row.progress),
    updatedBy: String(row.updated_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toPerformanceCycle(row: AnyRow): PerformanceCycle {
  return {
    id: String(row.id),
    workspaceId: String(row.workspace_id),
    title: String(row.title),
    periodStart: String(row.period_start),
    periodEnd: String(row.period_end),
    status: String(row.status) as PerformanceCycle["status"],
    weights: {
      execution: Number((row.weights_json as AnyRow)?.execution ?? 40),
      docs: Number((row.weights_json as AnyRow)?.docs ?? 20),
      goals: Number((row.weights_json as AnyRow)?.goals ?? 25),
      collaboration: Number((row.weights_json as AnyRow)?.collaboration ?? 15),
    },
    createdBy: String(row.created_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

function toPerformanceReview(row: AnyRow): PerformanceReview {
  return {
    id: String(row.id),
    cycleId: String(row.cycle_id),
    workspaceId: String(row.workspace_id),
    userId: String(row.user_id),
    evidenceSnapshot: (row.evidence_snapshot_json as PerformanceReview["evidenceSnapshot"]) ?? {
      periodStart: "",
      periodEnd: "",
      raw: { execution: 0, docs: 0, goals: 0, collaboration: 0 },
      normalized: { execution: 0, docs: 0, goals: 0, collaboration: 0 },
      highlights: [],
    },
    scorePreview: Number(row.score_preview ?? 0),
    managerNote: row.manager_note ? String(row.manager_note) : undefined,
    finalRating: row.final_rating ? String(row.final_rating) : undefined,
    lockedAt: row.locked_at ? String(row.locked_at) : undefined,
    updatedBy: String(row.updated_by),
    updatedAt: String(row.updated_at),
  };
}

function normalizeWeights(weights: PerformanceCycle["weights"]) {
  const execution = Math.max(0, Number(weights.execution ?? 0));
  const docs = Math.max(0, Number(weights.docs ?? 0));
  const goals = Math.max(0, Number(weights.goals ?? 0));
  const collaboration = Math.max(0, Number(weights.collaboration ?? 0));
  const sum = execution + docs + goals + collaboration;

  if (sum === 0) {
    return { execution: 40, docs: 20, goals: 25, collaboration: 15 };
  }

  return {
    execution: Math.round((execution / sum) * 10000) / 100,
    docs: Math.round((docs / sum) * 10000) / 100,
    goals: Math.round((goals / sum) * 10000) / 100,
    collaboration: Math.round((collaboration / sum) * 10000) / 100,
  };
}

function normalizeError(error: { message: string } | null, fallback: string) {
  if (!error) return;
  throw new Error(error.message || fallback);
}

function requireRow<T>(data: T | null, fallback: string): T {
  if (data === null) {
    throw new Error(fallback);
  }
  return data;
}

export function createSupabaseCollabStore(client: SupabaseClient): CollabStore {
  return {
    async createWorkspaceWithOwner(input: CreateWorkspaceInput) {
      const { data: workspaceRow, error: workspaceError } = await client
        .from("workspaces")
        .insert({
          name: input.name,
          created_by: input.ownerUserId,
        })
        .select("id, name, created_by, created_at")
        .single();
      normalizeError(workspaceError, "WORKSPACE_CREATE_FAILED");
      const ensuredWorkspaceRow = requireRow(workspaceRow, "WORKSPACE_CREATE_FAILED");

      const { data: membershipRow, error: membershipError } = await client
        .from("workspace_members")
        .insert({
          workspace_id: ensuredWorkspaceRow.id,
          user_id: input.ownerUserId,
          role: "owner",
        })
        .select("workspace_id, user_id, role, joined_at")
        .single();
      normalizeError(membershipError, "MEMBERSHIP_CREATE_FAILED");
      const ensuredMembershipRow = requireRow(
        membershipRow,
        "MEMBERSHIP_CREATE_FAILED"
      );

      return {
        workspace: toWorkspace(ensuredWorkspaceRow as AnyRow),
        membership: toMembership(ensuredMembershipRow as AnyRow),
      };
    },

    async isWorkspaceMember(workspaceId: string, userId: string) {
      const { count, error } = await client
        .from("workspace_members")
        .select("workspace_id", { head: true, count: "exact" })
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId);
      normalizeError(error, "MEMBERSHIP_CHECK_FAILED");
      return (count ?? 0) > 0;
    },

    async getWorkspaceMembership(workspaceId: string, userId: string) {
      const { data, error } = await client
        .from("workspace_members")
        .select("workspace_id, user_id, role, joined_at")
        .eq("workspace_id", workspaceId)
        .eq("user_id", userId)
        .maybeSingle();
      normalizeError(error, "MEMBERSHIP_GET_FAILED");
      return data ? toMembership(data as AnyRow) : undefined;
    },

    async isWorkspaceAdmin(workspaceId: string, userId: string) {
      const membership = await this.getWorkspaceMembership(workspaceId, userId);
      return membership?.role === "owner" || membership?.role === "admin";
    },

    async listMembershipsByWorkspace(workspaceId: string) {
      const { data, error } = await client
        .from("workspace_members")
        .select("workspace_id, user_id, role, joined_at")
        .eq("workspace_id", workspaceId);
      normalizeError(error, "MEMBERSHIP_LIST_FAILED");
      return (data ?? []).map((row) => toMembership(row as AnyRow));
    },

    async listMembershipsByUser(userId: string) {
      const { data, error } = await client
        .from("workspace_members")
        .select("workspace_id, user_id, role, joined_at")
        .eq("user_id", userId);
      normalizeError(error, "MEMBERSHIP_LIST_BY_USER_FAILED");
      return (data ?? []).map((row) => toMembership(row as AnyRow));
    },

    async listWorkspacesByUser(userId: string) {
      const memberships = await this.listMembershipsByUser(userId);
      if (memberships.length === 0) return [];

      const workspaceIds = memberships.map((membership) => membership.workspaceId);
      const { data, error } = await client
        .from("workspaces")
        .select("id, name")
        .in("id", workspaceIds);
      normalizeError(error, "WORKSPACE_LIST_BY_USER_FAILED");

      const workspaceNameById = new Map(
        ((data ?? []) as AnyRow[]).map((row) => [
          String(row.id),
          String(row.name),
        ])
      );

      return memberships
        .map((membership) => ({
          workspaceId: membership.workspaceId,
          workspaceName:
            workspaceNameById.get(membership.workspaceId) ?? membership.workspaceId,
          role: membership.role,
          joinedAt: membership.joinedAt,
        }))
        .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
    },

    async updateWorkspaceMembershipRole(input: UpdateWorkspaceMembershipRoleInput) {
      const actor = await this.getWorkspaceMembership(
        input.workspaceId,
        input.actorUserId
      );
      if (!actor || actor.role !== "owner") {
        throw new Error("FORBIDDEN");
      }

      const targetMembership = await this.getWorkspaceMembership(
        input.workspaceId,
        input.targetUserId
      );
      if (!targetMembership) return undefined;
      if (targetMembership.role === "owner") {
        throw new Error("INVALID_ROLE_CHANGE");
      }

      const { data, error } = await client
        .from("workspace_members")
        .update({ role: input.role })
        .eq("workspace_id", input.workspaceId)
        .eq("user_id", input.targetUserId)
        .select("workspace_id, user_id, role, joined_at")
        .maybeSingle();
      normalizeError(error, "MEMBERSHIP_ROLE_UPDATE_FAILED");
      if (!data) return undefined;

      await this.addAdminAuditLog({
        workspaceId: input.workspaceId,
        actorUserId: input.actorUserId,
        action: "membership_role_updated",
        targetUserId: input.targetUserId,
        payload: { role: input.role },
      });

      return toMembership(data as AnyRow);
    },

    async createDoc(input: CreateDocInput) {
      const now = new Date().toISOString();
      const { data, error } = await client
        .from("docs")
        .insert({
          workspace_id: input.workspaceId,
          title: input.title,
          content: input.content,
          template_key: input.templateKey,
          created_by: input.userId,
          updated_by: input.userId,
          updated_at: now,
        })
        .select(
          "id, workspace_id, title, content, template_key, created_by, updated_by, created_at, updated_at"
        )
        .single();
      normalizeError(error, "DOC_CREATE_FAILED");
      const ensuredDoc = requireRow(data, "DOC_CREATE_FAILED");

      await this.addActivityEvent({
        workspaceId: input.workspaceId,
        actorUserId: input.userId,
        type: "doc_updated",
      });

      return toDoc(ensuredDoc as AnyRow);
    },

    async listDocsByWorkspace(workspaceId: string) {
      const { data, error } = await client
        .from("docs")
        .select(
          "id, workspace_id, title, content, template_key, created_by, updated_by, created_at, updated_at"
        )
        .eq("workspace_id", workspaceId)
        .order("updated_at", { ascending: false });
      normalizeError(error, "DOC_LIST_FAILED");
      return (data ?? []).map((row) => toDoc(row as AnyRow));
    },

    async getDocById(workspaceId: string, docId: string) {
      const { data, error } = await client
        .from("docs")
        .select(
          "id, workspace_id, title, content, template_key, created_by, updated_by, created_at, updated_at"
        )
        .eq("workspace_id", workspaceId)
        .eq("id", docId)
        .maybeSingle();
      normalizeError(error, "DOC_GET_FAILED");
      return data ? toDoc(data as AnyRow) : undefined;
    },

    async updateDoc(input: UpdateDocInput) {
      const patch: Record<string, unknown> = {
        updated_by: input.userId,
        updated_at: new Date().toISOString(),
      };
      if (typeof input.title === "string") patch.title = input.title;
      if (typeof input.content === "string") patch.content = input.content;

      const { data, error } = await client
        .from("docs")
        .update(patch)
        .eq("workspace_id", input.workspaceId)
        .eq("id", input.docId)
        .select(
          "id, workspace_id, title, content, template_key, created_by, updated_by, created_at, updated_at"
        )
        .maybeSingle();
      normalizeError(error, "DOC_UPDATE_FAILED");
      if (!data) return undefined;

      await this.addActivityEvent({
        workspaceId: input.workspaceId,
        actorUserId: input.userId,
        type: "doc_updated",
      });

      return toDoc(data as AnyRow);
    },

    async deleteDoc(workspaceId: string, docId: string) {
      const { data, error } = await client
        .from("docs")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("id", docId)
        .select("id");
      normalizeError(error, "DOC_DELETE_FAILED");
      return (data ?? []).length > 0;
    },

    async createTask(input: CreateTaskInput) {
      const now = new Date().toISOString();
      const { data, error } = await client
        .from("tasks")
        .insert({
          workspace_id: input.workspaceId,
          title: input.title,
          description: input.description,
          status: "todo",
          assignee_id: input.assigneeId,
          priority: input.priority ?? "medium",
          difficulty: input.difficulty ?? 1,
          due_date: input.dueDate,
          checklist: input.checklist ?? [],
          repeat_rule: input.repeat ?? "none",
          sprint_key: input.sprintKey,
          is_blocked: input.isBlocked ?? false,
          blocked_reason: input.isBlocked ? input.blockedReason : null,
          sort_order: input.sortOrder,
          created_by: input.createdBy,
          updated_by: input.createdBy,
          updated_at: now,
        })
        .select(TASK_SELECT_FIELDS)
        .single();
      normalizeError(error, "TASK_CREATE_FAILED");
      return toTask(requireRow(data, "TASK_CREATE_FAILED") as AnyRow);
    },

    async listTasksByWorkspace(workspaceId: string, page?: TaskListPageInput) {
      let query = client
        .from("tasks")
        .select(TASK_SELECT_FIELDS)
        .eq("workspace_id", workspaceId)
        .order("sort_order", { ascending: true, nullsFirst: false })
        .order("created_at", { ascending: true });

      if (page) {
        const from = Math.max(0, page.offset);
        const to = from + Math.max(0, page.limit) - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;
      normalizeError(error, "TASK_LIST_FAILED");
      return (data ?? []).map((row) => toTask(row as AnyRow));
    },

    async countTasksByWorkspace(workspaceId: string) {
      const { count, error } = await client
        .from("tasks")
        .select("id", { count: "exact", head: true })
        .eq("workspace_id", workspaceId);
      normalizeError(error, "TASK_COUNT_FAILED");
      return count ?? 0;
    },

    async getTaskById(workspaceId: string, taskId: string) {
      const { data, error } = await client
        .from("tasks")
        .select(TASK_SELECT_FIELDS)
        .eq("workspace_id", workspaceId)
        .eq("id", taskId)
        .maybeSingle();
      normalizeError(error, "TASK_GET_FAILED");
      return data ? toTask(data as AnyRow) : undefined;
    },

    async updateTask(input: UpdateTaskInput) {
      const patch: Record<string, unknown> = {
        updated_by: input.userId,
        updated_at: new Date().toISOString(),
      };
      if (typeof input.title === "string") patch.title = input.title;
      if (typeof input.description === "string") patch.description = input.description;
      if (typeof input.status === "string") patch.status = input.status;
      if (typeof input.assigneeId === "string") patch.assignee_id = input.assigneeId;
      if (typeof input.priority === "string") patch.priority = input.priority;
      if (typeof input.dueDate === "string") patch.due_date = input.dueDate;
      if (typeof input.difficulty === "number") patch.difficulty = input.difficulty;
      if (Array.isArray(input.checklist)) patch.checklist = input.checklist;
      if (typeof input.repeat === "string") patch.repeat_rule = input.repeat;
      if (typeof input.sprintKey === "string") patch.sprint_key = input.sprintKey;
      if (typeof input.isBlocked === "boolean") {
        patch.is_blocked = input.isBlocked;
        if (!input.isBlocked) patch.blocked_reason = null;
      }
      if (typeof input.blockedReason === "string") {
        patch.blocked_reason = input.blockedReason;
      }
      if (typeof input.sortOrder === "number") patch.sort_order = input.sortOrder;

      const { data, error } = await client
        .from("tasks")
        .update(patch)
        .eq("workspace_id", input.workspaceId)
        .eq("id", input.taskId)
        .select(TASK_SELECT_FIELDS)
        .maybeSingle();
      normalizeError(error, "TASK_UPDATE_FAILED");
      if (!data) return undefined;

      if (input.status === "done") {
        await this.addActivityEvent({
          workspaceId: input.workspaceId,
          actorUserId: input.assigneeId ?? input.userId,
          type: "task_completed",
        });
      }

      return toTask(data as AnyRow);
    },

    async reorderTasks(input: ReorderTasksInput) {
      const { error } = await client.rpc("reorder_workspace_tasks", {
        p_workspace_id: input.workspaceId,
        p_ordered_task_ids: input.orderedTaskIds,
        p_actor_user_id: input.userId,
      });
      normalizeError(error, "TASK_REORDER_FAILED");

      return this.listTasksByWorkspace(input.workspaceId);
    },

    async deleteTask(workspaceId: string, taskId: string) {
      const { data, error } = await client
        .from("tasks")
        .delete()
        .eq("workspace_id", workspaceId)
        .eq("id", taskId)
        .select("id");
      normalizeError(error, "TASK_DELETE_FAILED");
      return (data ?? []).length > 0;
    },

    async createGoal(input: CreateGoalInput) {
      const { data, error } = await client
        .from("goals")
        .insert({
          workspace_id: input.workspaceId,
          title: input.title,
          description: input.description,
          target_date: input.targetDate,
          created_by: input.userId,
        })
        .select("id, workspace_id, title, description, target_date, created_by, created_at, updated_at")
        .single();
      normalizeError(error, "GOAL_CREATE_FAILED");
      return toGoal(requireRow(data, "GOAL_CREATE_FAILED") as AnyRow);
    },

    async listGoalsByWorkspace(workspaceId: string) {
      const { data, error } = await client
        .from("goals")
        .select("id, workspace_id, title, description, target_date, created_by, created_at, updated_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      normalizeError(error, "GOAL_LIST_FAILED");
      return (data ?? []).map((row) => toGoal(row as AnyRow));
    },

    async createKeyResult(input: CreateKeyResultInput) {
      const { data, error } = await client
        .from("goal_key_results")
        .insert({
          goal_id: input.goalId,
          workspace_id: input.workspaceId,
          title: input.title,
          metric: input.metric,
          target_value: input.targetValue,
          current_value: 0,
          progress: 0,
          updated_by: input.userId,
        })
        .select(
          "id, goal_id, workspace_id, title, metric, target_value, current_value, progress, updated_by, created_at, updated_at"
        )
        .maybeSingle();

      if (error && /foreign key|constraint/i.test(error.message)) {
        return undefined;
      }
      normalizeError(error, "KR_CREATE_FAILED");
      return data ? toKeyResult(data as AnyRow) : undefined;
    },

    async listKeyResultsByGoal(workspaceId: string, goalId: string) {
      const { data, error } = await client
        .from("goal_key_results")
        .select(
          "id, goal_id, workspace_id, title, metric, target_value, current_value, progress, updated_by, created_at, updated_at"
        )
        .eq("workspace_id", workspaceId)
        .eq("goal_id", goalId)
        .order("created_at", { ascending: true });
      normalizeError(error, "KR_LIST_FAILED");
      return (data ?? []).map((row) => toKeyResult(row as AnyRow));
    },

    async updateKeyResultProgress(input: UpdateKeyResultProgressInput) {
      const patch: Record<string, unknown> = {
        progress: Math.max(0, Math.min(100, input.progress)),
        updated_by: input.userId,
        updated_at: new Date().toISOString(),
      };
      if (typeof input.currentValue === "number") {
        patch.current_value = input.currentValue;
      }

      const { data, error } = await client
        .from("goal_key_results")
        .update(patch)
        .eq("workspace_id", input.workspaceId)
        .eq("id", input.keyResultId)
        .select(
          "id, goal_id, workspace_id, title, metric, target_value, current_value, progress, updated_by, created_at, updated_at"
        )
        .maybeSingle();
      normalizeError(error, "KR_UPDATE_FAILED");
      if (!data) return undefined;

      await this.addActivityEvent({
        workspaceId: input.workspaceId,
        actorUserId: input.userId,
        type: "goal_updated",
      });

      return toKeyResult(data as AnyRow);
    },

    async createPerformanceCycle(input: CreatePerformanceCycleInput) {
      const weights = normalizeWeights(input.weights);
      const { data, error } = await client
        .from("performance_cycles")
        .insert({
          workspace_id: input.workspaceId,
          title: input.title,
          period_start: input.periodStart,
          period_end: input.periodEnd,
          status: input.status ?? "draft",
          weights_json: weights,
          created_by: input.actorUserId,
          updated_at: new Date().toISOString(),
        })
        .select(
          "id, workspace_id, title, period_start, period_end, status, weights_json, created_by, created_at, updated_at"
        )
        .single();
      normalizeError(error, "PERFORMANCE_CYCLE_CREATE_FAILED");
      const cycle = toPerformanceCycle(
        requireRow(data, "PERFORMANCE_CYCLE_CREATE_FAILED") as AnyRow
      );

      await this.addAdminAuditLog({
        workspaceId: input.workspaceId,
        actorUserId: input.actorUserId,
        action: "performance_cycle_created",
        payload: { cycleId: cycle.id, title: cycle.title },
      });

      return cycle;
    },

    async listPerformanceCyclesByWorkspace(workspaceId: string) {
      const { data, error } = await client
        .from("performance_cycles")
        .select(
          "id, workspace_id, title, period_start, period_end, status, weights_json, created_by, created_at, updated_at"
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      normalizeError(error, "PERFORMANCE_CYCLE_LIST_FAILED");
      return (data ?? []).map((row) => toPerformanceCycle(row as AnyRow));
    },

    async getPerformanceCycleById(workspaceId: string, cycleId: string) {
      const { data, error } = await client
        .from("performance_cycles")
        .select(
          "id, workspace_id, title, period_start, period_end, status, weights_json, created_by, created_at, updated_at"
        )
        .eq("workspace_id", workspaceId)
        .eq("id", cycleId)
        .maybeSingle();
      normalizeError(error, "PERFORMANCE_CYCLE_GET_FAILED");
      return data ? toPerformanceCycle(data as AnyRow) : undefined;
    },

    async updatePerformanceCycle(input: UpdatePerformanceCycleInput) {
      const patch: Record<string, unknown> = {
        updated_at: new Date().toISOString(),
      };
      if (typeof input.title === "string") patch.title = input.title;
      if (typeof input.periodStart === "string") patch.period_start = input.periodStart;
      if (typeof input.periodEnd === "string") patch.period_end = input.periodEnd;
      if (typeof input.status === "string") patch.status = input.status;
      if (input.weights) patch.weights_json = normalizeWeights(input.weights);

      const { data, error } = await client
        .from("performance_cycles")
        .update(patch)
        .eq("workspace_id", input.workspaceId)
        .eq("id", input.cycleId)
        .select(
          "id, workspace_id, title, period_start, period_end, status, weights_json, created_by, created_at, updated_at"
        )
        .maybeSingle();
      normalizeError(error, "PERFORMANCE_CYCLE_UPDATE_FAILED");
      if (!data) return undefined;

      await this.addAdminAuditLog({
        workspaceId: input.workspaceId,
        actorUserId: input.actorUserId,
        action: "performance_cycle_updated",
        payload: { cycleId: input.cycleId },
      });

      return toPerformanceCycle(data as AnyRow);
    },

    async buildEvidencePack(
      workspaceId: string,
      cycleId: string,
      userId: string
    ): Promise<BuildEvidencePackResult | undefined> {
      const cycle = await this.getPerformanceCycleById(workspaceId, cycleId);
      if (!cycle) return undefined;

      const [memberRowsResult, taskRowsResult, docRowsResult, krRowsResult, eventRowsResult] =
        await Promise.all([
          client
            .from("workspace_members")
            .select("user_id")
            .eq("workspace_id", workspaceId),
          client
            .from("tasks")
            .select("assignee_id, difficulty, status, updated_at")
            .eq("workspace_id", workspaceId)
            .gte("updated_at", cycle.periodStart)
            .lte("updated_at", cycle.periodEnd),
          client
            .from("docs")
            .select("updated_by, updated_at")
            .eq("workspace_id", workspaceId)
            .gte("updated_at", cycle.periodStart)
            .lte("updated_at", cycle.periodEnd),
          client
            .from("goal_key_results")
            .select("updated_by, updated_at")
            .eq("workspace_id", workspaceId)
            .gte("updated_at", cycle.periodStart)
            .lte("updated_at", cycle.periodEnd),
          client
            .from("activity_events")
            .select("actor_user_id, event_type, created_at")
            .eq("workspace_id", workspaceId)
            .gte("created_at", cycle.periodStart)
            .lte("created_at", cycle.periodEnd),
        ]);

      normalizeError(memberRowsResult.error, "EVIDENCE_MEMBERS_FAILED");
      normalizeError(taskRowsResult.error, "EVIDENCE_TASKS_FAILED");
      normalizeError(docRowsResult.error, "EVIDENCE_DOCS_FAILED");
      normalizeError(krRowsResult.error, "EVIDENCE_KRS_FAILED");
      normalizeError(eventRowsResult.error, "EVIDENCE_EVENTS_FAILED");

      const memberIds = ((memberRowsResult.data ?? []) as AnyRow[]).map((row) =>
        String(row.user_id)
      );
      if (!memberIds.includes(userId)) return undefined;

      const tasks = (taskRowsResult.data ?? []) as AnyRow[];
      const docs = (docRowsResult.data ?? []) as AnyRow[];
      const krs = (krRowsResult.data ?? []) as AnyRow[];
      const events = (eventRowsResult.data ?? []) as AnyRow[];

      const rawByMember = memberIds.map((memberId) => {
        const execution = tasks
          .filter(
            (task) =>
              String(task.status) === "done" &&
              task.assignee_id &&
              String(task.assignee_id) === memberId
          )
          .reduce((sum, task) => sum + Number(task.difficulty ?? 1), 0);
        const docsScore = docs.filter((doc) => String(doc.updated_by) === memberId).length;
        const goalsScore = krs.filter((kr) => String(kr.updated_by) === memberId).length;
        const collaboration = events.filter(
          (event) =>
            String(event.actor_user_id) === memberId &&
            ["comment", "review", "blocker_resolved"].includes(
              String(event.event_type)
            )
        ).length;

        return {
          userId: memberId,
          raw: {
            execution,
            docs: docsScore,
            goals: goalsScore,
            collaboration,
          },
        };
      });

      const maxExecution = Math.max(1, ...rawByMember.map((item) => item.raw.execution));
      const maxDocs = Math.max(1, ...rawByMember.map((item) => item.raw.docs));
      const maxGoals = Math.max(1, ...rawByMember.map((item) => item.raw.goals));
      const maxCollab = Math.max(
        1,
        ...rawByMember.map((item) => item.raw.collaboration)
      );

      const selected = rawByMember.find((item) => item.userId === userId);
      if (!selected) return undefined;

      const normalized = {
        execution: Math.round((selected.raw.execution / maxExecution) * 10000) / 10000,
        docs: Math.round((selected.raw.docs / maxDocs) * 10000) / 10000,
        goals: Math.round((selected.raw.goals / maxGoals) * 10000) / 10000,
        collaboration:
          Math.round((selected.raw.collaboration / maxCollab) * 10000) / 10000,
      };

      const scorePreview =
        cycle.weights.execution * normalized.execution +
        cycle.weights.docs * normalized.docs +
        cycle.weights.goals * normalized.goals +
        cycle.weights.collaboration * normalized.collaboration;

      return {
        evidencePack: {
          periodStart: cycle.periodStart,
          periodEnd: cycle.periodEnd,
          raw: selected.raw,
          normalized,
          highlights: [
            `완료 난이도 점수 ${selected.raw.execution}`,
            `문서 업데이트 ${selected.raw.docs}건`,
            `목표/KR 업데이트 ${selected.raw.goals}건`,
            `협업 이벤트 ${selected.raw.collaboration}건`,
          ],
        },
        scorePreview: Math.round(scorePreview * 100) / 100,
      };
    },

    async getPerformanceReview(workspaceId: string, cycleId: string, userId: string) {
      const { data, error } = await client
        .from("performance_reviews")
        .select(
          "id, cycle_id, workspace_id, user_id, evidence_snapshot_json, score_preview, manager_note, final_rating, locked_at, updated_by, updated_at"
        )
        .eq("workspace_id", workspaceId)
        .eq("cycle_id", cycleId)
        .eq("user_id", userId)
        .maybeSingle();
      normalizeError(error, "PERFORMANCE_REVIEW_GET_FAILED");
      return data ? toPerformanceReview(data as AnyRow) : undefined;
    },

    async listPerformanceReviewsByCycle(workspaceId: string, cycleId: string) {
      const { data, error } = await client
        .from("performance_reviews")
        .select(
          "id, cycle_id, workspace_id, user_id, evidence_snapshot_json, score_preview, manager_note, final_rating, locked_at, updated_by, updated_at"
        )
        .eq("workspace_id", workspaceId)
        .eq("cycle_id", cycleId)
        .order("user_id", { ascending: true });
      normalizeError(error, "PERFORMANCE_REVIEW_LIST_FAILED");
      return (data ?? []).map((row) => toPerformanceReview(row as AnyRow));
    },

    async upsertPerformanceReview(input: UpsertPerformanceReviewInput) {
      const existing = await this.getPerformanceReview(
        input.workspaceId,
        input.cycleId,
        input.userId
      );
      if (existing?.lockedAt) {
        throw new Error("REVIEW_LOCKED");
      }

      const evidence = await this.buildEvidencePack(
        input.workspaceId,
        input.cycleId,
        input.userId
      );
      if (!evidence) return undefined;

      const patch = {
        cycle_id: input.cycleId,
        workspace_id: input.workspaceId,
        user_id: input.userId,
        evidence_snapshot_json: evidence.evidencePack,
        score_preview: evidence.scorePreview,
        manager_note: input.managerNote,
        final_rating: input.finalRating,
        locked_at: input.lock ? new Date().toISOString() : null,
        updated_by: input.updatedBy,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await client
        .from("performance_reviews")
        .upsert(patch, { onConflict: "cycle_id,user_id" })
        .select(
          "id, cycle_id, workspace_id, user_id, evidence_snapshot_json, score_preview, manager_note, final_rating, locked_at, updated_by, updated_at"
        )
        .single();
      normalizeError(error, "PERFORMANCE_REVIEW_UPSERT_FAILED");

      await this.addAdminAuditLog({
        workspaceId: input.workspaceId,
        actorUserId: input.updatedBy,
        action: existing ? "performance_review_updated" : "performance_review_created",
        targetUserId: input.userId,
        payload: { cycleId: input.cycleId, lock: Boolean(input.lock) },
      });

      return toPerformanceReview(requireRow(data, "PERFORMANCE_REVIEW_UPSERT_FAILED") as AnyRow);
    },

    async addAdminAuditLog(log: Omit<AdminAuditLog, "id" | "createdAt">) {
      const { error } = await client.from("admin_audit_logs").insert({
        workspace_id: log.workspaceId,
        actor_user_id: log.actorUserId,
        action: log.action,
        target_user_id: log.targetUserId ?? null,
        payload_json: log.payload,
      });
      normalizeError(error, "ADMIN_AUDIT_LOG_CREATE_FAILED");
    },

    async listAdminAuditLogs(workspaceId: string) {
      const { data, error } = await client
        .from("admin_audit_logs")
        .select("id, workspace_id, actor_user_id, action, target_user_id, payload_json, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      normalizeError(error, "ADMIN_AUDIT_LOG_LIST_FAILED");
      return ((data ?? []) as AnyRow[]).map((row) => ({
        id: String(row.id),
        workspaceId: String(row.workspace_id),
        actorUserId: String(row.actor_user_id),
        action: String(row.action),
        targetUserId: row.target_user_id ? String(row.target_user_id) : undefined,
        payload: (row.payload_json as Record<string, unknown>) ?? {},
        createdAt: String(row.created_at),
      }));
    },

    async addActivityEvent(event: Omit<ActivityEvent, "id" | "createdAt">) {
      const { error } = await client.from("activity_events").insert({
        workspace_id: event.workspaceId,
        actor_user_id: event.actorUserId,
        event_type: event.type,
      });
      normalizeError(error, "ACTIVITY_EVENT_CREATE_FAILED");
    },

    async getInsights(workspaceId: string, now = new Date()) {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      const dueUpper = new Date(now);
      dueUpper.setDate(now.getDate() + 3);

      const [doneCountResult, dueCountResult, taskRowsResult, docRowsResult, krRowsResult, eventRowsResult, membershipRowsResult] =
        await Promise.all([
          client
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .eq("status", "done")
            .gte("updated_at", weekAgo.toISOString()),
          client
            .from("tasks")
            .select("id", { count: "exact", head: true })
            .eq("workspace_id", workspaceId)
            .neq("status", "done")
            .not("due_date", "is", null)
            .gte("due_date", now.toISOString())
            .lte("due_date", dueUpper.toISOString()),
          client
            .from("tasks")
            .select("assignee_id, difficulty, status")
            .eq("workspace_id", workspaceId),
          client.from("docs").select("updated_by").eq("workspace_id", workspaceId),
          client
            .from("goal_key_results")
            .select("updated_by, progress")
            .eq("workspace_id", workspaceId),
          client
            .from("activity_events")
            .select("actor_user_id, event_type")
            .eq("workspace_id", workspaceId),
          client
            .from("workspace_members")
            .select("user_id")
            .eq("workspace_id", workspaceId),
        ]);

      normalizeError(doneCountResult.error, "INSIGHTS_TASK_DONE_FAILED");
      normalizeError(dueCountResult.error, "INSIGHTS_DUE_FAILED");
      normalizeError(taskRowsResult.error, "INSIGHTS_TASK_ROWS_FAILED");
      normalizeError(docRowsResult.error, "INSIGHTS_DOC_ROWS_FAILED");
      normalizeError(krRowsResult.error, "INSIGHTS_KR_ROWS_FAILED");
      normalizeError(eventRowsResult.error, "INSIGHTS_EVENT_ROWS_FAILED");
      normalizeError(membershipRowsResult.error, "INSIGHTS_MEMBERS_FAILED");

      const krRows = (krRowsResult.data ?? []) as AnyRow[];
      const goalAchievementRate =
        krRows.length === 0
          ? 0
          : Math.round(
              (krRows.reduce((sum, row) => sum + Number(row.progress ?? 0), 0) /
                krRows.length) *
                100
            ) / 100;

      const memberIds = new Set<string>(
        ((membershipRowsResult.data ?? []) as AnyRow[]).map((row) =>
          String(row.user_id)
        )
      );

      const tasks = (taskRowsResult.data ?? []) as AnyRow[];
      const docs = (docRowsResult.data ?? []) as AnyRow[];
      const events = (eventRowsResult.data ?? []) as AnyRow[];

      tasks.forEach((task) => {
        if (task.assignee_id) memberIds.add(String(task.assignee_id));
      });
      docs.forEach((doc) => memberIds.add(String(doc.updated_by)));
      krRows.forEach((kr) => memberIds.add(String(kr.updated_by)));
      events.forEach((event) => memberIds.add(String(event.actor_user_id)));

      const contribution = Array.from(memberIds)
        .map((userId) => {
          const taskScore = tasks
            .filter(
              (task) =>
                String(task.status) === "done" &&
                task.assignee_id &&
                String(task.assignee_id) === userId
            )
            .reduce((sum, task) => sum + Number(task.difficulty ?? 1), 0);
          const docsScore = docs.filter((doc) => String(doc.updated_by) === userId).length;
          const goalScore = krRows.filter((kr) => String(kr.updated_by) === userId).length;
          const collabScore = events.filter(
            (event) =>
              String(event.actor_user_id) === userId &&
              ["comment", "review", "blocker_resolved"].includes(
                String(event.event_type)
              )
          ).length;

          return { userId, taskScore, docsScore, goalScore, collabScore };
        })
        .filter(
          (item) =>
            item.taskScore > 0 ||
            item.docsScore > 0 ||
            item.goalScore > 0 ||
            item.collabScore > 0
        );

      const maxTask = Math.max(1, ...contribution.map((item) => item.taskScore));
      const maxDocs = Math.max(1, ...contribution.map((item) => item.docsScore));
      const maxGoal = Math.max(1, ...contribution.map((item) => item.goalScore));
      const maxCollab = Math.max(1, ...contribution.map((item) => item.collabScore));

      const normalizedContribution: InsightsSummary["contribution"] = contribution
        .map((item) => {
          const score =
            0.4 * (item.taskScore / maxTask) +
            0.2 * (item.docsScore / maxDocs) +
            0.25 * (item.goalScore / maxGoal) +
            0.15 * (item.collabScore / maxCollab);

          return {
            userId: item.userId,
            contributionScore: Math.round(score * 10000) / 10000,
            raw: {
              taskScore: item.taskScore,
              docsScore: item.docsScore,
              goalScore: item.goalScore,
              collabScore: item.collabScore,
            },
          };
        })
        .sort((a, b) => b.contributionScore - a.contributionScore);

      return {
        weeklyDoneTaskCount: doneCountResult.count ?? 0,
        goalAchievementRate,
        upcomingDueCount: dueCountResult.count ?? 0,
        contribution: normalizedContribution,
      };
    },
  };
}
