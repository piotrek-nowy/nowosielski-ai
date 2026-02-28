"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Mail, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

export function NewsletterSection() {
  const t = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Unknown error");
      }

      setStatus("success");
      setEmail("");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : t("error"));
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-border/50 bg-muted/30 p-8 sm:p-10">
        <div className="flex flex-col items-center text-center gap-3">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
          <p className="text-lg font-medium">{t("success")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-muted/30 p-8 sm:p-10">
      <div className="flex items-center gap-2 mb-2">
        <Mail className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold tracking-tight">{t("title")}</h2>
      </div>
      <p className="text-muted-foreground mb-6">{t("subtitle")}</p>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t("placeholder")}
          required
          className="flex-1 rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-foreground/20 transition-shadow"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground text-background px-5 py-2.5 text-sm font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
        >
          {status === "loading" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              {t("button")}
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      {status === "error" && (
        <p className="mt-3 text-sm text-red-500">{errorMsg || t("error")}</p>
      )}
    </div>
  );
}
