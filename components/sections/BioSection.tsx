import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { SocialIcons } from "@/components/SocialIcons";
import { Globe } from "lucide-react";

const websites = [
  { label: "justjoin.it", href: "https://justjoin.it" },
  { label: "rocketjobs.pl", href: "https://rocketjobs.pl" },
  { label: "aulapolska.pl", href: "https://aulapolska.pl" },
];

export async function BioSection() {
  const t = await getTranslations("home");

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
      <div className="grid gap-10 sm:gap-12 lg:grid-cols-[minmax(0,2fr),1fr] lg:gap-16">
        {/* Text — left on desktop, below photo on mobile */}
        <div className="order-2 flex flex-col gap-6 lg:order-1">
          <div className="space-y-3">
            <p className="font-mono text-sm text-muted-foreground">
              {t("greeting")}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("headline")}
            </h1>
          </div>

          <div className="space-y-4">
            <p className="text-lg leading-relaxed text-foreground/90">
              {t("bio")}
            </p>
            <p className="text-lg leading-relaxed text-foreground/90">
              {t("bio_personal")}
            </p>
            <p className="text-lg leading-relaxed text-foreground/90">
              {t("disclaimer")}
            </p>
            <p className="text-lg font-semibold text-foreground/90">
              {t("disclaimer_punchline")}
            </p>
          </div>
        </div>

        {/* Sidebar — right on desktop, top on mobile */}
        <div className="order-1 flex flex-col items-center gap-6 lg:order-2">
          <Image
            src="/piotr.png"
            alt="Piotr Nowosielski"
            width={180}
            height={180}
            className="rounded-2xl"
            priority
          />
          <SocialIcons className="pt-1" />
          <div className="flex flex-col items-center gap-1.5">
            {websites.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Globe className="h-3.5 w-3.5" />
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
