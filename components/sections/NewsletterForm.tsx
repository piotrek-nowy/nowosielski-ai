"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type Variant = "standalone" | "inline";

type Props = {
  variant?: Variant;
  className?: string;
};

export function NewsletterForm({ variant = "standalone", className }: Props) {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [gdpr, setGdpr] = useState(false);
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorKey, setErrorKey] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorKey(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !gdpr) {
      setStatus("error");
      setErrorKey("error_required");
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setStatus("error");
      setErrorKey("error_email");
      return;
    }

    setStatus("submitting");
    // No backend: simulate delay then show success
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
    setGdpr(false);
  };

  if (status === "success") {
    return (
      <div
        className={cn(
          "rounded-lg border border-border bg-card p-6 text-card-foreground",
          variant === "inline" && "border-border/60 bg-card/50",
          className
        )}
      >
        <p className="text-sm text-muted-foreground">{t("success")}</p>
      </div>
    );
  }

  const isStandalone = variant === "standalone";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "space-y-4",
        isStandalone && "rounded-lg border border-border bg-card p-6 sm:p-8",
        className
      )}
    >
      {isStandalone && (
        <>
          <h2 className="font-mono text-xl font-semibold text-foreground">
            {t("title")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("description")}</p>
        </>
      )}
      <div className="space-y-2">
        <label htmlFor="newsletter-email" className="sr-only">
          {t("email_label")}
        </label>
        <Input
          id="newsletter-email"
          type="email"
          placeholder={t("email_placeholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "submitting"}
          autoComplete="email"
          className="w-full"
          aria-invalid={status === "error"}
        />
      </div>
      <div className="flex items-start gap-3">
        <Checkbox
          id="newsletter-gdpr"
          checked={gdpr}
          onChange={(e) => setGdpr(e.target.checked)}
          disabled={status === "submitting"}
          aria-invalid={status === "error" && errorKey === "error_required"}
        />
        <label
          htmlFor="newsletter-gdpr"
          className="text-sm leading-relaxed text-muted-foreground cursor-pointer"
        >
          {t("gdpr_label")}
        </label>
      </div>
      {status === "error" && errorKey && (
        <p className="text-sm text-destructive" role="alert">
          {t(errorKey)}
        </p>
      )}
      <Button type="submit" disabled={status === "submitting"}>
        {status === "submitting" ? t("submitting") : t("submit")}
      </Button>
    </form>
  );
}
