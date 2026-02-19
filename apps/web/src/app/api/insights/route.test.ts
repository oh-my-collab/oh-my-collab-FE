import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createInsightsHandlers } from "./route";

describe("insights api", () => {
  it("returns dashboard summary and contribution details", async () => {
    const store = createInMemoryCollabStore();
    const ws = store.createWorkspaceWithOwner({
      name: "Insights Team",
      ownerUserId: "user-a",
    }).workspace;

    const task = store.createTask({
      workspaceId: ws.id,
      title: "Ship API",
      assigneeId: "user-a",
      difficulty: 2,
      createdBy: "user-a",
    });
    store.updateTask({
      taskId: task.id,
      workspaceId: ws.id,
      userId: "user-a",
      assigneeId: "user-a",
      status: "done",
    });
    store.createDoc({
      workspaceId: ws.id,
      title: "Weekly notes",
      content: "done",
      templateKey: "weekly-report",
      userId: "user-a",
    });

    const goal = store.createGoal({
      workspaceId: ws.id,
      title: "Beta",
      userId: "user-a",
    });
    const kr = store.createKeyResult({
      goalId: goal.id,
      workspaceId: ws.id,
      title: "Completion",
      metric: "%",
      targetValue: 100,
      userId: "user-a",
    });
    if (!kr) throw new Error("kr should exist");
    store.updateKeyResultProgress({
      keyResultId: kr.id,
      workspaceId: ws.id,
      progress: 60,
      currentValue: 60,
      userId: "user-a",
    });
    store.addActivityEvent({
      workspaceId: ws.id,
      actorUserId: "user-a",
      type: "comment",
    });

    const { GET } = createInsightsHandlers({
      getUserId: async () => "user-a",
      store,
    });

    const req = new Request(
      `http://localhost/api/insights?workspaceId=${encodeURIComponent(ws.id)}`
    );
    const res = await GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.weeklyDoneTaskCount).toBe(1);
    expect(body.goalAchievementRate).toBe(60);
    expect(body.contribution[0].raw.taskScore).toBeGreaterThanOrEqual(1);
  });
});
