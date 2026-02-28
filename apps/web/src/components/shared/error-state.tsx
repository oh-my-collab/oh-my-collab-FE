import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ErrorState({
  title,
  description,
  onRetry,
}: {
  title: string;
  description: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-xl border border-red-300/40 bg-red-50/70 p-6 text-red-900 dark:border-red-500/40 dark:bg-red-950/40 dark:text-red-100">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5" aria-hidden="true" />
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="text-sm text-red-800/90 dark:text-red-100/80">{description}</p>
          {onRetry ? (
            <Button variant="outline" onClick={onRetry} aria-label="다시 시도">
              다시 시도
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
