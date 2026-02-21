"use client";

import { useEffect, useMemo, useState } from "react";

import { ROLE_COPY } from "@/lib/ui/copy";

type Member = {
  workspaceId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
};

type MembersManagerProps = {
  workspaceId: string;
  currentRole: "owner" | "admin";
};

function parseApiMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "message" in body) {
    const value = (body as { message?: unknown }).message;
    if (typeof value === "string") return value;
  }
  return fallback;
}

export function MembersManager({ workspaceId, currentRole }: MembersManagerProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [busyUserId, setBusyUserId] = useState<string | null>(null);
  const [roleDraft, setRoleDraft] = useState<Record<string, "admin" | "member">>({});
  const [message, setMessage] = useState<string | null>(null);

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
    const res = await fetch(
      `/api/admin/members?workspaceId=${encodeURIComponent(workspaceId)}`,
      { cache: "no-store" }
    );
    const body = await res.json();
    if (!res.ok) {
      setMessage(parseApiMessage(body, "멤버 목록을 불러오지 못했습니다."));
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
    const targetRole = roleDraft[targetUserId];
    if (!targetRole) return;

    setBusyUserId(targetUserId);
    setMessage(null);
    const res = await fetch("/api/admin/members", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        targetUserId,
        role: targetRole,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(parseApiMessage(body, "권한 변경에 실패했습니다."));
      setBusyUserId(null);
      return;
    }
    setBusyUserId(null);
    setMessage("권한을 업데이트했습니다.");
    await loadMembers();
  }

  return (
    <div className="space-y-5">
      {!isOwner && (
        <p className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--ink-default)]">
          현재 계정은 관리자 권한입니다. 관리자 지정/해제는 오너만 수행할 수 있습니다.
        </p>
      )}

      <div className="list-table-wrap">
        <table className="list-table">
          <thead>
            <tr>
              <th>사용자</th>
              <th>현재 권한</th>
              <th>권한 설정</th>
              <th>적용</th>
            </tr>
          </thead>
          <tbody>
            {orderedMembers.map((member) => {
              const isOwnerRow = member.role === "owner";
              const targetValue = roleDraft[member.userId] ?? "member";
              return (
                <tr key={member.userId}>
                  <td className="font-semibold text-[var(--ink-strong)]">{member.userId}</td>
                  <td>{ROLE_COPY[member.role]}</td>
                  <td>
                    {isOwnerRow ? (
                      <span className="text-[var(--ink-subtle)]">오너 고정</span>
                    ) : (
                      <select
                        value={targetValue}
                        disabled={!isOwner || busyUserId === member.userId}
                        onChange={(event) =>
                          setRoleDraft((prev) => ({
                            ...prev,
                            [member.userId]: event.target.value as "admin" | "member",
                          }))
                        }
                        className="field-input py-1"
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
                        disabled={!isOwner || busyUserId === member.userId}
                        onClick={() => updateRole(member.userId)}
                        className="btn-secondary px-2.5 py-1 text-xs disabled:cursor-not-allowed disabled:opacity-50"
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
                <td colSpan={4} className="py-8 text-center text-sm text-[var(--ink-subtle)]">
                  등록된 멤버가 없습니다.
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
