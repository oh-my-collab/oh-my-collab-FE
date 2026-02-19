# Subscription-Free Collab Tool (Option A) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an MVP collaboration tool for capstone teams using Option A (`Vercel + Supabase`) with docs, tasks, goals/KR, dashboard, and contribution scoring.

**Architecture:** A Next.js App Router app runs on Vercel. Supabase provides Postgres + Auth + Row Level Security for team-isolated data. CRUD flows are implemented via Route Handlers/Server Actions, and analytics are computed with SQL views/functions plus lightweight API aggregation.

**Tech Stack:** Next.js (TypeScript), Supabase (Postgres/Auth/RLS), Zod, Vitest + Testing Library, Playwright, pnpm or npm.

---

## Execution Rules

- Follow `@test-driven-development` strictly for behavior changes.
- Before any completion claim, run fresh checks per `@verification-before-completion`.
- Keep commits small: one task = one commit.
- Use YAGNI: implement only MVP scope from `docs/plans/2026-02-19-subscription-free-collab-tool-design.md`.

## Task 1: Bootstrap App and Test Harness

**Files:**
- Create: `apps/web/*` (new Next.js app)
- Modify: `apps/web/package.json`
- Create: `apps/web/vitest.config.ts`
- Create: `apps/web/src/test/setup.ts`
- Create: `apps/web/playwright.config.ts`

**Step 1: Scaffold Next.js app in subdirectory**

Run:
```bash
npx create-next-app@latest apps/web --ts --eslint --src-dir --app --import-alias "@/*" --use-npm
```

**Step 2: Add testing dependencies**

Run:
```bash
npm --prefix apps/web install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react playwright
```

**Step 3: Add scripts and configs**

Add scripts to `apps/web/package.json`:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test"
  }
}
```

Create `apps/web/vitest.config.ts`:
```ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Step 4: Verify baseline**

Run:
```bash
npm --prefix apps/web run lint
npm --prefix apps/web run test
```

Expected:
- lint exits 0
- test exits 0 (0 tests is acceptable here)

**Step 5: Commit**

Run:
```bash
git add apps/web
git commit -m "chore: bootstrap next app with unit/e2e test harness"
```

## Task 2: Environment Validation + Health Endpoint

**Files:**
- Create: `apps/web/src/lib/env.ts`
- Create: `apps/web/src/lib/env.test.ts`
- Create: `apps/web/src/app/api/health/route.ts`
- Create: `apps/web/src/app/api/health/route.test.ts`

**Step 1: Write failing env test**

`apps/web/src/lib/env.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { parseEnv } from "./env";

describe("parseEnv", () => {
  it("throws when required keys are missing", () => {
    expect(() => parseEnv({} as NodeJS.ProcessEnv)).toThrow("NEXT_PUBLIC_SUPABASE_URL");
  });
});
```

**Step 2: Verify RED**

Run:
```bash
npm --prefix apps/web run test -- src/lib/env.test.ts
```

Expected: FAIL (`parseEnv` not implemented)

**Step 3: Minimal implementation**

`apps/web/src/lib/env.ts`:
```ts
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export const parseEnv = (input: NodeJS.ProcessEnv) => schema.parse(input);
```

**Step 4: Add health endpoint + test**

`apps/web/src/app/api/health/route.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("returns ok", async () => {
    const res = await GET();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: "ok" });
  });
});
```

`apps/web/src/app/api/health/route.ts`:
```ts
export async function GET() {
  return Response.json({ status: "ok" }, { status: 200 });
}
```

**Step 5: Verify GREEN**

Run:
```bash
npm --prefix apps/web run test -- src/lib/env.test.ts src/app/api/health/route.test.ts
```

Expected: PASS

**Step 6: Commit**

Run:
```bash
git add apps/web/src/lib/env.ts apps/web/src/lib/env.test.ts apps/web/src/app/api/health/route.ts apps/web/src/app/api/health/route.test.ts
git commit -m "feat: add env validation and health endpoint"
```

## Task 3: Supabase Clients + Auth Guard

**Files:**
- Create: `apps/web/src/lib/supabase/browser.ts`
- Create: `apps/web/src/lib/supabase/server.ts`
- Create: `apps/web/src/lib/auth/require-user.ts`
- Create: `apps/web/src/lib/auth/require-user.test.ts`
- Modify: `apps/web/middleware.ts`

**Step 1: Write failing auth guard test**

`apps/web/src/lib/auth/require-user.test.ts`:
```ts
import { describe, expect, it } from "vitest";
import { requireUser } from "./require-user";

describe("requireUser", () => {
  it("throws when user is null", async () => {
    await expect(requireUser(async () => ({ user: null }))).rejects.toThrow("UNAUTHORIZED");
  });
});
```

**Step 2: Verify RED**

Run:
```bash
npm --prefix apps/web run test -- src/lib/auth/require-user.test.ts
```

Expected: FAIL (`requireUser` missing)

**Step 3: Minimal implementation**

`apps/web/src/lib/auth/require-user.ts`:
```ts
type UserResult = { user: { id: string } | null };

export async function requireUser(getUser: () => Promise<UserResult>) {
  const { user } = await getUser();
  if (!user) throw new Error("UNAUTHORIZED");
  return user;
}
```

**Step 4: Wire middleware**

- Redirect unauthenticated access from `/app/*` to `/login`.
- Allow public routes: `/`, `/login`, `/api/health`.

**Step 5: Verify GREEN**

Run:
```bash
npm --prefix apps/web run test -- src/lib/auth/require-user.test.ts
npm --prefix apps/web run lint
```

Expected: PASS

**Step 6: Commit**

Run:
```bash
git add apps/web/src/lib/supabase apps/web/src/lib/auth apps/web/middleware.ts
git commit -m "feat: add supabase clients and auth guard baseline"
```

## Task 4: Database Schema + RLS + Workspace Bootstrap

**Files:**
- Create: `apps/web/supabase/migrations/20260219_001_init.sql`
- Create: `apps/web/src/app/api/workspaces/route.ts`
- Create: `apps/web/src/app/api/workspaces/route.test.ts`

**Step 1: Write failing workspace creation test**

Test behavior:
- POST `/api/workspaces` with `{name}` returns `201`
- creator is added to `workspace_members` as `owner`

**Step 2: Verify RED**

Run:
```bash
npm --prefix apps/web run test -- src/app/api/workspaces/route.test.ts
```

Expected: FAIL

**Step 3: Add schema + policies (minimal MVP tables)**

Create SQL objects:
- `workspaces`
- `workspace_members`
- `docs`
- `tasks`
- `goals`
- `goal_key_results`
- `activity_events`

RLS rule baseline:
- user can access rows where `workspace_id` belongs to their `workspace_members`.

**Step 4: Implement route handler**

`POST /api/workspaces` flow:
- validate input with zod
- use authenticated `user.id`
- transaction: insert workspace, insert owner membership

**Step 5: Verify GREEN**

Run:
```bash
npm --prefix apps/web run test -- src/app/api/workspaces/route.test.ts
```

Expected: PASS

**Step 6: Commit**

Run:
```bash
git add apps/web/supabase/migrations/20260219_001_init.sql apps/web/src/app/api/workspaces/route.ts apps/web/src/app/api/workspaces/route.test.ts
git commit -m "feat: add workspace schema, rls baseline, and bootstrap api"
```

## Task 5: Docs Module (Template-Based)

**Files:**
- Create: `apps/web/src/app/(app)/docs/page.tsx`
- Create: `apps/web/src/app/api/docs/route.ts`
- Create: `apps/web/src/app/api/docs/[docId]/route.ts`
- Create: `apps/web/src/app/api/docs/route.test.ts`
- Create: `apps/web/src/lib/docs/templates.ts`

**Step 1: Write failing docs API tests**

Cover:
- create doc with template key (`meeting-note`, `weekly-report`, `retrospective`)
- list docs for workspace only

**Step 2: Verify RED**

Run:
```bash
npm --prefix apps/web run test -- src/app/api/docs/route.test.ts
```

Expected: FAIL

**Step 3: Minimal implementation**

- CRUD for docs
- include `updated_by`, `updated_at`
- enforce workspace isolation in queries

**Step 4: Verify GREEN**

Run:
```bash
npm --prefix apps/web run test -- src/app/api/docs/route.test.ts
```

Expected: PASS

**Step 5: Commit**

Run:
```bash
git add apps/web/src/app/(app)/docs apps/web/src/app/api/docs apps/web/src/lib/docs/templates.ts
git commit -m "feat: implement docs module with templates and workspace isolation"
```

## Task 6: Kanban Tasks Module

**Files:**
- Create: `apps/web/src/app/(app)/tasks/page.tsx`
- Create: `apps/web/src/app/api/tasks/route.ts`
- Create: `apps/web/src/app/api/tasks/[taskId]/route.ts`
- Create: `apps/web/src/app/api/tasks/route.test.ts`

**Step 1: Write failing task tests**

Cover:
- create task (`todo`, assignee, priority, due_date)
- move task status (`todo -> in_progress -> done`)
- list by workspace

**Step 2: Verify RED**

Run:
```bash
npm --prefix apps/web run test -- src/app/api/tasks/route.test.ts
```

Expected: FAIL

**Step 3: Minimal implementation**

- status enum: `todo`, `in_progress`, `done`
- endpoints: create/list/update/delete

**Step 4: Verify GREEN**

Run:
```bash
npm --prefix apps/web run test -- src/app/api/tasks/route.test.ts
```

Expected: PASS

**Step 5: Commit**

Run:
```bash
git add apps/web/src/app/(app)/tasks apps/web/src/app/api/tasks
git commit -m "feat: implement kanban task api and page"
```

## Task 7: Goals + Key Results Module

**Files:**
- Create: `apps/web/src/app/(app)/goals/page.tsx`
- Create: `apps/web/src/app/api/goals/route.ts`
- Create: `apps/web/src/app/api/goals/[goalId]/key-results/route.ts`
- Create: `apps/web/src/app/api/goals/route.test.ts`

**Step 1: Write failing goals tests**

Cover:
- create goal
- add key result
- update weekly progress (0-100)

**Step 2: Verify RED**

Run:
```bash
npm --prefix apps/web run test -- src/app/api/goals/route.test.ts
```

Expected: FAIL

**Step 3: Minimal implementation**

- goal CRUD
- KR CRUD
- weekly progress update endpoint

**Step 4: Verify GREEN**

Run:
```bash
npm --prefix apps/web run test -- src/app/api/goals/route.test.ts
```

Expected: PASS

**Step 5: Commit**

Run:
```bash
git add apps/web/src/app/(app)/goals apps/web/src/app/api/goals
git commit -m "feat: implement goals and key results management"
```

## Task 8: Insights + Contribution Score v1

**Files:**
- Create: `apps/web/supabase/migrations/20260219_002_insights.sql`
- Create: `apps/web/src/app/(app)/insights/page.tsx`
- Create: `apps/web/src/app/api/insights/route.ts`
- Create: `apps/web/src/app/api/insights/route.test.ts`

**Step 1: Write failing insights tests**

Cover:
- dashboard summary returns:
  - weekly done tasks
  - goal achievement rate
  - upcoming due count
  - contribution score by member

**Step 2: Verify RED**

Run:
```bash
npm --prefix apps/web run test -- src/app/api/insights/route.test.ts
```

Expected: FAIL

**Step 3: Implement contribution formula**

Formula:
```text
contribution_score =
0.40*task_score + 0.20*docs_score + 0.25*goal_score + 0.15*collab_score
```

Implementation notes:
- normalize each component in SQL view
- return both score and raw component values (transparency)

**Step 4: Verify GREEN**

Run:
```bash
npm --prefix apps/web run test -- src/app/api/insights/route.test.ts
```

Expected: PASS

**Step 5: Commit**

Run:
```bash
git add apps/web/supabase/migrations/20260219_002_insights.sql apps/web/src/app/(app)/insights apps/web/src/app/api/insights
git commit -m "feat: add insights dashboard and contribution score v1"
```

## Task 9: Onboarding Flow + Deployment/Seed Docs

**Files:**
- Create: `apps/web/src/app/(marketing)/setup/page.tsx`
- Create: `apps/web/scripts/seed.ts`
- Create: `docs/deploy/vercel-supabase-quickstart.md`
- Create: `docs/deploy/env-checklist.md`

**Step 1: Write failing onboarding page test**

Cover:
- setup page renders 5 required steps:
  1) fork template
  2) vercel import
  3) env setup
  4) db migration
  5) workspace init

**Step 2: Verify RED**

Run:
```bash
npm --prefix apps/web run test -- src/app/(marketing)/setup/page.test.tsx
```

Expected: FAIL

**Step 3: Minimal implementation**

- create setup guide page
- add seed script for demo workspace/doc/task/goal data
- write deployment docs for 15-minute onboarding target

**Step 4: Verify GREEN**

Run:
```bash
npm --prefix apps/web run test -- src/app/(marketing)/setup/page.test.tsx
```

Expected: PASS

**Step 5: Commit**

Run:
```bash
git add apps/web/src/app/(marketing)/setup apps/web/scripts/seed.ts docs/deploy/vercel-supabase-quickstart.md docs/deploy/env-checklist.md
git commit -m "feat: add onboarding flow, seed script, and deployment guides"
```

## Task 10: Final Verification Gate

**Files:**
- Modify: `README.md`
- Modify: `apps/web/.env.example`
- Modify: `docs/plans/2026-02-19-subscription-free-collab-tool-design.md` (status updates if needed)

**Step 1: Run full verification suite (fresh)**

Run:
```bash
npm --prefix apps/web run lint
npm --prefix apps/web run test
npm --prefix apps/web run test:e2e
npm --prefix apps/web run build
```

Expected:
- all commands exit 0
- no skipped critical checks

**Step 2: Manual acceptance checklist**

Confirm manually:
- user signup/login works
- workspace isolation works (different users cannot read each other workspace data)
- docs/tasks/goals CRUD works
- insights page shows non-empty data with seed
- setup docs can be followed end-to-end

**Step 3: Update README**

Add:
- local run steps
- Supabase setup
- migration command
- seed command
- deploy command

**Step 4: Commit**

Run:
```bash
git add README.md apps/web/.env.example docs/plans/2026-02-19-subscription-free-collab-tool-design.md
git commit -m "docs: finalize runbook and verification checklist for option-a mvp"
```

---

## Definition of Done

- Option A architecture is fully wired (Vercel + Supabase Auth/DB/RLS).
- MVP scope from design doc section 8 is implemented.
- Contribution score v1 is visible with raw signals.
- Onboarding docs let a team leader complete setup in about 15 minutes.
- Full lint/test/e2e/build verification has fresh passing evidence.
