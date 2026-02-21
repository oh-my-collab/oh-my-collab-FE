export const DOC_TEMPLATES = {
  "meeting-note": {
    title: "회의록",
    defaultContent:
      "## 안건\n- \n\n## 의사결정\n- \n\n## 실행 항목\n- [ ] ",
  },
  "weekly-report": {
    title: "주간 리포트",
    defaultContent:
      "## 이번 주 진행 내용\n- \n\n## 이슈 및 리스크\n- \n\n## 다음 주 계획\n- ",
  },
  retrospective: {
    title: "회고",
    defaultContent:
      "## 계속할 점\n- \n\n## 개선할 점\n- \n\n## 다음 시도\n- ",
  },
} as const;

export type DocTemplateId = keyof typeof DOC_TEMPLATES;
