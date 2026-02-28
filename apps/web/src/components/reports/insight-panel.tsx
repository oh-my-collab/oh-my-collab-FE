import { AlertTriangle, Lightbulb, Sparkles } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AiEvidence, NextAction, RiskItem } from "@/features/shared/types";

export function InsightPanel({
  evidence,
  risks,
  nextActions,
}: {
  evidence: AiEvidence;
  risks: RiskItem[];
  nextActions: NextAction[];
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4" />
            AI 판단 근거
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="text-xs text-muted-foreground">{evidence.model} · {evidence.promptVersion}</p>
          <ul className="list-disc space-y-1 pl-5">
            {evidence.reasoning.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <AlertTriangle className="h-4 w-4" />
            리스크
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="space-y-2">
            {risks.map((risk) => (
              <li key={risk.id} className="rounded-md border border-border p-2">
                <p className="font-semibold">{risk.title}</p>
                <p className="text-xs text-muted-foreground">{risk.description}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lightbulb className="h-4 w-4" />
            다음 액션
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <ul className="space-y-2">
            {nextActions.map((action) => (
              <li key={action.id} className="rounded-md border border-border p-2">
                <p className="font-semibold">{action.title}</p>
                <p className="text-xs text-muted-foreground">담당: {action.owner}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
