import { getTranslations } from "next-intl/server";

export async function BioSection() {
  const t = await getTranslations("home");

  return (
    <div className="flex flex-col gap-6">
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
  );
}
