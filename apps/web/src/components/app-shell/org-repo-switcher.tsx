"use client";

import { useEffect } from "react";

import { Select } from "@/components/ui/select";
import { useOrganizationsQuery } from "@/features/orgs/queries";
import { useRepositoriesByOrgQuery } from "@/features/repos/queries";
import { useUiStore } from "@/features/shared/ui-store";

export function OrgRepoSwitcher() {
  const { data: orgData } = useOrganizationsQuery();
  const activeOrgId = useUiStore((state) => state.activeOrgId);
  const activeRepoId = useUiStore((state) => state.activeRepoId);
  const setActiveOrgId = useUiStore((state) => state.setActiveOrgId);
  const setActiveRepoId = useUiStore((state) => state.setActiveRepoId);

  const resolvedOrgId = activeOrgId ?? orgData?.defaultOrgId ?? orgData?.organizations[0]?.id ?? null;

  const { data: repoData } = useRepositoriesByOrgQuery(resolvedOrgId ?? "");

  useEffect(() => {
    if (!resolvedOrgId) return;
    if (!activeOrgId) setActiveOrgId(resolvedOrgId);
  }, [activeOrgId, resolvedOrgId, setActiveOrgId]);

  useEffect(() => {
    const firstRepoId = repoData?.repositories[0]?.id;
    if (!firstRepoId) return;
    if (!activeRepoId) setActiveRepoId(firstRepoId);
  }, [activeRepoId, repoData?.repositories, setActiveRepoId]);

  return (
    <div className="grid gap-2">
      <div>
        <label className="mb-1 block text-xs font-semibold text-muted-foreground">조직</label>
        <Select
          aria-label="조직 선택"
          value={resolvedOrgId ?? ""}
          onChange={(event) => {
            setActiveOrgId(event.target.value);
            setActiveRepoId(null);
          }}
        >
          {(orgData?.organizations ?? []).map((org) => (
            <option key={org.id} value={org.id}>
              {org.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-muted-foreground">레포지토리</label>
        <Select
          aria-label="레포지토리 선택"
          value={activeRepoId ?? ""}
          onChange={(event) => setActiveRepoId(event.target.value)}
          disabled={!repoData?.repositories.length}
        >
          {(repoData?.repositories ?? []).map((repo) => (
            <option key={repo.id} value={repo.id}>
              {repo.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
