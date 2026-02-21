import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createAdminMembersHandlers } from "./route";

function createSeededStore() {
  return createInMemoryCollabStore({
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

describe("admin members api", () => {
  it("allows owner to assign admin role", async () => {
    const store = createSeededStore();
    const { PATCH } = createAdminMembersHandlers({
      getUserId: async () => "owner-1",
      getStore: async () => store,
    });

    const req = new Request("http://localhost/api/admin/members", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: "ws_1",
        targetUserId: "member-1",
        role: "admin",
      }),
    });

    const res = await PATCH(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.membership.role).toBe("admin");
  });

  it("blocks admin from changing member role", async () => {
    const store = createSeededStore();
    const { PATCH } = createAdminMembersHandlers({
      getUserId: async () => "admin-1",
      getStore: async () => store,
    });

    const req = new Request("http://localhost/api/admin/members", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: "ws_1",
        targetUserId: "member-1",
        role: "admin",
      }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(403);
  });
});
