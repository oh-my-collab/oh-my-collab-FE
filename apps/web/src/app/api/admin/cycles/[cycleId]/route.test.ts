import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createAdminCycleDetailHandlers } from "./route";

describe("admin cycle detail api", () => {
  it("updates cycle fields", async () => {
    const store = createInMemoryCollabStore({
      workspaces: [
        {
          id: "ws_1",
          name: "Team",
          createdBy: "owner-1",
          createdAt: new Date().toISOString(),
        },
      ],
      memberships: [
        {
          workspaceId: "ws_1",
          userId: "owner-1",
          role: "owner",
          joinedAt: new Date().toISOString(),
        },
      ],
      performanceCycles: [
        {
          id: "cycle_1",
          workspaceId: "ws_1",
          title: "Q1",
          periodStart: "2026-01-01T00:00:00.000Z",
          periodEnd: "2026-03-31T23:59:59.999Z",
          status: "draft",
          weights: { execution: 40, docs: 20, goals: 25, collaboration: 15 },
          createdBy: "owner-1",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    });

    const { PATCH } = createAdminCycleDetailHandlers({
      getUserId: async () => "owner-1",
      getStore: async () => store,
    });

    const req = new Request("http://localhost/api/admin/cycles/cycle_1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: "ws_1",
        title: "Q1 Revised",
        status: "open",
      }),
    });

    const res = await PATCH(req, {
      params: Promise.resolve({ cycleId: "cycle_1" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.cycle.title).toBe("Q1 Revised");
    expect(body.cycle.status).toBe("open");
  });
});
