import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createTaskByIdHandlers } from "./[taskId]/route";
import { createTaskHandlers } from "./route";

describe("tasks api", () => {
  it("creates task, moves status, and lists tasks by workspace", async () => {
    const store = createInMemoryCollabStore();
    const ws = store.createWorkspaceWithOwner({
      name: "Task Team",
      ownerUserId: "user-a",
    }).workspace;

    const handlers = createTaskHandlers({
      getUserId: async () => "user-a",
      store,
    });

    const createReq = new Request("http://localhost/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: ws.id,
        title: "Implement Kanban",
        assigneeId: "user-a",
        priority: "high",
      }),
    });
    const createRes = await handlers.POST(createReq);
    const createBody = await createRes.json();

    expect(createRes.status).toBe(201);

    const patchHandlers = createTaskByIdHandlers({
      getUserId: async () => "user-a",
      store,
    });

    const patchReq = new Request(
      `http://localhost/api/tasks/${createBody.task.id}`,
      {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: ws.id,
          status: "done",
        }),
      }
    );

    const patchRes = await patchHandlers.PATCH(patchReq, {
      params: Promise.resolve({ taskId: createBody.task.id }),
    });
    expect(patchRes.status).toBe(200);

    const listReq = new Request(
      `http://localhost/api/tasks?workspaceId=${encodeURIComponent(ws.id)}`
    );
    const listRes = await handlers.GET(listReq);
    const listBody = await listRes.json();

    expect(listRes.status).toBe(200);
    expect(listBody.tasks).toHaveLength(1);
    expect(listBody.tasks[0].status).toBe("done");
  });
});
