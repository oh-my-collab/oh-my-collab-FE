import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createDocsHandlers } from "./route";

describe("docs api", () => {
  it("creates a doc and lists docs only for requested workspace", async () => {
    const store = createInMemoryCollabStore();
    const wsA = (
      await store.createWorkspaceWithOwner({
        name: "Team A",
        ownerUserId: "user-a",
      })
    ).workspace;
    const wsB = (
      await store.createWorkspaceWithOwner({
        name: "Team B",
        ownerUserId: "user-b",
      })
    ).workspace;

    await store.createDoc({
      workspaceId: wsB.id,
      title: "B doc",
      content: "private",
      templateKey: "custom",
      userId: "user-b",
    });

    const { GET, POST } = createDocsHandlers({
      getUserId: async () => "user-a",
      getStore: async () => store,
    });

    const createReq = new Request("http://localhost/api/docs", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: wsA.id,
        title: "A meeting",
        content: "notes",
        templateKey: "meeting-note",
      }),
    });

    const createRes = await POST(createReq);
    expect(createRes.status).toBe(201);

    const listReq = new Request(
      `http://localhost/api/docs?workspaceId=${encodeURIComponent(wsA.id)}`
    );
    const listRes = await GET(listReq);
    const listBody = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listBody.docs).toHaveLength(1);
    expect(listBody.docs[0].workspaceId).toBe(wsA.id);
  });
});
