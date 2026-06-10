"use client";
// src/app/account/addresses/page.jsx
// Adres defteri — liste, ekleme, düzenleme, silme (onaylı).
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import AddressForm from "@/components/account/AddressForm";

export default function AddressesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const toast = useToast();

  const [addresses, setAddresses] = useState(null); // null = yükleniyor
  const [editing, setEditing] = useState(null);     // adres objesi veya "new"
  const [deleting, setDeleting] = useState(null);   // silinecek adres
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/account/addresses");
  }, [authLoading, user, router]);

  const reload = useCallback(async () => {
    try {
      setAddresses(await api("/me/addresses"));
    } catch (err) {
      toast.error(err.detail || "Adresler yüklenemedi");
      setAddresses([]);
    }
  }, [toast]);

  useEffect(() => {
    if (user) reload();
  }, [user, reload]);

  const save = async (form) => {
    setBusy(true);
    try {
      if (editing === "new") {
        await api("/me/addresses", { method: "POST", body: form });
        toast.success("Adres eklendi");
      } else {
        await api(`/me/addresses/${editing.id}`, { method: "PUT", body: form });
        toast.success("Adres güncellendi");
      }
      setEditing(null);
      await reload();
    } catch (err) {
      toast.error(err.detail || "Adres kaydedilemedi");
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await api(`/me/addresses/${deleting.id}`, { method: "DELETE" });
      toast.success("Adres silindi");
      setDeleting(null);
      await reload();
    } catch (err) {
      toast.error(err.detail || "Adres silinemedi");
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || !user || addresses === null) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-ink">Adreslerim</h1>
        <Button onClick={() => setEditing("new")}>Yeni Adres</Button>
      </div>

      {addresses.length === 0 ? (
        <div className="rounded-base border border-line bg-surface-card p-10 text-center">
          <p className="font-medium text-ink">Henüz kayıtlı adresiniz yok.</p>
          <p className="mt-1 text-sm text-ink-soft">
            Sipariş verebilmek için bir teslimat adresi ekleyin.
          </p>
          <Button className="mt-4" onClick={() => setEditing("new")}>
            İlk Adresimi Ekle
          </Button>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((a) => (
            <li
              key={a.id}
              className="flex items-start justify-between gap-3 rounded-base border border-line bg-surface-card p-4"
            >
              <div className="min-w-0">
                <div className="font-semibold text-ink">{a.addressName}</div>
                <div className="mt-0.5 text-sm text-ink-soft">
                  {a.street}, {a.state} / {a.city} {a.postalCode}, {a.country}
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <Button variant="ghost" size="sm" onClick={() => setEditing(a)}>
                  Düzenle
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setDeleting(a)}>
                  Sil
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Ekle / Düzenle */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing === "new" ? "Yeni Adres" : "Adresi Düzenle"}
      >
        {editing && (
          <AddressForm
            initial={editing === "new" ? null : editing}
            onSubmit={save}
            onCancel={() => setEditing(null)}
            busy={busy}
          />
        )}
      </Modal>

      {/* Silme onayı */}
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Adresi Sil"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleting(null)}>
              Vazgeç
            </Button>
            <Button variant="danger" loading={busy} onClick={remove}>
              Sil
            </Button>
          </>
        }
      >
        <p>
          <strong>{deleting?.addressName}</strong> adresini silmek istediğinize emin misiniz?
          Geçmiş siparişleriniz etkilenmez.
        </p>
      </Modal>
    </div>
  );
}
