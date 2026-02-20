import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "./collab-store";

describe("collab-store admin evaluation features", () => {
  it("recognizes admin role and supports owner-driven role changes", () => {
    const store = createInMemoryCollabStore({
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
    });

    expect(store.isWorkspaceAdmin("ws_1", "admin-1")).toBe(true);
    expect(
      store.updateWorkspaceMembershipRole({
        workspaceId: "ws_1",
        targetUserId: "member-1",
        role: "admin",
        actorUserId: "owner-1",
      })
    ).toMatchObject({ role: "admin" });

    expect(() =>
      store.updateWorkspaceMembershipRole({
        workspaceId: "ws_1",
        targetUserId: "member-1",
        role: "member",
        actorUserId: "admin-1",
      })
    ).toThrowError("FORBIDDEN");
  });

  it("builds period-based evidence packs and locks reviews", () => {
    const store = createInMemoryCollabStore({
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
          userId: "member-1",
          role: "member",
          joinedAt: "2026-01-01T00:00:00.000Z",
        },
        {
          workspaceId: "ws_1",
          userId: "member-2",
          role: "member",
          joinedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
      tasks: [
        {
          id: "task_1",
          workspaceId: "ws_1",
          title: "Inside period",
          status: "done",
          assigneeId: "member-1",
          priority: "high",
          difficulty: 3,
          checklist: [],
          repeat: "none",
          createdBy: "owner-1",
          updatedBy: "member-1",
          createdAt: "2026-02-01T00:00:00.000Z",
          updatedAt: "2026-02-10T00:00:00.000Z",
        },
        {
          id: "task_2",
          workspaceId: "ws_1",
          title: "Outside period",
          status: "done",
          assigneeId: "member-1",
          priority: "high",
          difficulty: 10,
          checklist: [],
          repeat: "none",
          createdBy: "owner-1",
          updatedBy: "member-1",
          createdAt: "2026-01-10T00:00:00.000Z",
          updatedAt: "2026-01-10T00:00:00.000Z",
        },
        {
          id: "task_3",
          workspaceId: "ws_1",
          title: "Inside period compare member",
          status: "done",
          assigneeId: "member-2",
          priority: "medium",
          difficulty: 1,
          checklist: [],
          repeat: "none",
          createdBy: "owner-1",
          updatedBy: "member-2",
          createdAt: "2026-02-10T00:00:00.000Z",
          updatedAt: "2026-02-11T00:00:00.000Z",
        },
      ],
      performanceCycles: [
        {
          id: "cycle_1",
          workspaceId: "ws_1",
          title: "H1",
          periodStart: "2026-02-01T00:00:00.000Z",
          periodEnd: "2026-02-28T23:59:59.999Z",
          status: "open",
          weights: {
            execution: 100,
            docs: 0,
            goals: 0,
            collaboration: 0,
          },
          createdBy: "owner-1",
          createdAt: "2026-02-01T00:00:00.000Z",
          updatedAt: "2026-02-01T00:00:00.000Z",
        },
      ],
    });

    const evidence = store.buildEvidencePack("ws_1", "cycle_1", "member-1");
    expect(evidence).toBeDefined();
    expect(evidence?.evidencePack.raw.execution).toBe(3);
    expect(evidence?.scorePreview).toBe(100);

    const lockedReview = store.upsertPerformanceReview({
      workspaceId: "ws_1",
      cycleId: "cycle_1",
      userId: "member-1",
      managerNote: "keep",
      finalRating: "A",
      lock: true,
      updatedBy: "owner-1",
    });
    expect(lockedReview?.lockedAt).toBeDefined();

    expect(() =>
      store.upsertPerformanceReview({
        workspaceId: "ws_1",
        cycleId: "cycle_1",
        userId: "member-1",
        managerNote: "should fail",
        updatedBy: "owner-1",
      })
    ).toThrowError("REVIEW_LOCKED");
  });
});
