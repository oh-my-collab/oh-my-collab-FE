"use client";

import { useEffect, useMemo, useState } from "react";

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
        <p className="rounded-md border border-[var(--border)] bg-slate-50 px-3 py-2 text-sm text-slate-700">
          현재 계정은 admin 권한입니다. 관리자 지정/해제는 owner만 수행할 수 있습니다.
        </p>
      )}

      <div className="overflow-x-auto border border-[var(--border)] bg-white">
        <table className="min-w-full border-collapse text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
            <tr>
              <th className="px-4 py-3">사용자</th>
              <th className="px-4 py-3">현재 권한</th>
              <th className="px-4 py-3">권한 설정</th>
              <th className="px-4 py-3">적용</th>
            </tr>
          </thead>
          <tbody>
            {orderedMembers.map((member) => {
              const isOwnerRow = member.role === "owner";
              const targetValue = roleDraft[member.userId] ?? "member";
              return (
                <tr key={member.userId} className="border-t border-[var(--border)]">
                  <td className="px-4 py-3 font-medium text-slate-900">{member.userId}</td>
                  <td className="px-4 py-3 text-slate-700">{member.role}</td>
                  <td className="px-4 py-3">
                    {isOwnerRow ? (
                      <span className="text-slate-400">owner 고정</span>
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
                        className="rounded border border-slate-300 px-2 py-1"
                      >
                        <option value="member">member</option>
                        <option value="admin">admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {isOwnerRow ? (
                      "-"
                    ) : (
                      <button
                        type="button"
                        disabled={!isOwner || busyUserId === member.userId}
                        onClick={() => updateRole(member.userId)}
                        className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100"
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
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                  등록된 멤버가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {message && (
        <p className="rounded-md border border-[var(--border)] bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}
    </div>
  );
}
