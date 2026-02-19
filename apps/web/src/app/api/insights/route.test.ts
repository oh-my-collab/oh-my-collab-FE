import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createInsightsHandlers } from "./route";

describe("insights api", () => {
  it("returns dashboard summary and contribution details", async () => {
    const store = createInMemoryCollabStore();
    const ws = (
      await store.createWorkspaceWithOwner({
        name: "Insights Team",
        ownerUserId: "user-a",
      })
    ).workspace;

    const task = await store.createTask({
      workspaceId: ws.id,
      title: "Ship API",
      assigneeId: "user-a",
      difficulty: 2,
      createdBy: "user-a",
    });
    await store.updateTask({
      taskId: task.id,
      workspaceId: ws.id,
      userId: "user-a",
      assigneeId: "user-a",
      status: "done",
    });
    await store.createDoc({
      workspaceId: ws.id,
      title: "Weekly notes",
      content: "done",
      templateKey: "weekly-report",
      userId: "user-a",
    });

    const goal = await store.createGoal({
      workspaceId: ws.id,
      title: "Beta",
      userId: "user-a",
    });
    const kr = await store.createKeyResult({
      goalId: goal.id,
      workspaceId: ws.id,
      title: "Completion",
      metric: "%",
      targetValue: 100,
      userId: "user-a",
    });
    if (!kr) throw new Error("kr should exist");
    await store.updateKeyResultProgress({
      keyResultId: kr.id,
      workspaceId: ws.id,
      progress: 60,
      currentValue: 60,
      userId: "user-a",
    });
    await store.addActivityEvent({
      workspaceId: ws.id,
      actorUserId: "user-a",
      type: "comment",
    });

    const { GET } = createInsightsHandlers({
      getUserId: async () => "user-a",
      getStore: async () => store,
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
