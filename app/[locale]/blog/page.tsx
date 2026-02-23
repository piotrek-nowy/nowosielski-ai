import { setRequestLocale } from "next-intl/server";

type Props = { params: Promise<{ locale: string }> };

export default async function BlogPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-mono text-2xl font-semibold text-foreground">
        Blog
      </h1>
      <p className="mt-4 text-muted-foreground">Coming in Phase 2.</p>
    </div>
  );
}
