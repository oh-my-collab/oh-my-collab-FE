import { Inbox } from "lucide-react";

import { Button } from "@/components/ui/button";

export function EmptyState({
  title,
  description,
  cta,
}: {
  title: string;
  description: string;
  cta?: { label: string; onClick: () => void };
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
      <Inbox className="mx-auto mb-3 h-8 w-8 text-muted-foreground" aria-hidden="true" />
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      {cta ? (
        <div className="mt-4">
          <Button onClick={cta.onClick}>{cta.label}</Button>
        </div>
      ) : null}
    </div>
  );
}
