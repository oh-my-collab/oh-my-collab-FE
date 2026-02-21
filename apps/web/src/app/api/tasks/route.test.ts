import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createTaskByIdHandlers } from "./[taskId]/route";
import { createTaskReorderHandlers } from "./reorder/route";
import { createTaskHandlers } from "./route";

describe("tasks api", () => {
  it("creates task, moves status, and lists tasks by workspace", async () => {
    const store = createInMemoryCollabStore();
    const ws = (
      await store.createWorkspaceWithOwner({
        name: "Task Team",
        ownerUserId: "user-a",
      })
    ).workspace;

    const handlers = createTaskHandlers({
      getUserId: async () => "user-a",
      getStore: async () => store,
    });

    const createReq = new Request("http://localhost/api/tasks", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId: ws.id,
        title: "Implement Kanban",
        assigneeId: "user-a",
        priority: "high",
        sprintKey: "S-1",
        isBlocked: true,
        blockedReason: "API 의존성 지연",
        sortOrder: 100,
      }),
    });
    const createRes = await handlers.POST(createReq);
    const createBody = await createRes.json();

    expect(createRes.status).toBe(201);

    const patchHandlers = createTaskByIdHandlers({
      getUserId: async () => "user-a",
      getStore: async () => store,
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
    expect(listBody.tasks[0].sprintKey).toBe("S-1");
    expect(listBody.tasks[0].isBlocked).toBe(true);
  });

  it("reorders tasks in backlog order", async () => {
    const store = createInMemoryCollabStore();
    const ws = (
      await store.createWorkspaceWithOwner({
        name: "Task Team",
        ownerUserId: "user-a",
      })
    ).workspace;

    const createHandlers = createTaskHandlers({
      getUserId: async () => "user-a",
      getStore: async () => store,
    });
    const reorderHandlers = createTaskReorderHandlers({
      getUserId: async () => "user-a",
      getStore: async () => store,
    });

    const firstRes = await createHandlers.POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: ws.id,
          title: "첫 번째",
          sortOrder: 100,
        }),
      })
    );
    const secondRes = await createHandlers.POST(
      new Request("http://localhost/api/tasks", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: ws.id,
          title: "두 번째",
          sortOrder: 200,
        }),
      })
    );
    const firstTaskId = (await firstRes.json()).task.id as string;
    const secondTaskId = (await secondRes.json()).task.id as string;

    const reorderRes = await reorderHandlers.PATCH(
      new Request("http://localhost/api/tasks/reorder", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          workspaceId: ws.id,
          orderedTaskIds: [secondTaskId, firstTaskId],
        }),
      })
    );
    const reorderBody = await reorderRes.json();

    expect(reorderRes.status).toBe(200);
    expect(reorderBody.tasks[0].id).toBe(secondTaskId);
    expect(reorderBody.tasks[1].id).toBe(firstTaskId);
  });
});
