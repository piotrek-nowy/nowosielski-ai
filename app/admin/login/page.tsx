"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const RESET_CALLBACK_URL =
  process.env.NEXT_PUBLIC_SITE_URL
    ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "") + "/auth/callback"
    : "https://www.nowosielski.ai/auth/callback";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const [resetEmail, setResetEmail] = useState("");

  async function handleForgotSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      resetEmail,
      { redirectTo: RESET_CALLBACK_URL }
    );
    setLoading(false);
    if (resetError) {
      setError(resetError.message);
      return;
    }
    setResetEmailSent(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (!data.session) {
      setError("Logowanie nie powiodło się.");
      setLoading(false);
      return;
    }

    const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (
      aalData?.nextLevel === "aal2" &&
      aalData?.currentLevel !== aalData?.nextLevel
    ) {
      router.replace("/admin/login/mfa");
      return;
    }

    router.replace("/admin");
    router.refresh();
    setLoading(false);
  }

  if (showForgotPassword) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-sm space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Reset hasła
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {resetEmailSent
                ? "Sprawdź skrzynkę mailową."
                : "Podaj email powiązany z kontem."}
            </p>
          </div>

          {resetEmailSent ? (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowForgotPassword(false);
                setResetEmailSent(false);
              }}
            >
              Wróć do logowania
            </Button>
          ) : (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              {error && (
                <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}
              <div className="space-y-2">
                <label htmlFor="reset-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="reset-email"
                  type="email"
                  autoComplete="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Wysyłanie…" : "Wyślij link do resetu"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setShowForgotPassword(false);
                  setError("");
                }}
              >
                Wróć do logowania
              </Button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Panel admina
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Zaloguj się emailem i hasłem
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email
            </label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Hasło
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logowanie…" : "Zaloguj się"}
          </Button>

          <p className="text-center">
            <button
              type="button"
              className="text-sm text-muted-foreground underline hover:text-foreground"
              onClick={() => setShowForgotPassword(true)}
            >
              Zapomniałem hasła
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
