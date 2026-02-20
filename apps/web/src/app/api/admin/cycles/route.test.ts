import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createAdminCyclesHandlers } from "./route";

function createSeededStore() {
  return createInMemoryCollabStore({
    workspaces: [
      {
        id: "ws_1",
        name: "Team One",
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
      {
        workspaceId: "ws_1",
        userId: "admin-1",
        role: "admin",
        joinedAt: new Date().toISOString(),
      },
      {
        workspaceId: "ws_1",
        userId: "member-1",
        role: "member",
        joinedAt: new Date().toISOString(),
      },
    ],
  });
}

describe("admin cycles api", () => {
  it("creates and lists cycles for admin users", async () => {
    const store = createSeededStore();
    const { POST, GET } = createAdminCyclesHandlers({
      getUserId: async () => "owner-1",
      getStore: async () => store,
    });

    const postReq = new Request("http://localhost/api/admin/cycles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: "ws_1",
        title: "2026 H1",
        periodStart: "2026-01-01T00:00:00.000Z",
        periodEnd: "2026-06-30T23:59:59.999Z",
        status: "open",
        weights: {
          execution: 40,
          docs: 20,
          goals: 25,
          collaboration: 15,
        },
      }),
    });

    const postRes = await POST(postReq);
    expect(postRes.status).toBe(201);

    const getReq = new Request(
      "http://localhost/api/admin/cycles?workspaceId=ws_1"
    );
    const getRes = await GET(getReq);
    const body = await getRes.json();

    expect(getRes.status).toBe(200);
    expect(body.cycles.length).toBe(1);
    expect(body.cycles[0].title).toBe("2026 H1");
  });

  it("rejects member access", async () => {
    const store = createSeededStore();
    const { GET } = createAdminCyclesHandlers({
      getUserId: async () => "member-1",
      getStore: async () => store,
    });

    const res = await GET(
      new Request("http://localhost/api/admin/cycles?workspaceId=ws_1")
    );

    expect(res.status).toBe(403);
  });

  it("rejects invalid weight totals", async () => {
    const store = createSeededStore();
    const { POST } = createAdminCyclesHandlers({
      getUserId: async () => "owner-1",
      getStore: async () => store,
    });

    const res = await POST(
      new Request("http://localhost/api/admin/cycles", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: "ws_1",
          title: "invalid cycle",
          periodStart: "2026-01-01T00:00:00.000Z",
          periodEnd: "2026-06-30T23:59:59.999Z",
          weights: {
            execution: 10,
            docs: 10,
            goals: 10,
            collaboration: 10,
          },
        }),
      })
    );

    expect(res.status).toBe(400);
  });
});
