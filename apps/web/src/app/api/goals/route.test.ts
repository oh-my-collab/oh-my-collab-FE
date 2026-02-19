import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createGoalKeyResultHandlers } from "./[goalId]/key-results/route";
import { createGoalHandlers } from "./route";

describe("goals api", () => {
  it("creates goal, adds key result, and updates weekly progress", async () => {
    const store = createInMemoryCollabStore();
    const ws = store.createWorkspaceWithOwner({
      name: "Goals Team",
      ownerUserId: "user-a",
    }).workspace;

    const goalHandlers = createGoalHandlers({
      getUserId: async () => "user-a",
      store,
    });

    const createGoalReq = new Request("http://localhost/api/goals", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: ws.id,
        title: "Launch MVP",
      }),
    });
    const createGoalRes = await goalHandlers.POST(createGoalReq);
    const createGoalBody = await createGoalRes.json();
    expect(createGoalRes.status).toBe(201);

    const krHandlers = createGoalKeyResultHandlers({
      getUserId: async () => "user-a",
      store,
    });

    const createKrReq = new Request(
      `http://localhost/api/goals/${createGoalBody.goal.id}/key-results`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: ws.id,
          title: "Weekly completion",
          metric: "%",
          targetValue: 100,
        }),
      }
    );
    const createKrRes = await krHandlers.POST(createKrReq, {
      params: Promise.resolve({ goalId: createGoalBody.goal.id }),
    });
    const createKrBody = await createKrRes.json();
    expect(createKrRes.status).toBe(201);

    const updateProgressReq = new Request(
      `http://localhost/api/goals/${createGoalBody.goal.id}/key-results`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: ws.id,
          keyResultId: createKrBody.keyResult.id,
          progress: 55,
          currentValue: 55,
        }),
      }
    );
    const updateProgressRes = await krHandlers.PATCH(updateProgressReq, {
      params: Promise.resolve({ goalId: createGoalBody.goal.id }),
    });
    const updateProgressBody = await updateProgressRes.json();

    expect(updateProgressRes.status).toBe(200);
    expect(updateProgressBody.keyResult.progress).toBe(55);

    const listGoalsReq = new Request(
      `http://localhost/api/goals?workspaceId=${encodeURIComponent(ws.id)}`
    );
    const listGoalsRes = await goalHandlers.GET(listGoalsReq);
    const listGoalsBody = await listGoalsRes.json();

    expect(listGoalsRes.status).toBe(200);
    expect(listGoalsBody.goals).toHaveLength(1);
  });
});
