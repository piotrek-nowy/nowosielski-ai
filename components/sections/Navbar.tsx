"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navKeys = ["home", "blog", "backlog"] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="font-mono text-sm font-medium text-foreground hover:text-foreground/80"
        >
          nowosielski.ai
        </Link>
        <nav className="flex items-center gap-1">
          {navKeys.map((key) => {
            const href = key === "home" ? "/" : `/${key}`;
            const isActive =
              pathname === href ||
              (key !== "home" && pathname.startsWith(href));
            return (
              <Link key={key} href={href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-muted-foreground hover:text-foreground",
                    isActive && "text-foreground"
                  )}
                >
                  {t(key)}
                </Button>
              </Link>
            );
          })}
          <ThemeToggle />
          <LocaleSwitcher />
        </nav>
      </div>
    </header>
  );
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
    >
      {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

function LocaleSwitcher() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const switchTo = currentLocale === "pl" ? "en" : "pl";

  return (
    <Link href={pathname || "/"} locale={switchTo}>
      <Button variant="ghost" size="sm" className="text-muted-foreground">
        {switchTo === "en" ? "EN" : "PL"}
      </Button>
    </Link>
  );
}
