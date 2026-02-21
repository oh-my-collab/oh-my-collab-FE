type Role = "owner" | "admin" | "member";
type AdminManagedRole = "admin" | "member";

export type Workspace = {
  id: string;
  name: string;
  createdBy: string;
  createdAt: string;
};

export type WorkspaceMembership = {
  workspaceId: string;
  userId: string;
  role: Role;
  joinedAt: string;
};

export type UserWorkspaceSummary = {
  workspaceId: string;
  workspaceName: string;
  role: Role;
  joinedAt: string;
};

export type PerformanceCycleStatus = "draft" | "open" | "closed";

export type PerformanceWeights = {
  execution: number;
  docs: number;
  goals: number;
  collaboration: number;
};

export type PerformanceCycle = {
  id: string;
  workspaceId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  status: PerformanceCycleStatus;
  weights: PerformanceWeights;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type EvidenceMetricSet = {
  execution: number;
  docs: number;
  goals: number;
  collaboration: number;
};

export type PerformanceEvidenceSnapshot = {
  periodStart: string;
  periodEnd: string;
  raw: EvidenceMetricSet;
  normalized: EvidenceMetricSet;
  highlights: string[];
};

export type PerformanceReview = {
  id: string;
  cycleId: string;
  workspaceId: string;
  userId: string;
  evidenceSnapshot: PerformanceEvidenceSnapshot;
  scorePreview: number;
  managerNote?: string;
  finalRating?: string;
  lockedAt?: string;
  updatedBy: string;
  updatedAt: string;
};

export type AdminAuditLog = {
  id: string;
  workspaceId: string;
  actorUserId: string;
  action: string;
  targetUserId?: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

export type DocTemplateKey =
  | "meeting-note"
  | "weekly-report"
  | "retrospective"
  | "custom";

export type Doc = {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  templateKey: DocTemplateKey;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export type Task = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  assigneeId?: string;
  priority: TaskPriority;
  difficulty: number;
  dueDate?: string;
  checklist: string[];
  repeat: "none" | "daily" | "weekly";
  sprintKey?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  sortOrder?: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type Goal = {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  targetDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type KeyResult = {
  id: string;
  goalId: string;
  workspaceId: string;
  title: string;
  metric: string;
  targetValue: number;
  currentValue: number;
  progress: number;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type ActivityType =
  | "doc_updated"
  | "task_completed"
  | "goal_updated"
  | "comment"
  | "review"
  | "blocker_resolved";

export type ActivityEvent = {
  id: string;
  workspaceId: string;
  actorUserId: string;
  type: ActivityType;
  createdAt: string;
};

type StoreState = {
  workspaces: Workspace[];
  memberships: WorkspaceMembership[];
  docs: Doc[];
  tasks: Task[];
  goals: Goal[];
  keyResults: KeyResult[];
  activityEvents: ActivityEvent[];
  performanceCycles: PerformanceCycle[];
  performanceReviews: PerformanceReview[];
  adminAuditLogs: AdminAuditLog[];
  counters: Record<string, number>;
};

export type CreateWorkspaceInput = {
  name: string;
  ownerUserId: string;
};

export type CreateDocInput = {
  workspaceId: string;
  title: string;
  content: string;
  templateKey: DocTemplateKey;
  userId: string;
};

export type UpdateDocInput = {
  docId: string;
  workspaceId: string;
  title?: string;
  content?: string;
  userId: string;
};

export type CreateTaskInput = {
  workspaceId: string;
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDate?: string;
  difficulty?: number;
  checklist?: string[];
  repeat?: "none" | "daily" | "weekly";
  sprintKey?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  sortOrder?: number;
  createdBy: string;
};

export type UpdateTaskInput = {
  taskId: string;
  workspaceId: string;
  userId: string;
  title?: string;
  description?: string;
  status?: TaskStatus;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDate?: string;
  difficulty?: number;
  checklist?: string[];
  repeat?: "none" | "daily" | "weekly";
  sprintKey?: string;
  isBlocked?: boolean;
  blockedReason?: string;
  sortOrder?: number;
};

export type ReorderTasksInput = {
  workspaceId: string;
  orderedTaskIds: string[];
  userId: string;
};

export type CreateGoalInput = {
  workspaceId: string;
  title: string;
  description?: string;
  targetDate?: string;
  userId: string;
};

export type CreateKeyResultInput = {
  goalId: string;
  workspaceId: string;
  title: string;
  metric: string;
  targetValue: number;
  userId: string;
};

export type UpdateKeyResultProgressInput = {
  keyResultId: string;
  workspaceId: string;
  progress: number;
  currentValue?: number;
  userId: string;
};

export type CreatePerformanceCycleInput = {
  workspaceId: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  status?: PerformanceCycleStatus;
  weights: PerformanceWeights;
  actorUserId: string;
};

export type UpdatePerformanceCycleInput = {
  cycleId: string;
  workspaceId: string;
  title?: string;
  periodStart?: string;
  periodEnd?: string;
  status?: PerformanceCycleStatus;
  weights?: PerformanceWeights;
  actorUserId: string;
};

export type UpdateWorkspaceMembershipRoleInput = {
  workspaceId: string;
  targetUserId: string;
  role: AdminManagedRole;
  actorUserId: string;
};

export type UpsertPerformanceReviewInput = {
  workspaceId: string;
  cycleId: string;
  userId: string;
  managerNote?: string;
  finalRating?: string;
  lock?: boolean;
  updatedBy: string;
};

export type BuildEvidencePackResult = {
  evidencePack: PerformanceEvidenceSnapshot;
  scorePreview: number;
};

export type MaybePromise<T> = T | Promise<T>;

function createState(): StoreState {
  return {
    workspaces: [],
    memberships: [],
    docs: [],
    tasks: [],
    goals: [],
    keyResults: [],
    activityEvents: [],
    performanceCycles: [],
    performanceReviews: [],
    adminAuditLogs: [],
    counters: {
      ws: 0,
      doc: 0,
      task: 0,
      goal: 0,
      kr: 0,
      event: 0,
      cycle: 0,
      review: 0,
      audit: 0,
    },
  };
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: keyof StoreState["counters"], state: StoreState) {
  state.counters[prefix] += 1;
  return `${prefix}_${state.counters[prefix]}`;
}

function clampProgress(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function round(value: number, precision = 4) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

function normalizeWeights(input: PerformanceWeights): PerformanceWeights {
  const execution = Math.max(0, input.execution);
  const docs = Math.max(0, input.docs);
  const goals = Math.max(0, input.goals);
  const collaboration = Math.max(0, input.collaboration);
  const sum = execution + docs + goals + collaboration;

  if (sum === 0) {
    return {
      execution: 40,
      docs: 20,
      goals: 25,
      collaboration: 15,
    };
  }

  return {
    execution: round((execution / sum) * 100, 2),
    docs: round((docs / sum) * 100, 2),
    goals: round((goals / sum) * 100, 2),
    collaboration: round((collaboration / sum) * 100, 2),
  };
}

function inPeriod(iso: string, startIso: string, endIso: string) {
  const timestamp = new Date(iso).getTime();
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  return timestamp >= start && timestamp <= end;
}

export type InsightsSummary = {
  weeklyDoneTaskCount: number;
  goalAchievementRate: number;
  upcomingDueCount: number;
  contribution: Array<{
    userId: string;
    contributionScore: number;
    raw: {
      taskScore: number;
      docsScore: number;
      goalScore: number;
      collabScore: number;
    };
  }>;
};

export type CollabStore = {
  createWorkspaceWithOwner: (input: CreateWorkspaceInput) => MaybePromise<{
    workspace: Workspace;
    membership: WorkspaceMembership;
  }>;
  isWorkspaceMember: (workspaceId: string, userId: string) => MaybePromise<boolean>;
  getWorkspaceMembership: (
    workspaceId: string,
    userId: string
  ) => MaybePromise<WorkspaceMembership | undefined>;
  isWorkspaceAdmin: (workspaceId: string, userId: string) => MaybePromise<boolean>;
  listMembershipsByWorkspace: (
    workspaceId: string
  ) => MaybePromise<WorkspaceMembership[]>;
  listMembershipsByUser: (userId: string) => MaybePromise<WorkspaceMembership[]>;
  listWorkspacesByUser: (userId: string) => MaybePromise<UserWorkspaceSummary[]>;
  updateWorkspaceMembershipRole: (
    input: UpdateWorkspaceMembershipRoleInput
  ) => MaybePromise<WorkspaceMembership | undefined>;
  createDoc: (input: CreateDocInput) => MaybePromise<Doc>;
  listDocsByWorkspace: (workspaceId: string) => MaybePromise<Doc[]>;
  getDocById: (
    workspaceId: string,
    docId: string
  ) => MaybePromise<Doc | undefined>;
  updateDoc: (input: UpdateDocInput) => MaybePromise<Doc | undefined>;
  deleteDoc: (workspaceId: string, docId: string) => MaybePromise<boolean>;
  createTask: (input: CreateTaskInput) => MaybePromise<Task>;
  listTasksByWorkspace: (workspaceId: string) => MaybePromise<Task[]>;
  getTaskById: (
    workspaceId: string,
    taskId: string
  ) => MaybePromise<Task | undefined>;
  updateTask: (input: UpdateTaskInput) => MaybePromise<Task | undefined>;
  reorderTasks: (input: ReorderTasksInput) => MaybePromise<Task[]>;
  deleteTask: (workspaceId: string, taskId: string) => MaybePromise<boolean>;
  createGoal: (input: CreateGoalInput) => MaybePromise<Goal>;
  listGoalsByWorkspace: (workspaceId: string) => MaybePromise<Goal[]>;
  createKeyResult: (
    input: CreateKeyResultInput
  ) => MaybePromise<KeyResult | undefined>;
  listKeyResultsByGoal: (
    workspaceId: string,
    goalId: string
  ) => MaybePromise<KeyResult[]>;
  updateKeyResultProgress: (
    input: UpdateKeyResultProgressInput
  ) => MaybePromise<KeyResult | undefined>;
  createPerformanceCycle: (
    input: CreatePerformanceCycleInput
  ) => MaybePromise<PerformanceCycle>;
  listPerformanceCyclesByWorkspace: (
    workspaceId: string
  ) => MaybePromise<PerformanceCycle[]>;
  getPerformanceCycleById: (
    workspaceId: string,
    cycleId: string
  ) => MaybePromise<PerformanceCycle | undefined>;
  updatePerformanceCycle: (
    input: UpdatePerformanceCycleInput
  ) => MaybePromise<PerformanceCycle | undefined>;
  buildEvidencePack: (
    workspaceId: string,
    cycleId: string,
    userId: string
  ) => MaybePromise<BuildEvidencePackResult | undefined>;
  getPerformanceReview: (
    workspaceId: string,
    cycleId: string,
    userId: string
  ) => MaybePromise<PerformanceReview | undefined>;
  listPerformanceReviewsByCycle: (
    workspaceId: string,
    cycleId: string
  ) => MaybePromise<PerformanceReview[]>;
  upsertPerformanceReview: (
    input: UpsertPerformanceReviewInput
  ) => MaybePromise<PerformanceReview | undefined>;
  addAdminAuditLog: (
    log: Omit<AdminAuditLog, "id" | "createdAt">
  ) => MaybePromise<void>;
  listAdminAuditLogs: (workspaceId: string) => MaybePromise<AdminAuditLog[]>;
  addActivityEvent: (
    event: Omit<ActivityEvent, "id" | "createdAt">
  ) => MaybePromise<void>;
  getInsights: (workspaceId: string, now?: Date) => MaybePromise<InsightsSummary>;
};

export function createInMemoryCollabStore(
  seedState?: Partial<StoreState>
): CollabStore {
  const state = {
    ...createState(),
    ...seedState,
  } as StoreState;

  const addActivityEvent: CollabStore["addActivityEvent"] = (event) => {
    state.activityEvents.push({
      id: makeId("event", state),
      createdAt: nowIso(),
      ...event,
    });
  };

  const addAdminAuditLog: CollabStore["addAdminAuditLog"] = (log) => {
    state.adminAuditLogs.push({
      id: makeId("audit", state),
      createdAt: nowIso(),
      ...log,
    });
  };

  const findWorkspaceMembership = (workspaceId: string, userId: string) =>
    state.memberships.find(
      (membership) =>
        membership.workspaceId === workspaceId && membership.userId === userId
    );

  const getWorkspaceMembership: CollabStore["getWorkspaceMembership"] = (
    workspaceId,
    userId
  ) => findWorkspaceMembership(workspaceId, userId);

  const isWorkspaceAdmin: CollabStore["isWorkspaceAdmin"] = (
    workspaceId,
    userId
  ) => {
    const membership = findWorkspaceMembership(workspaceId, userId);
    return membership?.role === "owner" || membership?.role === "admin";
  };

  const resolveEvidenceByMember = (workspaceId: string, cycle: PerformanceCycle) => {
    const members = state.memberships.filter(
      (membership) => membership.workspaceId === workspaceId
    );

    const rawByMember = members.map((membership) => {
      const userId = membership.userId;

      const execution = state.tasks
        .filter(
          (task) =>
            task.workspaceId === workspaceId &&
            task.status === "done" &&
            task.assigneeId === userId &&
            inPeriod(task.updatedAt, cycle.periodStart, cycle.periodEnd)
        )
        .reduce((sum, task) => sum + Math.max(1, task.difficulty), 0);

      const docs = state.docs.filter(
        (doc) =>
          doc.workspaceId === workspaceId &&
          doc.updatedBy === userId &&
          inPeriod(doc.updatedAt, cycle.periodStart, cycle.periodEnd)
      ).length;

      const goals = state.keyResults.filter(
        (kr) =>
          kr.workspaceId === workspaceId &&
          kr.updatedBy === userId &&
          inPeriod(kr.updatedAt, cycle.periodStart, cycle.periodEnd)
      ).length;

      const collaboration = state.activityEvents.filter(
        (event) =>
          event.workspaceId === workspaceId &&
          event.actorUserId === userId &&
          ["comment", "review", "blocker_resolved"].includes(event.type) &&
          inPeriod(event.createdAt, cycle.periodStart, cycle.periodEnd)
      ).length;

      return {
        userId,
        raw: {
          execution,
          docs,
          goals,
          collaboration,
        },
      };
    });

    const maxExecution = Math.max(1, ...rawByMember.map((item) => item.raw.execution));
    const maxDocs = Math.max(1, ...rawByMember.map((item) => item.raw.docs));
    const maxGoals = Math.max(1, ...rawByMember.map((item) => item.raw.goals));
    const maxCollaboration = Math.max(
      1,
      ...rawByMember.map((item) => item.raw.collaboration)
    );

    return rawByMember.map((item) => ({
      userId: item.userId,
      raw: item.raw,
      normalized: {
        execution: round(item.raw.execution / maxExecution, 4),
        docs: round(item.raw.docs / maxDocs, 4),
        goals: round(item.raw.goals / maxGoals, 4),
        collaboration: round(item.raw.collaboration / maxCollaboration, 4),
      },
    }));
  };

  const buildEvidencePackInternal = (
    workspaceId: string,
    cycleId: string,
    userId: string
  ): BuildEvidencePackResult | undefined => {
    const cycle = state.performanceCycles.find(
      (item) => item.workspaceId === workspaceId && item.id === cycleId
    );
    if (!cycle) return undefined;

    const evidenceByMember = resolveEvidenceByMember(workspaceId, cycle);
    const matched = evidenceByMember.find((item) => item.userId === userId);
    if (!matched) return undefined;

    const scorePreview =
      cycle.weights.execution * matched.normalized.execution +
      cycle.weights.docs * matched.normalized.docs +
      cycle.weights.goals * matched.normalized.goals +
      cycle.weights.collaboration * matched.normalized.collaboration;

    return {
      evidencePack: {
        periodStart: cycle.periodStart,
        periodEnd: cycle.periodEnd,
        raw: matched.raw,
        normalized: matched.normalized,
        highlights: [
          `완료 난이도 점수 ${matched.raw.execution}`,
          `문서 업데이트 ${matched.raw.docs}건`,
          `목표/KR 업데이트 ${matched.raw.goals}건`,
          `협업 이벤트 ${matched.raw.collaboration}건`,
        ],
      },
      scorePreview: round(scorePreview, 2),
    };
  };

  return {
    createWorkspaceWithOwner({ name, ownerUserId }) {
      const timestamp = nowIso();
      const workspace: Workspace = {
        id: makeId("ws", state),
        name,
        createdBy: ownerUserId,
        createdAt: timestamp,
      };
      const membership: WorkspaceMembership = {
        workspaceId: workspace.id,
        userId: ownerUserId,
        role: "owner",
        joinedAt: timestamp,
      };

      state.workspaces.push(workspace);
      state.memberships.push(membership);

      return { workspace, membership };
    },

    isWorkspaceMember(workspaceId, userId) {
      return state.memberships.some(
        (m) => m.workspaceId === workspaceId && m.userId === userId
      );
    },

    getWorkspaceMembership,

    isWorkspaceAdmin,

    listMembershipsByWorkspace(workspaceId) {
      return state.memberships.filter((m) => m.workspaceId === workspaceId);
    },

    listMembershipsByUser(userId) {
      return state.memberships.filter((m) => m.userId === userId);
    },

    listWorkspacesByUser(userId) {
      return state.memberships
        .filter((membership) => membership.userId === userId)
        .map((membership) => {
          const workspace = state.workspaces.find(
            (item) => item.id === membership.workspaceId
          );
          if (!workspace) return undefined;
          return {
            workspaceId: membership.workspaceId,
            workspaceName: workspace.name,
            role: membership.role,
            joinedAt: membership.joinedAt,
          };
        })
        .filter((item): item is UserWorkspaceSummary => Boolean(item))
        .sort((a, b) => a.joinedAt.localeCompare(b.joinedAt));
    },

    updateWorkspaceMembershipRole({
      workspaceId,
      targetUserId,
      role,
      actorUserId,
    }) {
      const actorMembership = findWorkspaceMembership(workspaceId, actorUserId);
      if (!actorMembership || actorMembership.role !== "owner") {
        throw new Error("FORBIDDEN");
      }

      const membership = findWorkspaceMembership(workspaceId, targetUserId);
      if (!membership) return undefined;
      if (membership.role === "owner") {
        throw new Error("INVALID_ROLE_CHANGE");
      }

      membership.role = role;

      addAdminAuditLog({
        workspaceId,
        actorUserId,
        action: "membership_role_updated",
        targetUserId,
        payload: { role },
      });

      return membership;
    },

    createDoc({ workspaceId, title, content, templateKey, userId }) {
      const timestamp = nowIso();
      const doc: Doc = {
        id: makeId("doc", state),
        workspaceId,
        title,
        content,
        templateKey,
        createdBy: userId,
        updatedBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      state.docs.push(doc);
      addActivityEvent({ workspaceId, actorUserId: userId, type: "doc_updated" });
      return doc;
    },

    listDocsByWorkspace(workspaceId) {
      return state.docs.filter((doc) => doc.workspaceId === workspaceId);
    },

    getDocById(workspaceId, docId) {
      return state.docs.find(
        (doc) => doc.workspaceId === workspaceId && doc.id === docId
      );
    },

    updateDoc({ docId, workspaceId, title, content, userId }) {
      const doc = state.docs.find(
        (item) => item.id === docId && item.workspaceId === workspaceId
      );

      if (!doc) return undefined;

      if (typeof title === "string") doc.title = title;
      if (typeof content === "string") doc.content = content;
      doc.updatedBy = userId;
      doc.updatedAt = nowIso();

      addActivityEvent({ workspaceId, actorUserId: userId, type: "doc_updated" });
      return doc;
    },

    deleteDoc(workspaceId, docId) {
      const before = state.docs.length;
      state.docs = state.docs.filter(
        (doc) => !(doc.workspaceId === workspaceId && doc.id === docId)
      );
      return before !== state.docs.length;
    },

    createTask({
      workspaceId,
      title,
      description,
      assigneeId,
      priority = "medium",
      dueDate,
      difficulty = 1,
      checklist = [],
      repeat = "none",
      sprintKey,
      isBlocked = false,
      blockedReason,
      sortOrder,
      createdBy,
    }) {
      const timestamp = nowIso();
      const maxSortOrder = state.tasks
        .filter((item) => item.workspaceId === workspaceId)
        .reduce((max, item) => Math.max(max, item.sortOrder ?? 0), 0);
      const task: Task = {
        id: makeId("task", state),
        workspaceId,
        title,
        description,
        status: "todo",
        assigneeId,
        priority,
        difficulty,
        dueDate,
        checklist,
        repeat,
        sprintKey,
        isBlocked,
        blockedReason: isBlocked ? blockedReason : undefined,
        sortOrder: typeof sortOrder === "number" ? sortOrder : maxSortOrder + 100,
        createdBy,
        updatedBy: createdBy,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      state.tasks.push(task);
      return task;
    },

    listTasksByWorkspace(workspaceId) {
      return state.tasks
        .filter((task) => task.workspaceId === workspaceId)
        .sort((a, b) => {
          const sortOrderDiff = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
          if (sortOrderDiff !== 0) return sortOrderDiff;
          return a.createdAt.localeCompare(b.createdAt);
        });
    },

    getTaskById(workspaceId, taskId) {
      return state.tasks.find(
        (task) => task.workspaceId === workspaceId && task.id === taskId
      );
    },

    updateTask({
      taskId,
      workspaceId,
      userId,
      title,
      description,
      status,
      assigneeId,
      priority,
      dueDate,
      difficulty,
      checklist,
      repeat,
      sprintKey,
      isBlocked,
      blockedReason,
      sortOrder,
    }) {
      const task = state.tasks.find(
        (item) => item.id === taskId && item.workspaceId === workspaceId
      );

      if (!task) return undefined;

      if (typeof title === "string") task.title = title;
      if (typeof description === "string") task.description = description;
      if (typeof status === "string") task.status = status;
      if (typeof assigneeId === "string") task.assigneeId = assigneeId;
      if (typeof priority === "string") task.priority = priority;
      if (typeof dueDate === "string") task.dueDate = dueDate;
      if (typeof difficulty === "number") task.difficulty = difficulty;
      if (Array.isArray(checklist)) task.checklist = checklist;
      if (typeof repeat === "string") task.repeat = repeat;
      if (typeof sprintKey === "string") task.sprintKey = sprintKey;
      if (typeof isBlocked === "boolean") {
        task.isBlocked = isBlocked;
        if (!isBlocked) task.blockedReason = undefined;
      }
      if (typeof blockedReason === "string") task.blockedReason = blockedReason;
      if (typeof sortOrder === "number") task.sortOrder = sortOrder;
      task.updatedBy = userId;
      task.updatedAt = nowIso();

      if (status === "done") {
        addActivityEvent({
          workspaceId,
          actorUserId: assigneeId ?? userId,
          type: "task_completed",
        });
      }

      return task;
    },

    reorderTasks({ workspaceId, orderedTaskIds, userId }) {
      const orderById = new Map(
        orderedTaskIds.map((taskId, index) => [taskId, (index + 1) * 100])
      );

      state.tasks.forEach((task) => {
        if (task.workspaceId !== workspaceId) return;
        const ordered = orderById.get(task.id);
        if (typeof ordered === "number") {
          task.sortOrder = ordered;
          task.updatedBy = userId;
          task.updatedAt = nowIso();
        }
      });

      return this.listTasksByWorkspace(workspaceId);
    },

    deleteTask(workspaceId, taskId) {
      const before = state.tasks.length;
      state.tasks = state.tasks.filter(
        (task) => !(task.workspaceId === workspaceId && task.id === taskId)
      );
      return before !== state.tasks.length;
    },

    createGoal({ workspaceId, title, description, targetDate, userId }) {
      const timestamp = nowIso();
      const goal: Goal = {
        id: makeId("goal", state),
        workspaceId,
        title,
        description,
        targetDate,
        createdBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      state.goals.push(goal);
      return goal;
    },

    listGoalsByWorkspace(workspaceId) {
      return state.goals.filter((goal) => goal.workspaceId === workspaceId);
    },

    createKeyResult({ goalId, workspaceId, title, metric, targetValue, userId }) {
      const goal = state.goals.find(
        (item) => item.id === goalId && item.workspaceId === workspaceId
      );
      if (!goal) return undefined;

      const timestamp = nowIso();
      const kr: KeyResult = {
        id: makeId("kr", state),
        goalId,
        workspaceId,
        title,
        metric,
        targetValue,
        currentValue: 0,
        progress: 0,
        updatedBy: userId,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      state.keyResults.push(kr);
      return kr;
    },

    listKeyResultsByGoal(workspaceId, goalId) {
      return state.keyResults.filter(
        (kr) => kr.workspaceId === workspaceId && kr.goalId === goalId
      );
    },

    updateKeyResultProgress({
      keyResultId,
      workspaceId,
      progress,
      currentValue,
      userId,
    }) {
      const keyResult = state.keyResults.find(
        (kr) => kr.id === keyResultId && kr.workspaceId === workspaceId
      );
      if (!keyResult) return undefined;

      keyResult.progress = clampProgress(progress);
      if (typeof currentValue === "number") {
        keyResult.currentValue = currentValue;
      }
      keyResult.updatedBy = userId;
      keyResult.updatedAt = nowIso();

      addActivityEvent({ workspaceId, actorUserId: userId, type: "goal_updated" });
      return keyResult;
    },

    createPerformanceCycle({
      workspaceId,
      title,
      periodStart,
      periodEnd,
      status = "draft",
      weights,
      actorUserId,
    }) {
      const cycle: PerformanceCycle = {
        id: makeId("cycle", state),
        workspaceId,
        title,
        periodStart,
        periodEnd,
        status,
        weights: normalizeWeights(weights),
        createdBy: actorUserId,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      state.performanceCycles.push(cycle);

      addAdminAuditLog({
        workspaceId,
        actorUserId,
        action: "performance_cycle_created",
        payload: { cycleId: cycle.id, title: cycle.title },
      });

      return cycle;
    },

    listPerformanceCyclesByWorkspace(workspaceId) {
      return state.performanceCycles
        .filter((cycle) => cycle.workspaceId === workspaceId)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    },

    getPerformanceCycleById(workspaceId, cycleId) {
      return state.performanceCycles.find(
        (cycle) => cycle.workspaceId === workspaceId && cycle.id === cycleId
      );
    },

    updatePerformanceCycle({
      cycleId,
      workspaceId,
      title,
      periodStart,
      periodEnd,
      status,
      weights,
      actorUserId,
    }) {
      const cycle = state.performanceCycles.find(
        (item) => item.workspaceId === workspaceId && item.id === cycleId
      );
      if (!cycle) return undefined;

      if (typeof title === "string") cycle.title = title;
      if (typeof periodStart === "string") cycle.periodStart = periodStart;
      if (typeof periodEnd === "string") cycle.periodEnd = periodEnd;
      if (typeof status === "string") cycle.status = status;
      if (weights) cycle.weights = normalizeWeights(weights);
      cycle.updatedAt = nowIso();

      addAdminAuditLog({
        workspaceId,
        actorUserId,
        action: "performance_cycle_updated",
        payload: { cycleId },
      });

      return cycle;
    },

    buildEvidencePack: buildEvidencePackInternal,

    getPerformanceReview(workspaceId, cycleId, userId) {
      return state.performanceReviews.find(
        (review) =>
          review.workspaceId === workspaceId &&
          review.cycleId === cycleId &&
          review.userId === userId
      );
    },

    listPerformanceReviewsByCycle(workspaceId, cycleId) {
      return state.performanceReviews
        .filter(
          (review) =>
            review.workspaceId === workspaceId && review.cycleId === cycleId
        )
        .sort((a, b) => a.userId.localeCompare(b.userId));
    },

    upsertPerformanceReview({
      workspaceId,
      cycleId,
      userId,
      managerNote,
      finalRating,
      lock,
      updatedBy,
    }) {
      const evidence = buildEvidencePackInternal(workspaceId, cycleId, userId);
      if (!evidence) return undefined;

      const existing = state.performanceReviews.find(
        (review) =>
          review.workspaceId === workspaceId &&
          review.cycleId === cycleId &&
          review.userId === userId
      );

      if (existing?.lockedAt) {
        throw new Error("REVIEW_LOCKED");
      }

      if (existing) {
        if (typeof managerNote === "string") existing.managerNote = managerNote;
        if (typeof finalRating === "string") existing.finalRating = finalRating;
        if (lock) existing.lockedAt = nowIso();
        existing.evidenceSnapshot = evidence.evidencePack;
        existing.scorePreview = evidence.scorePreview;
        existing.updatedBy = updatedBy;
        existing.updatedAt = nowIso();

        addAdminAuditLog({
          workspaceId,
          actorUserId: updatedBy,
          action: "performance_review_updated",
          targetUserId: userId,
          payload: { cycleId, lock: Boolean(lock) },
        });
        return existing;
      }

      const created: PerformanceReview = {
        id: makeId("review", state),
        cycleId,
        workspaceId,
        userId,
        evidenceSnapshot: evidence.evidencePack,
        scorePreview: evidence.scorePreview,
        managerNote,
        finalRating,
        lockedAt: lock ? nowIso() : undefined,
        updatedBy,
        updatedAt: nowIso(),
      };
      state.performanceReviews.push(created);

      addAdminAuditLog({
        workspaceId,
        actorUserId: updatedBy,
        action: "performance_review_created",
        targetUserId: userId,
        payload: { cycleId, lock: Boolean(lock) },
      });

      return created;
    },

    addAdminAuditLog,

    listAdminAuditLogs(workspaceId) {
      return state.adminAuditLogs.filter((log) => log.workspaceId === workspaceId);
    },

    addActivityEvent,

    getInsights(workspaceId, now = new Date()) {
      const workspaceTasks = state.tasks.filter(
        (task) => task.workspaceId === workspaceId
      );
      const workspaceGoals = state.goals.filter(
        (goal) => goal.workspaceId === workspaceId
      );
      const workspaceKrs = state.keyResults.filter(
        (kr) => kr.workspaceId === workspaceId
      );
      const workspaceDocs = state.docs.filter((doc) => doc.workspaceId === workspaceId);
      const workspaceEvents = state.activityEvents.filter(
        (event) => event.workspaceId === workspaceId
      );

      const oneWeekAgo = new Date(now);
      oneWeekAgo.setDate(now.getDate() - 7);

      const weeklyDoneTaskCount = workspaceTasks.filter(
        (task) =>
          task.status === "done" && new Date(task.updatedAt).getTime() >= oneWeekAgo.getTime()
      ).length;

      const goalAchievementRate =
        workspaceKrs.length === 0
          ? 0
          : Math.round(
              (workspaceKrs.reduce((acc, kr) => acc + kr.progress, 0) /
                workspaceKrs.length) *
                100
            ) / 100;

      const upcomingDueCount = workspaceTasks.filter((task) => {
        if (!task.dueDate || task.status === "done") return false;
        const due = new Date(task.dueDate);
        const diff = due.getTime() - now.getTime();
        const dayMs = 24 * 60 * 60 * 1000;
        return diff >= 0 && diff <= 3 * dayMs;
      }).length;

      const memberIds = new Set(
        state.memberships
          .filter((membership) => membership.workspaceId === workspaceId)
          .map((membership) => membership.userId)
      );

      workspaceTasks.forEach((task) => {
        if (task.assigneeId) memberIds.add(task.assigneeId);
      });
      workspaceDocs.forEach((doc) => memberIds.add(doc.updatedBy));
      workspaceKrs.forEach((kr) => memberIds.add(kr.updatedBy));
      workspaceEvents.forEach((event) => memberIds.add(event.actorUserId));

      const rawByMember = Array.from(memberIds).map((userId) => {
        const taskScore = workspaceTasks
          .filter((task) => task.status === "done" && task.assigneeId === userId)
          .reduce((sum, task) => sum + task.difficulty, 0);

        const docsScore = workspaceDocs.filter((doc) => doc.updatedBy === userId).length;
        const goalScore = workspaceKrs.filter((kr) => kr.updatedBy === userId).length;
        const collabScore = workspaceEvents.filter(
          (event) =>
            event.actorUserId === userId &&
            (event.type === "comment" ||
              event.type === "review" ||
              event.type === "blocker_resolved")
        ).length;

        return { userId, taskScore, docsScore, goalScore, collabScore };
      });

      const maxTask = Math.max(1, ...rawByMember.map((item) => item.taskScore));
      const maxDocs = Math.max(1, ...rawByMember.map((item) => item.docsScore));
      const maxGoal = Math.max(1, ...rawByMember.map((item) => item.goalScore));
      const maxCollab = Math.max(1, ...rawByMember.map((item) => item.collabScore));

      const contribution = rawByMember
        .map((item) => {
          const normalizedTask = item.taskScore / maxTask;
          const normalizedDocs = item.docsScore / maxDocs;
          const normalizedGoal = item.goalScore / maxGoal;
          const normalizedCollab = item.collabScore / maxCollab;

          const contributionScore =
            0.4 * normalizedTask +
            0.2 * normalizedDocs +
            0.25 * normalizedGoal +
            0.15 * normalizedCollab;

          return {
            userId: item.userId,
            contributionScore: Math.round(contributionScore * 10000) / 10000,
            raw: {
              taskScore: item.taskScore,
              docsScore: item.docsScore,
              goalScore: item.goalScore,
              collabScore: item.collabScore,
            },
          };
        })
        .sort((a, b) => b.contributionScore - a.contributionScore);

      const _ = workspaceGoals;
      void _;

      return {
        weeklyDoneTaskCount,
        goalAchievementRate,
        upcomingDueCount,
        contribution,
      };
    },
  };
}

declare global {
  var __collabStore: CollabStore | undefined;
}

export const collabStore =
  globalThis.__collabStore ?? createInMemoryCollabStore();

if (process.env.NODE_ENV !== "production") {
  globalThis.__collabStore = collabStore;
}
