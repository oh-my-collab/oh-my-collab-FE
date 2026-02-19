type Role = "owner" | "member";

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
    counters: {
      ws: 0,
      doc: 0,
      task: 0,
      goal: 0,
      kr: 0,
      event: 0,
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
  listMembershipsByWorkspace: (
    workspaceId: string
  ) => MaybePromise<WorkspaceMembership[]>;
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

    listMembershipsByWorkspace(workspaceId) {
      return state.memberships.filter((m) => m.workspaceId === workspaceId);
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
      createdBy,
    }) {
      const timestamp = nowIso();
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
        createdBy,
        updatedBy: createdBy,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      state.tasks.push(task);
      return task;
    },

    listTasksByWorkspace(workspaceId) {
      return state.tasks.filter((task) => task.workspaceId === workspaceId);
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
