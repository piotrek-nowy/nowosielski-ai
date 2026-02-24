import { setRequestLocale } from "next-intl/server";
import { BioSection } from "@/components/sections/BioSection";
import { LatestPosts } from "@/components/sections/LatestPosts";
import { Sidebar } from "@/components/sections/Sidebar";

type Props = { params: Promise<{ locale: string }> };

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10 lg:gap-16">
        {/* Bio text — left column on desktop, first on mobile */}
        <div className="order-1">
          <BioSection />
        </div>

        {/* Sidebar — right column on desktop, between bio and posts on mobile */}
        <aside className="order-2 flex items-start justify-center lg:row-span-2 lg:sticky lg:top-8 lg:self-start">
          <Sidebar />
        </aside>

        {/* Latest posts — left column on desktop, last on mobile */}
        <div className="order-3 pt-6 lg:pt-0">
          <LatestPosts />
        </div>
      </div>
    </section>
  );
}
