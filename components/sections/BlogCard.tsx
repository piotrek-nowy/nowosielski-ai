import { Link } from "@/i18n/navigation";
import type { BlogPost } from "@/lib/blog";
import { Calendar, Clock, Tag } from "lucide-react";

const categoryColors: Record<string, string> = {
  AI: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  Bootstrap:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  Dziennik:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  Random: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300",
};

type Props = {
  post: BlogPost;
};

export function BlogCard({ post }: Props) {
  return (
    <article className="group relative flex flex-col gap-3 border-b border-border/60 pb-8">
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 font-medium ${categoryColors[post.category] ?? categoryColors.Random}`}
        >
          <Tag className="h-3 w-3" />
          {post.category}
        </span>
        <span className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(post.date).toLocaleDateString("pl-PL", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {post.readingTime} min
        </span>
        <span className="rounded-full border border-border px-2 py-0.5 font-mono text-[10px] uppercase">
          {post.lang}
        </span>
      </div>

      <Link href={`/blog/${post.slug}`} className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight text-foreground transition-colors group-hover:text-foreground/70 sm:text-2xl">
          {post.title}
        </h2>
        <p className="text-base leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
      </Link>

      <Link
        href={`/blog/${post.slug}`}
        className="mt-1 inline-flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Czytaj dalej
        <span className="transition-transform group-hover:translate-x-0.5">
          &rarr;
        </span>
      </Link>
    </article>
  );
}
