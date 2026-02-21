import { createClient, type PostgrestError } from "@supabase/supabase-js";
import { z } from "zod";

import { parseEnv } from "../src/lib/env";

type SeedArgs = {
  ownerUserId: string;
  workspaceName: string;
};

type SeedSummary = {
  workspaceId: string;
  workspaceName: string;
  docs: number;
  tasks: number;
  goals: number;
  keyResults: number;
  activityEvents: number;
};

const seedArgsSchema = z.object({
  ownerUserId: z.string().uuid(),
  workspaceName: z.string().min(1).max(120),
});

function parseSeedArgs(argv: string[]): SeedArgs {
  const parsed: Partial<SeedArgs> = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (token.startsWith("--owner-user-id=")) {
      parsed.ownerUserId = token.slice("--owner-user-id=".length).trim();
      continue;
    }
    if (token === "--owner-user-id") {
      parsed.ownerUserId = (argv[index + 1] ?? "").trim();
      index += 1;
      continue;
    }

    if (token.startsWith("--workspace-name=")) {
      parsed.workspaceName = token.slice("--workspace-name=".length).trim();
      continue;
    }
    if (token === "--workspace-name") {
      parsed.workspaceName = (argv[index + 1] ?? "").trim();
      index += 1;
    }
  }

  return seedArgsSchema.parse(parsed);
}

function usage() {
  return [
    "Usage:",
    "  npm --prefix apps/web run seed -- --owner-user-id <UUID> --workspace-name \"<name>\"",
  ].join("\n");
}

function requireData<T>(
  data: T | null,
  error: PostgrestError | null,
  context: string
): T {
  if (error) {
    throw new Error(`${context}: ${error.message}`);
  }
  if (data === null) {
    throw new Error(`${context}: empty response`);
  }
  return data;
}

async function runSeed({ ownerUserId, workspaceName }: SeedArgs) {
  const env = parseEnv(process.env);
  const supabase = createClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );

  const workspaceInsert = await supabase
    .from("workspaces")
    .insert({
      name: workspaceName,
      created_by: ownerUserId,
    })
    .select("id, name")
    .single();
  const workspace = requireData(
    workspaceInsert.data,
    workspaceInsert.error,
    "workspace insert failed"
  );

  const membershipInsert = await supabase.from("workspace_members").insert({
    workspace_id: workspace.id,
    user_id: ownerUserId,
    role: "owner",
  });
  if (membershipInsert.error) {
    throw new Error(`owner membership insert failed: ${membershipInsert.error.message}`);
  }

  const docsSeed = [
    {
      workspace_id: workspace.id,
      title: "Kickoff Meeting Note",
      content: "프로젝트 킥오프 회의록",
      template_key: "meeting-note",
      created_by: ownerUserId,
      updated_by: ownerUserId,
    },
    {
      workspace_id: workspace.id,
      title: "Weekly Report - Week 1",
      content: "주간 진행상황과 이슈 정리",
      template_key: "weekly-report",
      created_by: ownerUserId,
      updated_by: ownerUserId,
    },
    {
      workspace_id: workspace.id,
      title: "Sprint Retrospective",
      content: "스프린트 회고와 액션 아이템",
      template_key: "retrospective",
      created_by: ownerUserId,
      updated_by: ownerUserId,
    },
  ];

  const tasksSeed = [
    {
      workspace_id: workspace.id,
      title: "요구사항 정리 문서 확정",
      description: "핵심 사용자 흐름과 승인 기준 정리",
      status: "done",
      assignee_id: ownerUserId,
      priority: "high",
      difficulty: 3,
      due_date: new Date(Date.now() - 86_400_000).toISOString(),
      checklist: ["핵심 시나리오 반영", "리스크 작성"],
      repeat_rule: "none",
      created_by: ownerUserId,
      updated_by: ownerUserId,
    },
    {
      workspace_id: workspace.id,
      title: "API 계약 리뷰",
      description: "프론트/백엔드 스키마 합의",
      status: "in_progress",
      assignee_id: ownerUserId,
      priority: "high",
      difficulty: 2,
      due_date: new Date(Date.now() + 86_400_000 * 2).toISOString(),
      checklist: ["필드 네이밍 정합", "에러 모델 확인"],
      repeat_rule: "none",
      created_by: ownerUserId,
      updated_by: ownerUserId,
    },
    {
      workspace_id: workspace.id,
      title: "배포 체크리스트 점검",
      description: "릴리스 전 환경값/권한 정책 재확인",
      status: "todo",
      assignee_id: ownerUserId,
      priority: "medium",
      difficulty: 2,
      due_date: new Date(Date.now() + 86_400_000 * 4).toISOString(),
      checklist: ["env 확인", "RLS 확인"],
      repeat_rule: "weekly",
      created_by: ownerUserId,
      updated_by: ownerUserId,
    },
  ];

  const goalsSeed = [
    {
      workspace_id: workspace.id,
      title: "온보딩 전환율 개선",
      description: "설정 완료까지 이탈률 감소",
      target_date: new Date(Date.now() + 86_400_000 * 30).toISOString().slice(0, 10),
      created_by: ownerUserId,
    },
    {
      workspace_id: workspace.id,
      title: "핵심 API 안정화",
      description: "CRUD 실패율 및 권한 오류 최소화",
      target_date: new Date(Date.now() + 86_400_000 * 21).toISOString().slice(0, 10),
      created_by: ownerUserId,
    },
  ];

  const docsInsert = await supabase.from("docs").insert(docsSeed).select("id");
  const docs = requireData(docsInsert.data, docsInsert.error, "docs insert failed");

  const tasksInsert = await supabase.from("tasks").insert(tasksSeed).select("id");
  const tasks = requireData(tasksInsert.data, tasksInsert.error, "tasks insert failed");

  const goalsInsert = await supabase
    .from("goals")
    .insert(goalsSeed)
    .select("id, title");
  const goals = requireData(goalsInsert.data, goalsInsert.error, "goals insert failed");
  const goalIdByTitle = new Map(
    goals.map((goal) => [String(goal.title), String(goal.id)])
  );

  const keyResultsSeed = [
    {
      workspace_id: workspace.id,
      goal_id: goalIdByTitle.get("온보딩 전환율 개선"),
      title: "설정 완료율 20% 향상",
      metric: "%",
      target_value: 20,
      current_value: 8,
      progress: 40,
      updated_by: ownerUserId,
    },
    {
      workspace_id: workspace.id,
      goal_id: goalIdByTitle.get("온보딩 전환율 개선"),
      title: "온보딩 가이드 이탈 구간 제거",
      metric: "count",
      target_value: 5,
      current_value: 2,
      progress: 40,
      updated_by: ownerUserId,
    },
    {
      workspace_id: workspace.id,
      goal_id: goalIdByTitle.get("핵심 API 안정화"),
      title: "권한 오류 재현 케이스 0건",
      metric: "count",
      target_value: 0,
      current_value: 1,
      progress: 80,
      updated_by: ownerUserId,
    },
    {
      workspace_id: workspace.id,
      goal_id: goalIdByTitle.get("핵심 API 안정화"),
      title: "주요 API 성공률 99%",
      metric: "%",
      target_value: 99,
      current_value: 96,
      progress: 70,
      updated_by: ownerUserId,
    },
  ].map((item) => {
    if (!item.goal_id) {
      throw new Error("key result goal mapping failed");
    }
    return item as {
      workspace_id: string;
      goal_id: string;
      title: string;
      metric: string;
      target_value: number;
      current_value: number;
      progress: number;
      updated_by: string;
    };
  });

  const keyResultsInsert = await supabase
    .from("goal_key_results")
    .insert(keyResultsSeed)
    .select("id");
  const keyResults = requireData(
    keyResultsInsert.data,
    keyResultsInsert.error,
    "key results insert failed"
  );

  const activityEventsSeed = [
    { workspace_id: workspace.id, actor_user_id: ownerUserId, event_type: "comment" },
    { workspace_id: workspace.id, actor_user_id: ownerUserId, event_type: "review" },
    {
      workspace_id: workspace.id,
      actor_user_id: ownerUserId,
      event_type: "blocker_resolved",
    },
    { workspace_id: workspace.id, actor_user_id: ownerUserId, event_type: "doc_updated" },
    { workspace_id: workspace.id, actor_user_id: ownerUserId, event_type: "goal_updated" },
  ];
  const activityInsert = await supabase
    .from("activity_events")
    .insert(activityEventsSeed)
    .select("id");
  const activityEvents = requireData(
    activityInsert.data,
    activityInsert.error,
    "activity events insert failed"
  );

  const summary: SeedSummary = {
    workspaceId: String(workspace.id),
    workspaceName: String(workspace.name),
    docs: docs.length,
    tasks: tasks.length,
    goals: goals.length,
    keyResults: keyResults.length,
    activityEvents: activityEvents.length,
  };

  console.log("[seed] completed");
  console.log(JSON.stringify(summary, null, 2));
}

async function main() {
  try {
    const args = parseSeedArgs(process.argv.slice(2));
    await runSeed(args);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[seed] invalid arguments");
      console.error(error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("\n"));
      console.error(usage());
      process.exit(1);
    }

    const message = error instanceof Error ? error.message : String(error);
    console.error(`[seed] failed: ${message}`);
    if (/--owner-user-id|--workspace-name/.test(message)) {
      console.error(usage());
    }
    process.exit(1);
  }
}

void main();
