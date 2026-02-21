import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createWorkspaceMembersHandlers } from "./route";

describe("workspace-members api", () => {
  it("returns members for workspace member", async () => {
    const store = createInMemoryCollabStore();
    const ws = (
      await store.createWorkspaceWithOwner({
        name: "Team",
        ownerUserId: "owner-1",
      })
    ).workspace;

    await store.createWorkspaceWithOwner({
      name: "Other",
      ownerUserId: "owner-2",
    });

    const handlers = createWorkspaceMembersHandlers({
      getUserId: async () => "owner-1",
      getStore: async () => store,
    });

    const req = new Request(
      `http://localhost/api/workspace-members?workspaceId=${encodeURIComponent(ws.id)}`
    );
    const res = await handlers.GET(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.members).toHaveLength(1);
    expect(body.members[0].role).toBe("owner");
  });

  it("blocks non-member access", async () => {
    const store = createInMemoryCollabStore();
    const ws = (
      await store.createWorkspaceWithOwner({
        name: "Team",
        ownerUserId: "owner-1",
      })
    ).workspace;

    const handlers = createWorkspaceMembersHandlers({
      getUserId: async () => "intruder-1",
      getStore: async () => store,
    });

    const req = new Request(
      `http://localhost/api/workspace-members?workspaceId=${encodeURIComponent(ws.id)}`
    );
    const res = await handlers.GET(req);

    expect(res.status).toBe(403);
  });
});
