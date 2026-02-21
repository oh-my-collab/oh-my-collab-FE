import {
  defaultAdminDeps,
  ensureWorkspaceAdmin,
  handleAdminError,
  type AdminRouteDeps,
} from "../shared";

type ExportFormat = "csv" | "pdf";

function parseExportQuery(url: string) {
  const searchParams = new URL(url).searchParams;
  const workspaceId = searchParams.get("workspaceId");
  const cycleId = searchParams.get("cycleId");
  const format = searchParams.get("format");
  if (
    !workspaceId ||
    !cycleId ||
    (format !== "csv" && format !== "pdf")
  ) {
    throw new Error("INVALID_INPUT");
  }
  return {
    workspaceId,
    cycleId,
    format: format as ExportFormat,
  };
}

function toCsvCell(value: string | number | null | undefined) {
  const raw = String(value ?? "");
  if (/[",\n]/.test(raw)) {
    return `"${raw.replaceAll('"', '""')}"`;
  }
  return raw;
}

function buildCsv(rows: Array<Record<string, unknown>>) {
  const headers = [
    "userId",
    "scorePreview",
    "finalRating",
    "managerNote",
    "lockedAt",
    "executionRaw",
    "docsRaw",
    "goalsRaw",
    "collaborationRaw",
  ];
  const csvRows = rows.map((row) =>
    [
      row.userId,
      row.scorePreview,
      row.finalRating,
      row.managerNote,
      row.lockedAt,
      row.executionRaw,
      row.docsRaw,
      row.goalsRaw,
      row.collaborationRaw,
    ]
      .map((cell) => toCsvCell(cell as string | number | null | undefined))
      .join(",")
  );
  return [headers.join(","), ...csvRows].join("\n");
}

function escapePdfText(value: string) {
  return value.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)");
}

function buildPdf(lines: string[]) {
  const safeLines = lines.slice(0, 48).map((line) => escapePdfText(line));
  const contentStream = [
    "BT",
    "/F1 10 Tf",
    "50 760 Td",
    "14 TL",
    ...safeLines.map((line, index) => (index === 0 ? `(${line}) Tj` : `T* (${line}) Tj`)),
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${Buffer.byteLength(contentStream, "utf8")} >> stream\n${contentStream}\nendstream endobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];

  let offset = "%PDF-1.4\n".length;
  const offsets = [0];
  let body = "";
  for (const object of objects) {
    offsets.push(offset);
    body += `${object}\n`;
    offset += `${object}\n`.length;
  }

  const xrefOffset = offset;
  const xrefLines = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];
  for (let index = 1; index < offsets.length; index += 1) {
    xrefLines.push(`${String(offsets[index]).padStart(10, "0")} 00000 n `);
  }
  const trailer = [
    "trailer",
    `<< /Size ${objects.length + 1} /Root 1 0 R >>`,
    "startxref",
    String(xrefOffset),
    "%%EOF",
  ].join("\n");

  const pdf = `%PDF-1.4\n${body}${xrefLines.join("\n")}\n${trailer}`;
  return Buffer.from(pdf, "utf8");
}

export function createAdminExportHandlers(deps: AdminRouteDeps) {
  return {
    GET: async (request: Request) => {
      try {
        const requesterId = await deps.getUserId(request);
        const store = await deps.getStore();
        const { workspaceId, cycleId, format } = parseExportQuery(request.url);
        await ensureWorkspaceAdmin(store, workspaceId, requesterId);

        const members = await store.listMembershipsByWorkspace(workspaceId);
        const cycle = await store.getPerformanceCycleById(workspaceId, cycleId);
        if (!cycle) throw new Error("NOT_FOUND");

        const reviewRows = await Promise.all(
          members.map(async (member) => {
            const evidence = await store.buildEvidencePack(
              workspaceId,
              cycleId,
              member.userId
            );
            const review = await store.getPerformanceReview(
              workspaceId,
              cycleId,
              member.userId
            );
            return {
              userId: member.userId,
              scorePreview: review?.scorePreview ?? evidence?.scorePreview ?? 0,
              finalRating: review?.finalRating ?? "",
              managerNote: review?.managerNote ?? "",
              lockedAt: review?.lockedAt ?? "",
              executionRaw: evidence?.evidencePack.raw.execution ?? 0,
              docsRaw: evidence?.evidencePack.raw.docs ?? 0,
              goalsRaw: evidence?.evidencePack.raw.goals ?? 0,
              collaborationRaw: evidence?.evidencePack.raw.collaboration ?? 0,
            };
          })
        );

        await store.addAdminAuditLog({
          workspaceId,
          actorUserId: requesterId,
          action: "performance_exported",
          payload: { cycleId, format, rowCount: reviewRows.length },
        });

        if (format === "csv") {
          const csv = buildCsv(reviewRows);
          return new Response(csv, {
            status: 200,
            headers: {
              "content-type": "text/csv; charset=utf-8",
              "content-disposition": `attachment; filename="performance-${cycleId}.csv"`,
            },
          });
        }

        const lines = [
          `oh-my-collab performance export`,
          `cycle: ${cycle.title}`,
          `period: ${cycle.periodStart} ~ ${cycle.periodEnd}`,
          "",
          ...reviewRows.map(
            (row) =>
              `${row.userId} | score:${row.scorePreview} | rating:${row.finalRating || "-"} | exec:${row.executionRaw} docs:${row.docsRaw} goals:${row.goalsRaw} collab:${row.collaborationRaw}`
          ),
        ];
        const pdf = buildPdf(lines);
        return new Response(pdf, {
          status: 200,
          headers: {
            "content-type": "application/pdf",
            "content-disposition": `attachment; filename="performance-${cycleId}.pdf"`,
          },
        });
      } catch (error) {
        return handleAdminError(error);
      }
    },
  };
}

const handlers = createAdminExportHandlers(defaultAdminDeps);

export const GET = handlers.GET;
