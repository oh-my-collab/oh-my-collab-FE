"use client";

import { useEffect, useMemo, useState } from "react";

import { CYCLE_STATUS_COPY, ROLE_COPY } from "@/lib/ui/copy";

type Cycle = {
  id: string;
  title: string;
  periodStart: string;
  periodEnd: string;
  status: "draft" | "open" | "closed";
  weights: {
    execution: number;
    docs: number;
    goals: number;
    collaboration: number;
  };
};

type Member = {
  workspaceId: string;
  userId: string;
  role: "owner" | "admin" | "member";
  joinedAt: string;
};

type ReviewPayload = {
  evidencePack: {
    periodStart: string;
    periodEnd: string;
    raw: {
      execution: number;
      docs: number;
      goals: number;
      collaboration: number;
    };
    normalized: {
      execution: number;
      docs: number;
      goals: number;
      collaboration: number;
    };
    highlights: string[];
  };
  scorePreview: number;
  managerNote: string | null;
  finalRating: string | null;
  lockedAt: string | null;
};

type ReviewsManagerProps = {
  workspaceId: string;
};

function parseApiMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "message" in body) {
    const value = (body as { message?: unknown }).message;
    if (typeof value === "string") return value;
  }
  return fallback;
}

export function ReviewsManager({ workspaceId }: ReviewsManagerProps) {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [review, setReview] = useState<ReviewPayload | null>(null);
  const [managerNote, setManagerNote] = useState("");
  const [finalRating, setFinalRating] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState<"csv" | "pdf" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const selectableMembers = useMemo(
    () => members.filter((member) => member.role !== "owner"),
    [members]
  );

  async function loadContext() {
    setLoading(true);
    setMessage(null);
    const [cyclesRes, membersRes] = await Promise.all([
      fetch(`/api/admin/cycles?workspaceId=${encodeURIComponent(workspaceId)}`, {
        cache: "no-store",
      }),
      fetch(`/api/admin/members?workspaceId=${encodeURIComponent(workspaceId)}`, {
        cache: "no-store",
      }),
    ]);

    const cyclesBody = await cyclesRes.json();
    const membersBody = await membersRes.json();

    if (!cyclesRes.ok) {
      setMessage(parseApiMessage(cyclesBody, "평가 주기 목록을 불러오지 못했습니다."));
      setLoading(false);
      return;
    }
    if (!membersRes.ok) {
      setMessage(parseApiMessage(membersBody, "멤버 목록을 불러오지 못했습니다."));
      setLoading(false);
      return;
    }

    const nextCycles = (cyclesBody.cycles ?? []) as Cycle[];
    const nextMembers = (membersBody.members ?? []) as Member[];
    setCycles(nextCycles);
    setMembers(nextMembers);

    if (!selectedCycleId && nextCycles.length > 0) {
      setSelectedCycleId(nextCycles[0].id);
    }
    if (!selectedUserId && nextMembers.length > 0) {
      const firstMember = nextMembers.find((member) => member.role !== "owner");
      setSelectedUserId(firstMember?.userId ?? nextMembers[0].userId);
    }
    setLoading(false);
  }

  useEffect(() => {
    loadContext();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  async function loadReview(cycleId: string, userId: string) {
    if (!cycleId || !userId) return;
    setMessage(null);

    const res = await fetch(
      `/api/admin/reviews?workspaceId=${encodeURIComponent(workspaceId)}&cycleId=${encodeURIComponent(cycleId)}&userId=${encodeURIComponent(userId)}`,
      { cache: "no-store" }
    );
    const body = await res.json();
    if (!res.ok) {
      setReview(null);
      setManagerNote("");
      setFinalRating("");
      setMessage(parseApiMessage(body, "리뷰 정보를 불러오지 못했습니다."));
      return;
    }

    const payload = body as ReviewPayload;
    setReview(payload);
    setManagerNote(payload.managerNote ?? "");
    setFinalRating(payload.finalRating ?? "");
  }

  useEffect(() => {
    loadReview(selectedCycleId, selectedUserId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCycleId, selectedUserId, workspaceId]);

  async function saveReview(lock: boolean) {
    if (!selectedCycleId || !selectedUserId || !review) return;

    setSaving(true);
    setMessage(null);

    const res = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        cycleId: selectedCycleId,
        userId: selectedUserId,
        managerNote: managerNote.trim(),
        finalRating: finalRating.trim(),
        lock,
      }),
    });
    const body = await res.json();

    if (!res.ok) {
      setMessage(parseApiMessage(body, "리뷰 저장에 실패했습니다."));
      setSaving(false);
      return;
    }

    setSaving(false);
    setMessage(lock ? "리뷰를 확정(잠금)했습니다." : "리뷰를 저장했습니다.");
    await loadReview(selectedCycleId, selectedUserId);
  }

  async function exportReport(format: "csv" | "pdf") {
    if (!selectedCycleId) return;
    setExporting(format);
    setMessage(null);

    const res = await fetch(
      `/api/admin/export?workspaceId=${encodeURIComponent(workspaceId)}&cycleId=${encodeURIComponent(selectedCycleId)}&format=${format}`,
      { method: "GET" }
    );

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setMessage(parseApiMessage(body, `${format.toUpperCase()} 내보내기에 실패했습니다.`));
      setExporting(null);
      return;
    }

    const blob = await res.blob();
    const downloadUrl = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = downloadUrl;
    anchor.download = `performance-${selectedCycleId}.${format}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(downloadUrl);

    setExporting(null);
    setMessage(`${format.toUpperCase()} 파일을 내보냈습니다.`);
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm text-[var(--ink-default)]">
          <span>평가 주기</span>
          <select
            value={selectedCycleId}
            onChange={(event) => setSelectedCycleId(event.target.value)}
            className="field-input"
          >
            {cycles.map((cycle) => (
              <option key={cycle.id} value={cycle.id}>
                {cycle.title} ({CYCLE_STATUS_COPY[cycle.status]})
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-[var(--ink-default)]">
          <span>구성원</span>
          <select
            value={selectedUserId}
            onChange={(event) => setSelectedUserId(event.target.value)}
            className="field-input"
          >
            {selectableMembers.map((member) => (
              <option key={member.userId} value={member.userId}>
                {member.userId} ({ROLE_COPY[member.role]})
              </option>
            ))}
          </select>
        </label>
      </section>

      <section className="flex flex-wrap gap-2 border-b border-[var(--line-default)] pb-5">
        <button
          type="button"
          disabled={!selectedCycleId || exporting !== null}
          onClick={() => exportReport("csv")}
          className="btn-secondary py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting === "csv" ? "CSV 내보내는 중..." : "CSV 내보내기"}
        </button>
        <button
          type="button"
          disabled={!selectedCycleId || exporting !== null}
          onClick={() => exportReport("pdf")}
          className="btn-secondary py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
        >
          {exporting === "pdf" ? "PDF 내보내는 중..." : "PDF 내보내기"}
        </button>
      </section>

      {loading ? (
        <p className="muted-copy text-sm">로딩 중...</p>
      ) : !selectedCycleId || !selectedUserId ? (
        <p className="empty-note">
          리뷰할 주기 또는 구성원이 없습니다. 먼저 평가 주기와 멤버를 확인하세요.
        </p>
      ) : review ? (
        <section className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="kpi-card">
              <p className="kpi-label">참고 점수</p>
              <p className="kpi-value">{review.scorePreview.toFixed(2)}</p>
            </div>
            <div className="kpi-card">
              <p className="kpi-label">상태</p>
              <p className="mt-2 text-sm text-[var(--ink-default)]">
                {review.lockedAt
                  ? `확정됨 (${new Date(review.lockedAt).toLocaleString("ko-KR")})`
                  : "초안"}
              </p>
            </div>
          </div>

          <div className="list-table-wrap">
            <table className="list-table">
              <thead>
                <tr>
                  <th>항목</th>
                  <th>원시값</th>
                  <th>정규화값</th>
                </tr>
              </thead>
              <tbody>
                {(
                  [
                    ["execution", "실행"],
                    ["docs", "문서"],
                    ["goals", "목표/KR"],
                    ["collaboration", "협업"],
                  ] as const
                ).map(([key, label]) => (
                  <tr key={key}>
                    <td className="font-semibold text-[var(--ink-strong)]">{label}</td>
                    <td>{review.evidencePack.raw[key]}</td>
                    <td>{review.evidencePack.normalized[key].toFixed(4)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-[var(--ink-strong)]">증거팩 하이라이트</p>
            <ul className="space-y-1 text-sm text-[var(--ink-default)]">
              {review.evidencePack.highlights.map((line) => (
                <li
                  key={line}
                  className="rounded-xl border border-[var(--line-soft)] bg-[var(--surface-base)] px-3 py-2"
                >
                  {line}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-4">
            <label className="flex flex-col gap-1 text-sm text-[var(--ink-default)]">
              <span>관리자 메모</span>
              <textarea
                value={managerNote}
                disabled={Boolean(review.lockedAt)}
                onChange={(event) => setManagerNote(event.target.value)}
                className="field-input min-h-28"
                placeholder="평가 참고 메모"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm text-[var(--ink-default)]">
              <span>최종 평점 (수동 입력)</span>
              <input
                value={finalRating}
                disabled={Boolean(review.lockedAt)}
                onChange={(event) => setFinalRating(event.target.value)}
                className="field-input"
                placeholder="예: A, B+, 기대수준 충족"
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={saving || Boolean(review.lockedAt)}
                onClick={() => saveReview(false)}
                className="btn-secondary py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                저장
              </button>
              <button
                type="button"
                disabled={saving || Boolean(review.lockedAt)}
                onClick={() => saveReview(true)}
                className="btn-primary py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                확정 및 잠금
              </button>
            </div>
          </div>
        </section>
      ) : (
        <p className="empty-note">리뷰 데이터를 불러올 수 없습니다.</p>
      )}

      {message && (
        <p className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-base)] px-3 py-2 text-sm text-[var(--ink-default)]">
          {message}
        </p>
      )}
    </div>
  );
}
