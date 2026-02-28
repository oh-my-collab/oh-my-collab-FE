"use client";

import { create } from "zustand";

type UiState = {
  activeOrgId: string | null;
  activeRepoId: string | null;
  issueSearch: string;
  boardRepoId: string | null;
  requestTab: "inbox" | "sent";
  setActiveOrgId: (orgId: string | null) => void;
  setActiveRepoId: (repoId: string | null) => void;
  setIssueSearch: (value: string) => void;
  setBoardRepoId: (repoId: string | null) => void;
  setRequestTab: (tab: "inbox" | "sent") => void;
};

export const useUiStore = create<UiState>((set) => ({
  activeOrgId: null,
  activeRepoId: null,
  issueSearch: "",
  boardRepoId: null,
  requestTab: "inbox",
  setActiveOrgId: (activeOrgId) => set({ activeOrgId }),
  setActiveRepoId: (activeRepoId) => set({ activeRepoId }),
  setIssueSearch: (issueSearch) => set({ issueSearch }),
  setBoardRepoId: (boardRepoId) => set({ boardRepoId }),
  setRequestTab: (requestTab) => set({ requestTab }),
}));
