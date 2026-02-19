import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createPostWorkspaceHandler } from "./route";

describe("POST /api/workspaces", () => {
  it("creates workspace and owner membership", async () => {
    const store = createInMemoryCollabStore();
    const postWorkspace = createPostWorkspaceHandler({
      getUserId: async () => "user-1",
      getStore: async () => store,
    });

    const req = new Request("http://localhost/api/workspaces", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ name: "Capstone Team" }),
    });

    const res = await postWorkspace(req);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.workspace.name).toBe("Capstone Team");
    expect(body.membership.role).toBe("owner");
    expect(body.membership.userId).toBe("user-1");
  });
});
