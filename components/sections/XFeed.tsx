"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement | null) => void;
        createTimeline: (
          source: { sourceType: string; screenName: string },
          el: HTMLElement,
          options?: Record<string, unknown>
        ) => Promise<HTMLElement>;
      };
    };
  }
}

export function XFeed() {
  const t = useTranslations("xfeed");
  const containerRef = useRef<HTMLDivElement>(null);
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (document.querySelector('script[src*="platform.twitter.com/widgets.js"]')) {
      setScriptLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => setScriptLoaded(true);
    document.body.appendChild(script);
  }, []);

  const renderTimeline = useCallback(() => {
    const el = containerRef.current;
    if (!el || !window.twttr?.widgets) return;

    el.innerHTML = "";
    window.twttr.widgets.createTimeline(
      { sourceType: "profile", screenName: "piotrek_nowy" },
      el,
      {
        theme: resolvedTheme === "dark" ? "dark" : "light",
        chrome: "noheader nofooter noborders transparent",
        tweetLimit: 5,
        dnt: true,
        width: "100%",
      }
    );
  }, [resolvedTheme]);

  useEffect(() => {
    if (scriptLoaded && mounted) {
      renderTimeline();
    }
  }, [scriptLoaded, mounted, renderTimeline]);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-foreground">
            {t("title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>
        <a
          href="https://x.com/piotrek_nowy"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          @piotrek_nowy
        </a>
      </div>
      <div
        ref={containerRef}
        className="min-h-[200px] overflow-hidden rounded-xl border border-border/60"
      />
    </section>
  );
}
