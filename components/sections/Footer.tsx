import { SocialIcons } from "@/components/SocialIcons";

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-background/50">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 py-12 sm:px-6 md:flex-row md:justify-between">
        <SocialIcons />
        <p className="font-mono text-xs text-muted-foreground">
          Built from scratch, 23 Feb 2026
        </p>
      </div>
    </footer>
  );
}
