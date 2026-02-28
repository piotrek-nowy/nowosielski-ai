import { setRequestLocale } from "next-intl/server";
import { BioSection } from "@/components/sections/BioSection";
import { CurrentlyWorkingOn } from "@/components/sections/CurrentlyWorkingOn";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { LatestTweets } from "@/components/sections/LatestTweets";
import { NewsletterSection } from "@/components/sections/NewsletterSection";
import { Sidebar } from "@/components/sections/Sidebar";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-16">
        <div className="order-1">
          <BioSection />
          <CurrentlyWorkingOn />
        </div>

        <aside className="order-2 flex items-start justify-center lg:row-span-4 lg:sticky lg:top-[84px] lg:self-start">
          <Sidebar />
        </aside>

        <div className="order-3 pt-6 lg:pt-0">
          <LatestPosts />
        </div>

        <div className="order-4 pt-6 lg:pt-0">
          <NewsletterSection />
        </div>

        <div className="order-5 pt-6 lg:pt-0">
          <LatestTweets />
        </div>
      </div>
    </section>
  );
}
