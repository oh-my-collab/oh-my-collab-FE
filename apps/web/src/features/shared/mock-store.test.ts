import { describe, expect, it } from "vitest";

import {
  getIssueById,
  getTeamReport,
  listIssues,
  reorderIssues,
  updateRequest,
} from "./mock-store";

describe("mock-store", () => {
  it("reorders issues across board columns", () => {
    const before = listIssues({ orgId: "org-acme", repoId: "repo-web" });
    const targetId = before[0]?.id;
    expect(targetId).toBeDefined();

    const result = reorderIssues("org-acme", "repo-web", {
      backlog: before.slice(1).map((issue) => issue.id),
      in_progress: targetId ? [targetId] : [],
      review: [],
      done: [],
    });

    const moved = targetId ? result.find((issue) => issue.id === targetId) : null;
    expect(moved?.status).toBe("in_progress");
  });

  it("updates request state with follow-up comment", () => {
    const next = updateRequest("REQ-201", "user-hyun", {
      status: "questioned",
      comment: "범위를 조금 더 좁힐 수 있을까요?",
    });

    expect(next?.status).toBe("questioned");
    expect(next?.comments.length).toBeGreaterThan(0);
  });

  it("builds team report with AI evidence", () => {
    const report = getTeamReport("org-acme", "week");

    expect(report).not.toBeNull();
    expect(report?.evidence.model).toContain("mock");
    expect(report?.contributors.length).toBeGreaterThan(0);
  });

  it("reads issue by id", () => {
    const issue = getIssueById("ISS-101");
    expect(issue?.id).toBe("ISS-101");
  });
});
