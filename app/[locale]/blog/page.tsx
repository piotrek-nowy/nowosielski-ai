import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { getAllPosts } from "@/lib/blog";
import { BlogCard } from "@/components/sections/BlogCard";
import type { Metadata } from "next";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "blog" });

  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("blog");
  const posts = await getAllPosts(locale as "pl" | "en");

  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          {t("heading")}
        </h1>
        <p className="text-lg text-muted-foreground">{t("subheading")}</p>
      </div>

      <div className="mt-12 flex flex-col gap-8">
        {posts.length > 0 ? (
          posts.map((post) => <BlogCard key={post.slug} post={post} />)
        ) : (
          <p className="text-muted-foreground">{t("noPosts")}</p>
        )}
      </div>
    </section>
  );
}
