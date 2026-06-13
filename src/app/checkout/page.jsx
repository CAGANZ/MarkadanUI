"use client";
// src/app/checkout/page.jsx
// Checkout — adres seç → ödemeyi başlat (iyzico) → doğrula → sipariş.
// Akış:
//   1. phase=address : adres seç, "Ödemeye Geç" → POST /me/checkout/initiate
//   2. phase=payment : iyzico form inject edilir, "Ödemeyi Tamamladım" → POST /me/checkout/confirm
// 409 senaryoları (backend sözleşmesi):
//  - fiyat değişti → sepet GET ile tazelenir (snapshot güncellenir), /cart'a dön
//  - stok yok     → detail gösterilir, /cart'a dön
//  - sepet boş    → /cart'a dön
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client/api";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Skeleton from "@/components/ui/Skeleton";
import AddressForm from "@/components/account/AddressForm";

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const { cart, reload } = useCart();
  const router = useRouter();
  const toast = useToast();
  const iyzicoRef = useRef(null);

  const [addresses, setAddresses] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [ordered, setOrdered] = useState(false);

  // iyzico akışı
  const [phase, setPhase] = useState("address"); // 'address' | 'payment'
  const [paymentToken, setPaymentToken] = useState(null);
  const [paymentFormContent, setPaymentFormContent] = useState(null);

  // checkoutFormContent gelince iyzico script'ini DOM'a inject et
  useEffect(() => {
    if (!paymentFormContent || !iyzicoRef.current) return;
    const container = iyzicoRef.current;
    container.innerHTML = "";
    const temp = document.createElement("div");
    temp.innerHTML = paymentFormContent;
    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const script = document.createElement("script");
        if (node.src) script.src = node.src;
        else script.textContent = node.textContent;
        script.type = "text/javascript";
        container.appendChild(script);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    });
  }, [paymentFormContent]);

  useEffect(() => {
    if (!authLoading && !user) router.replace("/login?next=/checkout");
  }, [authLoading, user, router]);

  useEffect(() => {
    if (ordered) return;
    if (cart && (cart.items?.length === 0 || cart.hasPriceChanges)) {
      router.replace("/cart");
    }
  }, [cart, router, ordered]);

  const loadAddresses = useCallback(async () => {
    try {
      const list = await api("/me/addresses");
      setAddresses(list);
      if (list.length > 0) setSelectedId((cur) => cur ?? list[0].id);
    } catch (err) {
      toast.error(err.detail || "Adresler yüklenemedi");
      setAddresses([]);
    }
  }, [toast]);

  useEffect(() => {
    if (user) loadAddresses();
  }, [user, loadAddresses]);

  const addAddress = async (form) => {
    setBusy(true);
    try {
      await api("/me/addresses", { method: "POST", body: form });
      setAdding(false);
      await loadAddresses();
      toast.success("Adres eklendi");
    } catch (err) {
      toast.error(err.detail || "Adres eklenemedi");
    } finally {
      setBusy(false);
    }
  };

  const initiatePayment = async () => {
    if (!selectedId) {
      setError("Lütfen bir teslimat adresi seçin.");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const result = await api("/me/checkout/initiate", {
        method: "POST",
        body: { addressId: selectedId },
      });
      setPaymentToken(result.token);
      setPaymentFormContent(result.checkoutFormContent);
      setPhase("payment");
    } catch (err) {
      if (err.status === 409) {
        await reload();
        toast.error(err.detail || "Sepetinizde güncelleme var, lütfen kontrol edin.");
        router.push("/cart");
      } else if (err.status === 404) {
        setError("Seçilen adres bulunamadı. Lütfen başka bir adres seçin.");
        await loadAddresses();
      } else {
        setError(err.detail || "Ödeme başlatılamadı.");
      }
    } finally {
      setBusy(false);
    }
  };

  const confirmPayment = async () => {
    if (!paymentToken) return;
    setError("");
    setBusy(true);
    try {
      const order = await api("/me/checkout/confirm", {
        method: "POST",
        body: { token: paymentToken },
      });
      setOrdered(true);
      const dest = order?.id ? `/account/orders/${order.id}?new=1` : "/account/orders";
      router.push(dest);
      reload();
    } catch (err) {
      if (err.status === 400 || err.status === 409) {
        setError(err.detail || "Ödeme işlemi başarısız, tekrar deneyin.");
      } else {
        setError(err.detail || "Sipariş oluşturulamadı.");
      }
    } finally {
      setBusy(false);
    }
  };

  if (authLoading || !user || addresses === null || !cart) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const items = cart.items ?? [];
  const selectedAddress = addresses.find((a) => a.id === selectedId);

  // iyzico ödeme ekranı
  if (phase === "payment") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold tracking-tight text-ink">Ödemeyi Tamamla</h1>

        <div className="flex flex-col gap-6">
          {selectedAddress && (
            <div className="rounded-base border border-line bg-surface-card p-4 text-sm text-ink-soft">
              <span className="font-semibold text-ink">{selectedAddress.addressName}</span>
              {" — "}
              {selectedAddress.street}, {selectedAddress.state}, {selectedAddress.city}{" "}
              {selectedAddress.postalCode}
            </div>
          )}

          {/* iyzico popup buraya inject edilir */}
          <div ref={iyzicoRef} />

          <p className="text-sm text-ink-soft">
            iyzico ödeme ekranı yüklendi. Ödemeyi tamamladıktan sonra aşağıdaki butona tıklayın.
          </p>

          {error && (
            <p role="alert" className="rounded-base bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                setPhase("address");
                setPaymentToken(null);
                setPaymentFormContent(null);
                setError("");
              }}
            >
              Geri
            </Button>
            <Button size="lg" loading={busy} onClick={confirmPayment} className="flex-1">
              Ödemeyi Tamamladım — {formatPrice(cart.total)}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // adres seçim ekranı (phase === 'address')
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold tracking-tight text-ink">Siparişi Tamamla</h1>

      <div className="flex flex-col gap-6">
        {/* 1. Teslimat adresi */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Teslimat Adresi</h2>
            <Button variant="secondary" size="sm" onClick={() => setAdding(true)}>
              Yeni Adres
            </Button>
          </div>

          {addresses.length === 0 ? (
            <div className="rounded-base border border-line bg-surface-card p-6 text-center">
              <p className="text-sm text-ink-soft">
                Sipariş verebilmek için bir teslimat adresi eklemeniz gerekiyor.
              </p>
              <Button className="mt-3" onClick={() => setAdding(true)}>
                Adres Ekle
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-2" role="radiogroup" aria-label="Teslimat adresi">
              {addresses.map((a) => (
                <label
                  key={a.id}
                  className={`flex cursor-pointer items-start gap-3 rounded-base border p-4 transition-colors ${
                    selectedId === a.id
                      ? "border-primary bg-primary-soft"
                      : "border-line bg-surface-card hover:border-ink-soft"
                  }`}
                >
                  <input
                    type="radio"
                    name="address"
                    checked={selectedId === a.id}
                    onChange={() => setSelectedId(a.id)}
                    className="mt-1 accent-(--mk-primary)"
                  />
                  <span className="min-w-0">
                    <span className="block font-semibold text-ink">{a.addressName}</span>
                    <span className="mt-0.5 block text-sm text-ink-soft">
                      {a.street}, {a.state}, {a.city} {a.postalCode}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          )}
        </section>

        {/* 2. Sipariş özeti — snapshot fiyatlar */}
        <section>
          <h2 className="mb-3 text-lg font-semibold text-ink">Sipariş Özeti</h2>
          <div className="rounded-base border border-line bg-surface-card">
            <ul className="divide-y divide-line">
              {items.map((it) => (
                <li key={it.id} className="flex items-center justify-between gap-3 p-3 text-sm">
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {it.title} <span className="text-ink-soft">× {it.quantity}</span>
                  </span>
                  <span className="font-semibold text-ink">{formatPrice(it.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between border-t border-line p-4">
              <span className="font-medium text-ink">Toplam</span>
              <span className="text-xl font-extrabold text-ink">{formatPrice(cart.total)}</span>
            </div>
          </div>
        </section>

        {error && (
          <p role="alert" className="rounded-base bg-danger-soft px-3 py-2 text-sm font-medium text-danger">
            {error}
          </p>
        )}

        <Button
          size="lg"
          loading={busy}
          disabled={addresses.length === 0}
          onClick={initiatePayment}
        >
          Ödemeye Geç — {formatPrice(cart.total)}
        </Button>
      </div>

      {/* Yeni adres modalı */}
      <Modal open={adding} onClose={() => setAdding(false)} title="Yeni Adres">
        <AddressForm onSubmit={addAddress} onCancel={() => setAdding(false)} busy={busy} />
      </Modal>
    </div>
  );
}
