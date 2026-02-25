import Link from "next/link";
import { SocialIcons } from "@/components/SocialIcons";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 sm:px-6 md:flex-row md:justify-between">
        <SocialIcons />
        <div className="flex items-center gap-4 font-mono text-xs text-muted-foreground">
          <p>Built from scratch, 23 Feb 2026</p>
          <Link
            href="/admin"
            className="transition-colors hover:text-foreground/70"
          >
            Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
