"use client";
// src/app/register/page.jsx
// Kayıt — başarılı kayıtta backend otomatik giriş yapar (LoginResultDTO).
import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const initial = {
  name: "",
  surname: "",
  email: "",
  userName: "",
  password: "",
  passwordAgain: "",
  phoneNumber: "",
  govId: "",
  birthday: "",
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Ad zorunludur.";
  if (!form.surname.trim()) errors.surname = "Soyad zorunludur.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errors.email = "Geçerli bir e-posta girin.";
  if (form.userName.trim().length < 3) errors.userName = "Kullanıcı adı en az 3 karakter olmalı.";
  if (form.password.length < 6 || !/[A-Za-z]/.test(form.password) || !/\d/.test(form.password))
    errors.password = "Şifre en az 6 karakter olmalı, harf ve rakam içermeli.";
  if (form.password !== form.passwordAgain) errors.passwordAgain = "Şifreler eşleşmiyor.";
  if (!/^\d{10}$/.test(form.phoneNumber))
    errors.phoneNumber = "Telefon 10 haneli olmalı (örn. 5551234567).";
  if (!/^\d{11}$/.test(form.govId)) errors.govId = "T.C. kimlik numarası 11 haneli olmalı.";
  if (!form.birthday) errors.birthday = "Doğum tarihi zorunludur.";
  else if (new Date(form.birthday) > new Date()) errors.birthday = "Doğum tarihi gelecekte olamaz.";
  return errors;
}

function RegisterForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { register } = useAuth();

  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [busy, setBusy] = useState(false);

  const next = sp.get("next") || "/";
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setApiError("");
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setBusy(true);
    try {
      await register({
        email: form.email.trim(),
        userName: form.userName.trim(),
        password: form.password,
        phoneNumber: form.phoneNumber,
        name: form.name.trim(),
        surname: form.surname.trim(),
        govId: form.govId,
        birthday: new Date(form.birthday).toISOString(),
      });
      router.push(next);
    } catch (err) {
      setApiError(err.detail || "Kayıt tamamlanamadı.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 py-10">
      <h1 className="mb-1 text-2xl font-bold tracking-tight text-ink">Kayıt Ol</h1>
      <p className="mb-6 text-sm text-ink-soft">
        Hesabınızı oluşturun, alışverişe hemen başlayın.
      </p>

      <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Ad" autoComplete="given-name" value={form.name} onChange={set("name")} error={errors.name} />
          <Input label="Soyad" autoComplete="family-name" value={form.surname} onChange={set("surname")} error={errors.surname} />
        </div>
        <Input label="E-posta" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} />
        <Input label="Kullanıcı adı" autoComplete="username" value={form.userName} onChange={set("userName")} error={errors.userName} />
        <Input
          label="Şifre"
          type="password"
          autoComplete="new-password"
          value={form.password}
          onChange={set("password")}
          error={errors.password}
          hint="En az 6 karakter, harf ve rakam içermeli"
        />
        <Input
          label="Şifre (tekrar)"
          type="password"
          autoComplete="new-password"
          value={form.passwordAgain}
          onChange={set("passwordAgain")}
          error={errors.passwordAgain}
        />
        <Input
          label="Telefon"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          placeholder="5551234567"
          maxLength={10}
          value={form.phoneNumber}
          onChange={set("phoneNumber")}
          error={errors.phoneNumber}
        />
        <Input
          label="T.C. kimlik numarası"
          inputMode="numeric"
          maxLength={11}
          value={form.govId}
          onChange={set("govId")}
          error={errors.govId}
        />
        <Input
          label="Doğum tarihi"
          type="date"
          autoComplete="bday"
          value={form.birthday}
          onChange={set("birthday")}
          error={errors.birthday}
        />

        {apiError && (
          <p role="alert" className="rounded-base bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            {apiError}
          </p>
        )}

        <Button type="submit" size="lg" loading={busy}>
          Kayıt Ol
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Zaten hesabınız var mı?{" "}
        <Link
          href={`/login${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`}
          className="font-semibold text-accent hover:underline"
        >
          Giriş yapın
        </Link>
      </p>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
