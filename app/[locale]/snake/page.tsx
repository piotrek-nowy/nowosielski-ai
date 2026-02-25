import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SnakeGame } from "@/components/sections/SnakeGame";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "snake" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function SnakePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <SnakeGame />
    </section>
  );
}
