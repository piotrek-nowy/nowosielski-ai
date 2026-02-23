"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { handbookChapters } from "@/content/handbook/config";
import { cn } from "@/lib/utils";

export function HandbookSidebar() {
  const pathname = usePathname();
  const basePath = "/handbook";

  return (
    <aside className="w-56 shrink-0 border-r border-border pr-6">
      <nav className="sticky top-24 space-y-0.5">
        {handbookChapters.map(({ slug, title }) => {
          const href = `${basePath}/${slug}`;
          const isActive = pathname === href;
          return (
            <Link
              key={slug}
              href={href}
              className={cn(
                "block rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-accent font-medium text-foreground"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              )}
            >
              {title}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
