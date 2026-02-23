import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { SocialIcons } from "@/components/SocialIcons";
import { NewsletterForm } from "@/components/sections/NewsletterForm";

export async function BioSection() {
  const t = await getTranslations("home");

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:py-32">
      <div className="grid gap-16 lg:grid-cols-[1fr,minmax(0,2fr)] lg:gap-24">
        <div className="flex flex-col items-start gap-6">
          <Image
            src="/piotr.png"
            alt="Piotr Nowosielski"
            width={160}
            height={160}
            className="rounded-2xl"
            priority
          />
          <div className="space-y-3">
            <p className="font-mono text-sm text-muted-foreground">
              {t("greeting")}
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              {t("headline")}
            </h1>
            <SocialIcons className="pt-1" />
          </div>
        </div>

        <div className="flex flex-col gap-8">
          <div className="space-y-4">
            <p className="text-lg leading-relaxed text-foreground/90">
              {t("bio")}
            </p>
            <p className="text-lg leading-relaxed text-foreground/90">
              {t("bio_personal")}
            </p>
          </div>

          <div className="rounded-xl border border-border/60 bg-muted/30 p-6 sm:p-8">
            <p className="leading-relaxed text-muted-foreground">
              {t("disclaimer")}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button size="lg" asChild>
              <Link href="/handbook">{t("cta_handbook")}</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/newsletter">{t("cta_newsletter")}</Link>
            </Button>
          </div>

          <NewsletterForm variant="inline" className="mt-4" />
        </div>
      </div>
    </section>
  );
}
