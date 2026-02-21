import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createWorkspaceHandlers } from "./route";

describe("workspaces api", () => {
  it("creates workspace and owner membership", async () => {
    const store = createInMemoryCollabStore();
    const handlers = createWorkspaceHandlers({
      getUserId: async () => "user-1",
      getStore: async () => store,
    });

    const req = new Request("http://localhost/api/workspaces", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Capstone Team" }),
    });

    const res = await handlers.POST(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.workspace.name).toBe("Capstone Team");
    expect(body.membership.role).toBe("owner");
    expect(body.membership.userId).toBe("user-1");
  });

  it("lists user workspaces with default workspace id", async () => {
    const store = createInMemoryCollabStore();
    const handlers = createWorkspaceHandlers({
      getUserId: async () => "user-1",
      getStore: async () => store,
    });

    await store.createWorkspaceWithOwner({
      name: "Alpha Team",
      ownerUserId: "user-1",
    });
    await store.createWorkspaceWithOwner({
      name: "Beta Team",
      ownerUserId: "user-1",
    });

    const req = new Request("http://localhost/api/workspaces", {
      method: "GET",
    });
    const res = await handlers.GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.workspaces).toHaveLength(2);
    expect(body.workspaces[0]).toMatchObject({
      workspaceName: "Alpha Team",
      role: "owner",
    });
    expect(body.defaultWorkspaceId).toBe(body.workspaces[0].workspaceId);
  });
});
