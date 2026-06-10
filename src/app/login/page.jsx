"use client";
// src/app/login/page.jsx
// Giriş — BFF üzerinden httpOnly cookie oturumu. Token tarayıcıya inmez.
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { login } = useAuth();

  const [form, setForm] = useState({ userNameOrEmail: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const next = sp.get("next") || "/";

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.userNameOrEmail.trim() || !form.password) {
      setError("E-posta/kullanıcı adı ve şifre zorunludur.");
      return;
    }

    setBusy(true);
    try {
      const user = await login(form.userNameOrEmail.trim(), form.password);
      // Admin kullanıcıyı doğrudan panele götür
      router.push(user.isAdmin ? "/admin" : next);
    } catch (err) {
      setError(err.detail || "Giriş yapılamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-md flex-col justify-center px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-ink">Giriş Yap</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Sepetinize ve siparişlerinize ulaşmak için giriş yapın.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <Input
          label="E-posta veya kullanıcı adı"
          name="userNameOrEmail"
          type="text"
          autoComplete="username"
          value={form.userNameOrEmail}
          onChange={(e) => setForm((f) => ({ ...f, userNameOrEmail: e.target.value }))}
        />
        <Input
          label="Şifre"
          name="password"
          type="password"
          autoComplete="current-password"
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
        />

        {error && (
          <p role="alert" className="rounded-base bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button type="submit" size="lg" loading={busy}>
          Giriş Yap
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Hesabınız yok mu?{" "}
        <Link
          href={`/register${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-accent hover:underline"
        >
          Kayıt olun
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
