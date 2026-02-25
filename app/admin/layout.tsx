import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowLeft } from "lucide-react";

type Props = { children: ReactNode };

export default function AdminLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-border/40 bg-background/80">
        <div className="mx-auto flex max-w-4xl items-center px-4 py-3">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Powrót na stronę główną
          </Link>
        </div>
      </div>
      {children}
    </div>
  );
}
