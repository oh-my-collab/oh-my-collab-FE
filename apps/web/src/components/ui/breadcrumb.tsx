import { ChevronRight } from "lucide-react";
import Link from "next/link";

export function BreadcrumbNav({
  items,
}: {
  items: Array<{ label: string; href?: string }>;
}) {
  return (
    <nav aria-label="breadcrumb" className="flex items-center gap-1 text-xs text-muted-foreground">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <div key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.href && !isLast ? (
              <Link href={item.href} className="hover:text-foreground">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? "font-semibold text-foreground" : ""}>{item.label}</span>
            )}
            {!isLast ? <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" /> : null}
          </div>
        );
      })}
    </nav>
  );
}
