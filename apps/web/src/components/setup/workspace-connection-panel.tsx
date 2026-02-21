"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type { UserWorkspaceSummary } from "@/lib/data/collab-store";
import { ROLE_COPY } from "@/lib/ui/copy";

type WorkspaceListResponse = {
  workspaces?: UserWorkspaceSummary[];
  defaultWorkspaceId?: string | null;
  message?: string;
};

function parseMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "message" in body) {
    const value = (body as { message?: unknown }).message;
    if (typeof value === "string") return value;
  }
  return fallback;
}

export function WorkspaceConnectionPanel() {
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState<UserWorkspaceSummary[]>([]);
  const [defaultWorkspaceId, setDefaultWorkspaceId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setMessage(null);

      try {
        const res = await fetch("/api/workspaces", { cache: "no-store" });
        const body = (await res.json()) as WorkspaceListResponse;

        if (!active) return;

        if (!res.ok) {
          if (res.status === 401) {
            setMessage("로그인 후 워크스페이스 연동 상태를 확인할 수 있습니다.");
          } else {
            setMessage(parseMessage(body, "워크스페이스 조회에 실패했습니다."));
          }
          setWorkspaces([]);
          setDefaultWorkspaceId(null);
          return;
        }

        setWorkspaces(body.workspaces ?? []);
        setDefaultWorkspaceId(body.defaultWorkspaceId ?? null);
      } catch {
        if (!active) return;
        setMessage("워크스페이스 조회 중 네트워크 오류가 발생했습니다.");
        setWorkspaces([]);
        setDefaultWorkspaceId(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, []);

  const defaultWorkspace = useMemo(
    () =>
      workspaces.find((workspace) => workspace.workspaceId === defaultWorkspaceId) ?? null,
    [defaultWorkspaceId, workspaces]
  );

  return (
    <section className="section-shell">
      <div className="section-head">
        <h2 className="section-title">워크스페이스 연동 상태</h2>
        <span className="chip">백엔드 연동</span>
      </div>
      <p className="text-sm text-[var(--ink-muted)]">
        백엔드 API와 연결된 워크스페이스 목록을 확인합니다.
      </p>

      {loading ? (
        <p className="empty-note mt-3">연동 상태를 확인하는 중입니다.</p>
      ) : message ? (
        <p className="empty-note mt-3">{message}</p>
      ) : workspaces.length === 0 ? (
        <p className="empty-note mt-3">
          아직 연결된 워크스페이스가 없습니다. 먼저 워크스페이스를 생성해 주세요.
        </p>
      ) : (
        <div className="mt-3 space-y-3">
          <div className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--ink-default)]">
            기본 워크스페이스:{" "}
            <strong className="font-semibold text-[var(--ink-strong)]">
              {defaultWorkspace?.workspaceName ?? "-"}
            </strong>
          </div>

          <ul className="space-y-2">
            {workspaces.map((workspace) => (
              <li
                key={workspace.workspaceId}
                className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] px-3 py-2.5"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--ink-strong)]">
                      {workspace.workspaceName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--ink-subtle)]">
                      {workspace.workspaceId}
                    </p>
                  </div>
                  <span className="status-chip">{ROLE_COPY[workspace.role]}</span>
                </div>
                <div className="mt-2">
                  <Link
                    href={`/overview?workspaceId=${encodeURIComponent(workspace.workspaceId)}`}
                    className="btn-secondary py-1.5 text-xs"
                  >
                    요약 화면으로 이동
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
