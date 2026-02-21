"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

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

type CyclesManagerProps = {
  workspaceId: string;
};

type WeightKey = "execution" | "docs" | "goals" | "collaboration";

const DEFAULT_WEIGHTS: Record<WeightKey, number> = {
  execution: 40,
  docs: 20,
  goals: 25,
  collaboration: 15,
};

const WEIGHT_META: Array<{ key: WeightKey; label: string }> = [
  { key: "execution", label: "실행" },
  { key: "docs", label: "문서" },
  { key: "goals", label: "목표/KR" },
  { key: "collaboration", label: "협업" },
];

function parseApiMessage(body: unknown, fallback: string) {
  if (body && typeof body === "object" && "message" in body) {
    const value = (body as { message?: unknown }).message;
    if (typeof value === "string") return value;
  }
  return fallback;
}

function toStartIso(date: string) {
  return new Date(`${date}T00:00:00.000Z`).toISOString();
}

function toEndIso(date: string) {
  return new Date(`${date}T23:59:59.999Z`).toISOString();
}

export function CyclesManager({ workspaceId }: CyclesManagerProps) {
  const [cycles, setCycles] = useState<Cycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyCycleId, setBusyCycleId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [message, setMessage] = useState<string | null>(null);

  const totalWeight = useMemo(
    () => weights.execution + weights.docs + weights.goals + weights.collaboration,
    [weights]
  );

  const canSubmit =
    title.trim().length > 0 &&
    startDate.length > 0 &&
    endDate.length > 0 &&
    Math.abs(totalWeight - 100) < 0.001;

  async function loadCycles() {
    setLoading(true);
    setMessage(null);
    const res = await fetch(
      `/api/admin/cycles?workspaceId=${encodeURIComponent(workspaceId)}`,
      { cache: "no-store" }
    );
    const body = await res.json();
    if (res.ok) {
      setCycles((body.cycles ?? []) as Cycle[]);
    } else {
      setMessage(parseApiMessage(body, "평가 주기 목록을 불러오지 못했습니다."));
    }
    setLoading(false);
  }

  useEffect(() => {
    loadCycles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [workspaceId]);

  const updateWeight = (key: WeightKey, value: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0)),
    }));
  };

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSubmit) return;

    setMessage(null);
    const res = await fetch("/api/admin/cycles", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        title: title.trim(),
        periodStart: toStartIso(startDate),
        periodEnd: toEndIso(endDate),
        status: "draft",
        weights,
      }),
    });

    const body = await res.json();
    if (!res.ok) {
      setMessage(parseApiMessage(body, "평가 주기 생성에 실패했습니다."));
      return;
    }

    setTitle("");
    setStartDate("");
    setEndDate("");
    setWeights(DEFAULT_WEIGHTS);
    setMessage("평가 주기를 생성했습니다.");
    await loadCycles();
  }

  async function updateCycleStatus(cycleId: string, status: Cycle["status"]) {
    setBusyCycleId(cycleId);
    setMessage(null);
    const res = await fetch(`/api/admin/cycles/${encodeURIComponent(cycleId)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        workspaceId,
        status,
      }),
    });
    const body = await res.json();
    if (!res.ok) {
      setMessage(parseApiMessage(body, "주기 상태 업데이트에 실패했습니다."));
      setBusyCycleId(null);
      return;
    }
    setMessage("주기 상태를 업데이트했습니다.");
    setBusyCycleId(null);
    await loadCycles();
  }

  return (
    <div className="space-y-8">
      <section className="space-y-4 border-b border-[var(--border)] pb-8">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">평가 주기 생성</h2>
          <p className="mt-1 text-sm text-slate-600">
            자동 산출 점수는 참고용이며 최종 평점은 관리자 수동 입력으로 확정됩니다.
          </p>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 xl:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm text-slate-700 xl:col-span-2">
            <span>주기 이름</span>
            <input
              required
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
              placeholder="예: 2026 상반기 평가"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            <span>시작일</span>
            <input
              required
              type="date"
              value={startDate}
              onChange={(event) => setStartDate(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm text-slate-700">
            <span>종료일</span>
            <input
              required
              type="date"
              value={endDate}
              onChange={(event) => setEndDate(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2"
            />
          </label>

          <div className="grid gap-3 xl:col-span-2">
            {WEIGHT_META.map(({ key, label }) => (
              <label
                key={key}
                className="grid gap-2 text-sm text-slate-700 md:grid-cols-[120px_1fr_84px]"
              >
                <span className="self-center">{label}</span>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(event) => updateWeight(key, Number(event.target.value))}
                />
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={weights[key]}
                  onChange={(event) => updateWeight(key, Number(event.target.value))}
                  className="rounded-md border border-slate-300 px-2 py-1.5"
                />
              </label>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 xl:col-span-2">
            <span className="text-sm text-slate-600">가중치 총합: {totalWeight}</span>
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              주기 생성
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">평가 주기 목록</h2>
        {loading ? (
          <p className="text-sm text-slate-500">로딩 중...</p>
        ) : (
          <div className="overflow-x-auto border border-[var(--border)] bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase tracking-[0.08em] text-slate-500">
                <tr>
                  <th className="px-4 py-3">주기</th>
                  <th className="px-4 py-3">기간</th>
                  <th className="px-4 py-3">상태</th>
                  <th className="px-4 py-3">작업</th>
                </tr>
              </thead>
              <tbody>
                {cycles.map((cycle) => (
                  <tr key={cycle.id} className="border-t border-[var(--border)]">
                    <td className="px-4 py-3 font-medium text-slate-900">{cycle.title}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {new Date(cycle.periodStart).toLocaleDateString()} -{" "}
                      {new Date(cycle.periodEnd).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-slate-700">{cycle.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {(["draft", "open", "closed"] as const).map((nextStatus) => (
                          <button
                            key={nextStatus}
                            type="button"
                            disabled={busyCycleId === cycle.id || cycle.status === nextStatus}
                            onClick={() => updateCycleStatus(cycle.id, nextStatus)}
                            className="rounded border border-slate-300 px-2 py-1 text-xs text-slate-700 disabled:cursor-not-allowed disabled:bg-slate-100"
                          >
                            {nextStatus}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
                {cycles.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-slate-500">
                      생성된 평가 주기가 없습니다.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {message && (
        <p className="rounded-md border border-[var(--border)] bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}
    </div>
  );
}
