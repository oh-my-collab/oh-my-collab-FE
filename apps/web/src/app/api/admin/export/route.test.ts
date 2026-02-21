import { describe, expect, it } from "vitest";

import { createInMemoryCollabStore } from "@/lib/data/collab-store";

import { createAdminExportHandlers } from "./route";

function createSeededStore() {
  return createInMemoryCollabStore({
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
    tasks: [
      {
        id: "task_1",
        workspaceId: "ws_1",
        title: "Task",
        status: "done",
        assigneeId: "member-1",
        priority: "medium",
        difficulty: 2,
        checklist: [],
        repeat: "none",
        createdBy: "owner-1",
        updatedBy: "member-1",
        createdAt: "2026-02-01T00:00:00.000Z",
        updatedAt: "2026-02-02T00:00:00.000Z",
      },
    ],
    performanceCycles: [
      {
        id: "cycle_1",
        workspaceId: "ws_1",
        title: "Cycle",
        periodStart: "2026-02-01T00:00:00.000Z",
        periodEnd: "2026-02-28T23:59:59.999Z",
        status: "open",
        weights: { execution: 40, docs: 20, goals: 25, collaboration: 15 },
        createdBy: "owner-1",
        createdAt: "2026-02-01T00:00:00.000Z",
        updatedAt: "2026-02-01T00:00:00.000Z",
      },
    ],
  });
}

describe("admin export api", () => {
  it("exports csv and pdf", async () => {
    const store = createSeededStore();
    const { GET } = createAdminExportHandlers({
      getUserId: async () => "admin-1",
      getStore: async () => store,
    });

    const csvRes = await GET(
      new Request(
        "http://localhost/api/admin/export?workspaceId=ws_1&cycleId=cycle_1&format=csv"
      )
    );
    const csvText = await csvRes.text();
    expect(csvRes.status).toBe(200);
    expect(csvRes.headers.get("content-type")).toContain("text/csv");
    expect(csvText).toContain("userId,scorePreview");

    const pdfRes = await GET(
      new Request(
        "http://localhost/api/admin/export?workspaceId=ws_1&cycleId=cycle_1&format=pdf"
      )
    );
    const pdfBuffer = Buffer.from(await pdfRes.arrayBuffer());
    expect(pdfRes.status).toBe(200);
    expect(pdfRes.headers.get("content-type")).toContain("application/pdf");
    expect(pdfBuffer.toString("utf8", 0, 8)).toContain("%PDF-1.");
  });
});
