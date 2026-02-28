export const queryKeys = {
  session: ["session"] as const,
  orgs: ["orgs"] as const,
  org: (orgId: string) => ["org", orgId] as const,
  reposByOrg: (orgId: string) => ["repos", orgId] as const,
  repo: (repoId: string) => ["repo", repoId] as const,
  repoActivity: (repoId: string) => ["repoActivity", repoId] as const,
  issues: (params: string) => ["issues", params] as const,
  issue: (issueId: string) => ["issue", issueId] as const,
  requests: (orgId: string) => ["requests", orgId] as const,
  reportsSummary: (orgId: string, period: string) => ["reportsSummary", orgId, period] as const,
  reportUser: (orgId: string, userId: string, period: string) =>
    ["reportUser", orgId, userId, period] as const,
  notifications: ["notifications"] as const,
  settings: ["settings"] as const,
};
