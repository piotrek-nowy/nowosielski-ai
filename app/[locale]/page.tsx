import { setRequestLocale } from "next-intl/server";
import { BioSection } from "@/components/sections/BioSection";
import { LatestPosts } from "@/components/sections/LatestPosts";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <BioSection />
      <LatestPosts />
    </>
  );
}
