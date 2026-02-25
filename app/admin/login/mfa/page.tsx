"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminMfaPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { data: factorsData, error: factorsError } =
      await supabase.auth.mfa.listFactors();

    if (factorsError) {
      setError(factorsError.message);
      setLoading(false);
      return;
    }

    const totpFactor = factorsData?.totp?.[0];
    if (!totpFactor) {
      setError("Brak skonfigurowanego uwierzytelniania 2FA.");
      setLoading(false);
      return;
    }

    const { data: challengeData, error: challengeError } =
      await supabase.auth.mfa.challenge({ factorId: totpFactor.id });

    if (challengeError) {
      setError(challengeError.message);
      setLoading(false);
      return;
    }

    const challengeId = challengeData?.id;
    if (!challengeId) {
      setError("Nie udało się utworzyć wyzwania.");
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId,
      code: code.trim(),
    });

    if (verifyError) {
      setError(verifyError.message);
      setLoading(false);
      return;
    }

    router.replace("/admin");
    router.refresh();
    setLoading(false);
  }

  function handleCodeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(v);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Weryfikacja 2FA
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Wpisz 6-cyfrowy kod z aplikacji uwierzytelniającej
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="totp" className="text-sm font-medium">
              Kod TOTP
            </label>
            <Input
              id="totp"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="000000"
              value={code}
              onChange={handleCodeChange}
              maxLength={6}
              className="w-full text-center font-mono text-lg tracking-[0.5em]"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading || code.length !== 6}>
            {loading ? "Weryfikacja…" : "Potwierdź"}
          </Button>
        </form>

        <p className="text-center">
          <a
            href="/admin/login"
            className="text-sm text-muted-foreground underline hover:text-foreground"
          >
            Wróć do logowania
          </a>
        </p>
      </div>
    </div>
  );
}
