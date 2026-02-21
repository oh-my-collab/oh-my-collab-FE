import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createAdminReviewsHandlers } from "./route";

function createSeededStore() {
  return createInMemoryCollabStore({
    workspaces: [
      {
        id: "ws_1",
        name: "Team",
        createdBy: "owner-1",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    memberships: [
      {
        workspaceId: "ws_1",
        userId: "owner-1",
        role: "owner",
        joinedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        workspaceId: "ws_1",
        userId: "admin-1",
        role: "admin",
        joinedAt: "2026-01-01T00:00:00.000Z",
      },
      {
        workspaceId: "ws_1",
        userId: "member-1",
        role: "member",
        joinedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    tasks: [
      {
        id: "task_1",
        workspaceId: "ws_1",
        title: "Feature",
        status: "done",
        assigneeId: "member-1",
        priority: "high",
        difficulty: 3,
        checklist: [],
        repeat: "none",
        createdBy: "owner-1",
        updatedBy: "member-1",
        createdAt: "2026-02-10T00:00:00.000Z",
        updatedAt: "2026-02-11T00:00:00.000Z",
      },
    ],
    docs: [
      {
        id: "doc_1",
        workspaceId: "ws_1",
        title: "Weekly",
        content: "done",
        templateKey: "weekly-report",
        createdBy: "member-1",
        updatedBy: "member-1",
        createdAt: "2026-02-12T00:00:00.000Z",
        updatedAt: "2026-02-12T00:00:00.000Z",
      },
    ],
    goals: [
      {
        id: "goal_1",
        workspaceId: "ws_1",
        title: "Goal",
        createdBy: "owner-1",
        createdAt: "2026-02-01T00:00:00.000Z",
        updatedAt: "2026-02-01T00:00:00.000Z",
      },
    ],
    keyResults: [
      {
        id: "kr_1",
        workspaceId: "ws_1",
        goalId: "goal_1",
        title: "KR",
        metric: "%",
        targetValue: 100,
        currentValue: 50,
        progress: 50,
        updatedBy: "member-1",
        createdAt: "2026-02-08T00:00:00.000Z",
        updatedAt: "2026-02-14T00:00:00.000Z",
      },
    ],
    activityEvents: [
      {
        id: "event_1",
        workspaceId: "ws_1",
        actorUserId: "member-1",
        type: "comment",
        createdAt: "2026-02-15T00:00:00.000Z",
      },
    ],
    performanceCycles: [
      {
        id: "cycle_1",
        workspaceId: "ws_1",
        title: "H1 Review",
        periodStart: "2026-02-01T00:00:00.000Z",
        periodEnd: "2026-02-28T23:59:59.999Z",
        status: "open",
        weights: {
          execution: 40,
          docs: 20,
          goals: 25,
          collaboration: 15,
        },
        createdBy: "owner-1",
        createdAt: "2026-02-01T00:00:00.000Z",
        updatedAt: "2026-02-01T00:00:00.000Z",
      },
    ],
  });
}

describe("admin reviews api", () => {
  it("returns evidence and supports lock", async () => {
    const store = createSeededStore();
    const { GET, PATCH } = createAdminReviewsHandlers({
      getUserId: async () => "admin-1",
      getStore: async () => store,
    });

    const getRes = await GET(
      new Request(
        "http://localhost/api/admin/reviews?workspaceId=ws_1&cycleId=cycle_1&userId=member-1"
      )
    );
    const getBody = await getRes.json();
    expect(getRes.status).toBe(200);
    expect(getBody.scorePreview).toBeGreaterThan(0);

    const patchRes = await PATCH(
      new Request("http://localhost/api/admin/reviews", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws_1",
          cycleId: "cycle_1",
          userId: "member-1",
          managerNote: "good execution",
          finalRating: "A",
          lock: true,
        }),
      })
    );
    expect(patchRes.status).toBe(200);

    const patchRes2 = await PATCH(
      new Request("http://localhost/api/admin/reviews", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws_1",
          cycleId: "cycle_1",
          userId: "member-1",
          managerNote: "should fail",
        }),
      })
    );
    expect(patchRes2.status).toBe(409);
  });
});
