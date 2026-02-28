"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Column<T> = {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
};

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  pageSize = 10,
}: {
  columns: Column<T>[];
  rows: T[];
  pageSize?: number;
}) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);

  const sortedRows = useMemo(() => {
    const next = [...rows];
    if (!sortKey) return next;

    next.sort((a, b) => {
      const va = a[sortKey];
      const vb = b[sortKey];
      if (typeof va === "number" && typeof vb === "number") {
        return sortDirection === "asc" ? va - vb : vb - va;
      }
      return sortDirection === "asc"
        ? String(va).localeCompare(String(vb))
        : String(vb).localeCompare(String(va));
    });
    return next;
  }, [rows, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-3">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead key={String(column.key)}>
                  {column.sortable ? (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground"
                      onClick={() => {
                        if (sortKey !== column.key) {
                          setSortKey(column.key);
                          setSortDirection("asc");
                          return;
                        }
                        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
                      }}
                    >
                      {column.label}
                      {sortKey === column.key ? (
                        sortDirection === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : null}
                    </button>
                  ) : (
                    column.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRows.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                {columns.map((column) => (
                  <TableCell key={`${String(column.key)}-${rowIndex}`}>
                    {column.render
                      ? column.render(row[column.key], row)
                      : String(row[column.key] ?? "-")}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          총 {rows.length}건 · {page}/{totalPages} 페이지
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.max(1, prev - 1))}
            disabled={page <= 1}
          >
            이전
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={page >= totalPages}
          >
            다음
          </Button>
        </div>
      </div>
    </div>
  );
}
