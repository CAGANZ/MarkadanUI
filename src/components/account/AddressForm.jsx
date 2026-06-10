"use client";
// src/components/account/AddressForm.jsx
// Adres ekleme/düzenleme formu — adres defterinde ve checkout'ta kullanılır.
import { useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const empty = {
  addressName: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Türkiye",
};

function validate(form) {
  const errors = {};
  if (!form.addressName.trim()) errors.addressName = "Adres adı zorunludur (örn. Ev, İş).";
  if (!form.street.trim()) errors.street = "Açık adres zorunludur.";
  if (!form.city.trim()) errors.city = "Şehir zorunludur.";
  if (!form.state.trim()) errors.state = "İlçe zorunludur.";
  if (!/^\d{5}$/.test(form.postalCode)) errors.postalCode = "Posta kodu 5 haneli olmalı.";
  if (!form.country.trim()) errors.country = "Ülke zorunludur.";
  return errors;
}

export default function AddressForm({ initial = null, onSubmit, onCancel, busy = false }) {
  const [form, setForm] = useState(initial ?? empty);
  const [errors, setErrors] = useState({});

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({
      addressName: form.addressName.trim(),
      street: form.street.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      postalCode: form.postalCode,
      country: form.country.trim(),
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4" noValidate>
      <Input
        label="Adres adı"
        placeholder="Ev, İş..."
        value={form.addressName}
        onChange={set("addressName")}
        error={errors.addressName}
      />
      <Input
        label="Açık adres"
        placeholder="Mahalle, cadde, no, daire"
        value={form.street}
        onChange={set("street")}
        error={errors.street}
      />
      <div className="grid grid-cols-2 gap-3">
        <Input label="İlçe" value={form.state} onChange={set("state")} error={errors.state} />
        <Input label="Şehir" value={form.city} onChange={set("city")} error={errors.city} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Posta kodu"
          inputMode="numeric"
          maxLength={5}
          value={form.postalCode}
          onChange={set("postalCode")}
          error={errors.postalCode}
        />
        <Input label="Ülke" value={form.country} onChange={set("country")} error={errors.country} />
      </div>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button variant="ghost" onClick={onCancel}>
            Vazgeç
          </Button>
        )}
        <Button type="submit" loading={busy}>
          {initial ? "Güncelle" : "Kaydet"}
        </Button>
      </div>
    </form>
  );
}
