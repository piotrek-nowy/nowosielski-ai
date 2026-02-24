"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart, MessageCircle, Repeat2, ExternalLink } from "lucide-react";

type Tweet = {
  id: string;
  text: string;
  created_at: string;
  metrics: {
    retweet_count: number;
    reply_count: number;
    like_count: number;
    quote_count: number;
  };
  url: string;
};

type TweetUser = {
  name: string;
  username: string;
  profile_image_url: string;
};

type TweetsResponse = {
  user: TweetUser;
  tweets: Tweet[];
};

function formatRelativeTime(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = now - date;

  const minutes = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);

  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return new Date(dateStr).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function linkifyText(text: string): React.ReactNode[] {
  const combined = /(https?:\/\/[^\s]+|@\w+|#\w+)/g;
  const parts = text.split(combined);

  return parts.map((part, i) => {
    if (/^https?:\/\//.test(part)) {
      const display = part.replace(/^https?:\/\/(www\.)?/, "");
      return (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline dark:text-blue-400"
          onClick={(e) => e.stopPropagation()}
        >
          {display.length > 30 ? display.slice(0, 30) + "…" : display}
        </a>
      );
    }
    if (/^@\w+/.test(part)) {
      return (
        <a
          key={i}
          href={`https://x.com/${part.slice(1)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline dark:text-blue-400"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    if (/^#\w+/.test(part)) {
      return (
        <a
          key={i}
          href={`https://x.com/hashtag/${part.slice(1)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline dark:text-blue-400"
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function TweetSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-border/50 bg-card p-5">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-full bg-muted" />
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-4 w-24 rounded bg-muted" />
            <div className="h-3 w-16 rounded bg-muted" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-full rounded bg-muted" />
            <div className="h-3 w-3/4 rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function LatestTweets() {
  const t = useTranslations("tweets");
  const [data, setData] = useState<TweetsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/tweets")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((json: TweetsResponse) => {
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  if (error) return null;

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
          href="https://x.com/piotrek_nowy"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
        >
          {t("followMe")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="mt-8 flex flex-col gap-4">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => <TweetSkeleton key={i} />)
          : data?.tweets.map((tweet) => (
              <a
                key={tweet.id}
                href={tweet.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group block rounded-xl border border-border/50 bg-card p-5 transition-colors hover:border-border hover:bg-accent/30"
              >
                <div className="flex items-start gap-3">
                  {data.user.profile_image_url && (
                    <img
                      src={data.user.profile_image_url}
                      alt={data.user.name}
                      className="h-10 w-10 rounded-full"
                    />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-semibold text-foreground">
                        {data.user.name}
                      </span>
                      <span className="shrink-0 text-sm text-muted-foreground">
                        @{data.user.username}
                      </span>
                      <span className="text-muted-foreground/50">·</span>
                      <time className="shrink-0 text-sm text-muted-foreground">
                        {formatRelativeTime(tweet.created_at)}
                      </time>
                    </div>

                    <p className="mt-1.5 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground/90">
                      {linkifyText(tweet.text)}
                    </p>

                    <div className="mt-3 flex items-center gap-5 text-muted-foreground">
                      <span className="flex items-center gap-1.5 text-xs">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {formatCount(tweet.metrics.reply_count)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs">
                        <Repeat2 className="h-3.5 w-3.5" />
                        {formatCount(
                          tweet.metrics.retweet_count + tweet.metrics.quote_count
                        )}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs">
                        <Heart className="h-3.5 w-3.5" />
                        {formatCount(tweet.metrics.like_count)}
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
      </div>

      <a
        href="https://x.com/piotrek_nowy"
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
