import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { HandbookSidebar } from "@/components/sections/HandbookSidebar";
import { handbookChapters } from "@/content/handbook/config";

type Props = { params: Promise<{ locale: string }> };

export default async function HandbookIndexPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("handbook");

  return (
    <div className="mx-auto flex max-w-6xl gap-12 px-4 py-12 sm:px-6">
      <HandbookSidebar />
      <article className="min-w-0 flex-1">
        <h1 className="font-mono text-2xl font-semibold text-foreground sm:text-3xl">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("subtitle")}</p>
        <ul className="mt-8 space-y-3">
          {handbookChapters.map(({ slug, title }) => (
            <li key={slug}>
              <Link
                href={`/handbook/${slug}`}
                className="text-foreground underline-offset-4 hover:underline"
              >
                {title}
              </Link>
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
