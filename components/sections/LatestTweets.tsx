"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ExternalLink } from "lucide-react";

const TWITTER_HANDLE = "piotrek_nowy";
const TWEET_LIMIT = 5;

declare global {
  interface Window {
    twttr?: {
      widgets: {
        createTimeline: (
          source: { sourceType: string; screenName: string },
          target: HTMLElement,
          options: Record<string, unknown>
        ) => Promise<HTMLElement>;
      };
      ready: (fn: () => void) => void;
    };
  }
}

function loadTwitterScript(): Promise<void> {
  return new Promise((resolve) => {
    if (window.twttr) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src = "https://platform.twitter.com/widgets.js";
    script.async = true;
    script.onload = () => {
      window.twttr?.ready(() => resolve());
    };
    document.head.appendChild(script);
  });
}

export function LatestTweets() {
  const t = useTranslations("tweets");
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const renderTimeline = useCallback(async () => {
    if (!containerRef.current || !mounted) return;

    containerRef.current.innerHTML = "";
    setLoaded(false);

    try {
      await loadTwitterScript();

      if (!containerRef.current || !window.twttr) return;

      await window.twttr.widgets.createTimeline(
        { sourceType: "profile", screenName: TWITTER_HANDLE },
        containerRef.current,
        {
          theme: resolvedTheme === "dark" ? "dark" : "light",
          tweetLimit: TWEET_LIMIT,
          chrome: "noheader nofooter noborders transparent",
          dnt: true,
          width: "100%",
        }
      );

      setLoaded(true);
    } catch {
      setLoaded(true);
    }
  }, [resolvedTheme, mounted]);

  useEffect(() => {
    renderTimeline();
  }, [renderTimeline]);

  return (
    <div>
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h2>
          <p className="text-muted-foreground">{t("subtitle")}</p>
        </div>
        <a
          href={`https://x.com/${TWITTER_HANDLE}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
        >
          {t("followMe")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border border-border/50">
        {!loaded && (
          <div className="flex flex-col gap-4 p-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 shrink-0 rounded-full bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-32 rounded bg-muted" />
                    <div className="h-3 w-20 rounded bg-muted" />
                  </div>
                </div>
                <div className="space-y-2 pl-[52px]">
                  <div className="h-3 w-full rounded bg-muted" />
                  <div className="h-3 w-4/5 rounded bg-muted" />
                </div>
              </div>
            ))}
          </div>
        )}
        <div ref={containerRef} className={loaded ? "" : "h-0 overflow-hidden"} />
      </div>

      <a
        href={`https://x.com/${TWITTER_HANDLE}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-6 inline-flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
      >
        {t("followMe")}
        <ExternalLink className="h-3.5 w-3.5" />
      </a>
    </div>
  );
}
