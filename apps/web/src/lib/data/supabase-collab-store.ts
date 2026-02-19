import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  ActivityEvent,
  CollabStore,
  CreateDocInput,
  CreateGoalInput,
  CreateKeyResultInput,
  CreateTaskInput,
  CreateWorkspaceInput,
  Doc,
  Goal,
  InsightsSummary,
  KeyResult,
  Task,
  UpdateDocInput,
  UpdateKeyResultProgressInput,
  UpdateTaskInput,
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
    createdBy: String(row.created_by),
    updatedBy: String(row.updated_by),
    createdAt: String(row.created_at),
    updatedAt: String(row.updated_at),
  };
}

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

    async listMembershipsByWorkspace(workspaceId: string) {
      const { data, error } = await client
        .from("workspace_members")
        .select("workspace_id, user_id, role, joined_at")
        .eq("workspace_id", workspaceId);
      normalizeError(error, "MEMBERSHIP_LIST_FAILED");
      return (data ?? []).map((row) => toMembership(row as AnyRow));
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
          created_by: input.createdBy,
          updated_by: input.createdBy,
          updated_at: now,
        })
        .select(
          "id, workspace_id, title, description, status, assignee_id, priority, difficulty, due_date, checklist, repeat_rule, created_by, updated_by, created_at, updated_at"
        )
        .single();
      normalizeError(error, "TASK_CREATE_FAILED");
      return toTask(requireRow(data, "TASK_CREATE_FAILED") as AnyRow);
    },

    async listTasksByWorkspace(workspaceId: string) {
      const { data, error } = await client
        .from("tasks")
        .select(
          "id, workspace_id, title, description, status, assignee_id, priority, difficulty, due_date, checklist, repeat_rule, created_by, updated_by, created_at, updated_at"
        )
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false });
      normalizeError(error, "TASK_LIST_FAILED");
      return (data ?? []).map((row) => toTask(row as AnyRow));
    },

    async getTaskById(workspaceId: string, taskId: string) {
      const { data, error } = await client
        .from("tasks")
        .select(
          "id, workspace_id, title, description, status, assignee_id, priority, difficulty, due_date, checklist, repeat_rule, created_by, updated_by, created_at, updated_at"
        )
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

      const { data, error } = await client
        .from("tasks")
        .update(patch)
        .eq("workspace_id", input.workspaceId)
        .eq("id", input.taskId)
        .select(
          "id, workspace_id, title, description, status, assignee_id, priority, difficulty, due_date, checklist, repeat_rule, created_by, updated_by, created_at, updated_at"
        )
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
