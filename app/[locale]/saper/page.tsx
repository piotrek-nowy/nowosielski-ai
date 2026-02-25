import { setRequestLocale } from "next-intl/server";
import { getTranslations } from "next-intl/server";
import { SaperGame } from "@/components/sections/SaperGame";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "saper" });
  return {
    title: t("pageTitle"),
    description: t("pageDescription"),
  };
}

export default async function SaperPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <SaperGame />
    </section>
  );
}
