import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { getLatestPosts } from "@/lib/blog";
import { ArrowRight } from "lucide-react";
import { BlogCard } from "@/components/sections/BlogCard";

export async function LatestPosts() {
  const t = await getTranslations("blog");
  const posts = getLatestPosts(3);

  if (posts.length === 0) return null;

  return (
    <div>
      <div className="flex items-end justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("latestTitle")}
          </h2>
          <p className="text-muted-foreground">{t("latestSubtitle")}</p>
        </div>
        <Link
          href="/blog"
          className="hidden items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground sm:flex"
        >
          {t("viewAll")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-10 flex flex-col gap-8">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>

      <Link
        href="/blog"
        className="mt-8 inline-flex items-center gap-1 font-mono text-sm text-muted-foreground transition-colors hover:text-foreground sm:hidden"
      >
        {t("viewAll")}
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
