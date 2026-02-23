import { setRequestLocale } from "next-intl/server";
import { BioSection } from "@/components/sections/BioSection";
import { XFeed } from "@/components/sections/XFeed";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <BioSection />
      <XFeed />
    </>
  );
}
