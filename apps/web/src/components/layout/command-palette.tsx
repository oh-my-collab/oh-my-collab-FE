"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

import type { SidebarItem } from "./sidebar";

type CommandPaletteProps = {
  items: SidebarItem[];
  onClose: () => void;
};

export function CommandPalette({ items, onClose }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onClose]);

  const filteredItems = useMemo(() => {
    if (!query.trim()) return items;
    const normalizedQuery = query.trim().toLowerCase();
    return items.filter((item) => item.label.toLowerCase().includes(normalizedQuery));
  }, [items, query]);

  return (
    <div className="fixed inset-0 z-40 flex items-start justify-center px-4 pt-[10vh]">
      <button
        type="button"
        aria-label="명령 팔레트 닫기"
        className="absolute inset-0 bg-[rgba(28,52,110,0.36)]"
        onClick={onClose}
      />

      <section className="relative z-10 w-full max-w-2xl rounded-2xl border border-[var(--line-default)] bg-[var(--surface-raised)] p-3 shadow-[var(--shadow-pop)]">
        <div className="rounded-xl border border-[var(--line-default)] bg-[var(--surface-base)] px-3 py-2">
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="이동할 페이지를 검색하세요. 예: 작업, 문서, 관리"
            className="w-full border-none bg-transparent text-sm text-[var(--ink-default)] placeholder:text-[var(--ink-subtle)] focus:outline-none"
          />
        </div>

        <p className="mt-2 px-1 text-xs text-[var(--ink-subtle)]">
          방향키 대신 검색 후 Enter 또는 클릭으로 이동할 수 있습니다.
        </p>

        <ul className="mt-3 max-h-[45vh] space-y-1 overflow-auto">
          {filteredItems.map((item) => (
            <li key={item.path}>
              <Link
                href={item.href}
                onClick={onClose}
                className="flex items-center justify-between rounded-xl border border-transparent px-3 py-2 text-sm text-[var(--ink-default)] transition hover:border-[var(--line-default)] hover:bg-[var(--surface-soft)]"
              >
                <span>{item.label}</span>
                <span className="text-xs text-[var(--ink-subtle)]">이동</span>
              </Link>
            </li>
          ))}
          {filteredItems.length === 0 && (
            <li className="empty-note">검색 결과가 없습니다.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
