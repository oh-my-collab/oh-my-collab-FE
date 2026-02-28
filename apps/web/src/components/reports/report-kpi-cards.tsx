import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportKpiCards({
  totalTasks,
  completedTasks,
  avgDifficulty,
}: {
  totalTasks: number;
  completedTasks: number;
  avgDifficulty: number;
}) {
  const completionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const cards = [
    { label: "총 작업 수", value: totalTasks },
    { label: "완료 작업 수", value: completedTasks },
    { label: "완료율", value: `${completionRate}%` },
    { label: "평균 난이도", value: avgDifficulty.toFixed(1) },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader className="pb-1">
            <CardTitle className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
