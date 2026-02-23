import { setRequestLocale } from "next-intl/server";
import { NewsletterForm } from "@/components/sections/NewsletterForm";

type Props = { params: Promise<{ locale: string }> };

export default async function NewsletterPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <div className="max-w-md">
        <NewsletterForm variant="standalone" />
      </div>
    </div>
  );
}
