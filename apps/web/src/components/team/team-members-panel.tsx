"use client";

import { useEffect, useMemo, useState } from "react";

import { ROLE_COPY } from "@/lib/ui/copy";

type Member = {
  workspaceId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
};

type TeamMembersPanelProps = {
  workspaceId: string;
  currentRole: "owner" | "admin" | "member";
};

function parseApiMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "message" in body) {
    const value = (body as { message?: unknown }).message;
    if (typeof value === "string") return value;
  }
  return fallback;
}

function formatDateTimeLabel(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("ko-KR");
}

export function TeamMembersPanel({
  workspaceId,
  currentRole,
}: TeamMembersPanelProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<Record<string, "admin" | "member">>({});

  const isOwner = currentRole === "owner";

  const orderedMembers = useMemo(() => {
    const rank = { owner: 0, admin: 1, member: 2 };
    return [...members].sort((a, b) => {
      const rankDiff = rank[a.role] - rank[b.role];
      if (rankDiff !== 0) return rankDiff;
      return a.userId.localeCompare(b.userId);
    });
  }, [members]);

  async function loadMembers() {
    setMessage(null);
    const res = await fetch(
      `/api/workspace-members?workspaceId=${encodeURIComponent(workspaceId)}`,
      { cache: "no-store" }
    );
    const body = await res.json();
    if (!res.ok) {
      setMessage(parseApiMessage(body, "팀 멤버 정보를 불러오지 못했습니다."));
      return;
    }

    const fetchedMembers = (body.members ?? []) as Member[];
    setMembers(fetchedMembers);
    setRoleDraft(
      Object.fromEntries(
        fetchedMembers
          .filter((member) => member.role !== "owner")
          .map((member) => [member.userId, member.role === "admin" ? "admin" : "member"])
      )
    );
  }

  useEffect(() => {
    loadMembers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  async function updateRole(targetUserId: string) {
    if (!isOwner) return;
    const role = roleDraft[targetUserId];
    if (!role) return;

    setBusyUserId(targetUserId);
    setMessage(null);
    const res = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        targetUserId,
        role,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      setBusyUserId(null);
      setMessage(parseApiMessage(body, "역할 변경에 실패했습니다."));
      return;
    }

    setBusyUserId(null);
    setMessage("역할을 업데이트했습니다.");
    await loadMembers();
  }

  return (
    <div className="space-y-5">
      {!isOwner && (
        <p className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--ink-default)]">
          현재 화면에서는 팀 현황을 조회할 수 있습니다. 역할 변경은 오너 계정에서만 가능합니다.
        </p>
      )}

      <div className="list-table-wrap">
        <table className="list-table">
          <thead>
            <tr>
              <th>사용자</th>
              <th>현재 역할</th>
              <th>참여 시각</th>
              <th>역할 설정</th>
              <th>적용</th>
            </tr>
          </thead>
          <tbody>
            {orderedMembers.map((member) => {
              const targetValue = roleDraft[member.userId] ?? "member";
              const isOwnerRow = member.role === "owner";
              return (
                <tr key={member.userId}>
                  <td className="font-semibold text-[var(--ink-strong)]">{member.userId}</td>
                  <td>{ROLE_COPY[member.role]}</td>
                  <td>{formatDateTimeLabel(member.joinedAt)}</td>
                  <td>
                    {isOwnerRow ? (
                      <span className="text-[var(--ink-subtle)]">오너 고정</span>
                    ) : (
                      <select
                        className="field-input py-1"
                        value={targetValue}
                        onChange={(event) =>
                          setRoleDraft((prev) => ({
                            ...prev,
                            [member.userId]: event.target.value as "admin" | "member",
                          }))
                        }
                        disabled={!isOwner || busyUserId === member.userId}
                      >
                        <option value="member">구성원</option>
                        <option value="admin">관리자</option>
                      </select>
                    )}
                  </td>
                  <td>
                    {isOwnerRow ? (
                      "-"
                    ) : (
                      <button
                        type="button"
                        className="btn-secondary px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
                        disabled={!isOwner || busyUserId === member.userId}
                        onClick={() => updateRole(member.userId)}
                      >
                        저장
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            {orderedMembers.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-sm text-[var(--ink-subtle)]">
                  등록된 팀 멤버가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {message && (
        <p className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--ink-default)]">
          {message}
        </p>
      )}
    </div>
  );
}
