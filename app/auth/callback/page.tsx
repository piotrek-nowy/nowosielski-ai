"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function getHashParams() {
  if (typeof window === "undefined") return {};
  const hash = window.location.hash.slice(1);
  return Object.fromEntries(new URLSearchParams(hash));
}

export default function AuthCallbackPage() {
  const router = useRouter();
  const [isRecovery, setIsRecovery] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = getHashParams();
    const recovery = params.type === "recovery";
    setIsRecovery(recovery);
    if (recovery) {
      createClient().auth.getSession();
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Hasło musi mieć co najmniej 6 znaków.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Hasła nie są identyczne.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.replace("/admin/login");
    router.refresh();
  }

  if (isRecovery === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Ładowanie…</p>
      </div>
    );
  }

  if (!isRecovery) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Nieprawidłowy link.</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Ustaw nowe hasło
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Wpisz nowe hasło dwukrotnie.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Nowe hasło
            </label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="confirm" className="text-sm font-medium">
              Powtórz hasło
            </label>
            <Input
              id="confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
              className="w-full"
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Zapisywanie…" : "Zapisz"}
          </Button>
        </form>
      </div>
    </div>
  );
}
