# Markadan Frontend — Durum Raporu ve Görev Listesi

**Tarih:** 2026-06-20 | **Son backend commit:** `16f59fb` | **Build:** ✅ temiz | **E2E test:** ✅ tüm akışlar geçti
**Hazırlayan:** Mimar | **Hedef okuyucu:** Projeye devam edecek geliştirici

> **Başlamadan önce sırasıyla oku:**
> 1. Bu dosya (durum + görevler + kurallar)
> 2. `docs/MIMARI-RAPOR.md` (mimari kararlar — NEDEN'ler orada)
> 3. Referans kod: `src/app/admin/orders/` ve `src/app/account/` (yeni yazılmış, örnek alınacak desenler)

---

## 0. Kurulum (yeni makine)

```bash
git clone git@github.com:CAGANZ/MarkadanUI.git && cd MarkadanUI
npm install
echo "API_BASE_URL=http://localhost:8080" > .env.local   # ⚠️ ZORUNLU — yoksa build asılır
# Backend: ~/MarkadanAPI içinde `docker compose up -d` (admin bilgileri backend .env'inde)
npm run dev      # geliştirme
npm run build    # commit öncesi zorunlu — tüm sayfalar geçmeli
```

**Seed data (geliştirme DB'si için):**
```bash
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@markadan.com","password":"Markadan.2026!"}' | jq -r '.accessToken')
```
Backend admin şifresi `~/MarkadanAPI/.env`'de. Swagger: `http://localhost:8080/swagger`.

---

## 1. GELİŞTİRME KURALLARI (her görevde geçerli — ZORUNLU)

1. **Renk yasakları:** Bileşenlerde `amber-*`, `neutral-*`, hex kod (`#FFF7E6`) KULLANILMAZ.
   Yalnızca tema utility'leri: `bg-primary`, `bg-primary-soft`, `bg-accent`, `bg-accent-soft`,
   `bg-surface`, `bg-surface-card`, `text-ink`, `text-ink-soft`, `border-line`,
   `bg-danger/-soft`, `bg-success/-soft`, `bg-warning/-soft`, `rounded-base`.
   Tanımlar: `src/app/theme.css` + `src/app/globals.css`.
2. **API çağrısı (client bileşen):** `import { api } from "@/lib/client/api"` →
   `await api("/me/cart", { method: "POST", body: {...} })`. Hata: `catch (err) { toast.error(err.detail) }`.
   Çıplak `fetch()` client'ta YASAK. İstisna: `FormData` body (multipart) — o zaman direkt `fetch` kullan.
3. **API çağrısı (RSC/server):** Public katalog için `src/lib/server/catalog.js` fonksiyonları.
   Yeni BFF route: `backendFetch` + `passThrough` (örnek: `src/app/api/me/cart/route.js`).
4. **Token'a dokunma:** `localStorage`/`sessionStorage`'da token YASAK. Yalnızca `useAuth()`.
5. **Next 15:** `params` ve `searchParams` her zaman `await` (server) veya `use()` (client).
6. **Durum tasarımı:** Her liste/detay için: yükleniyor (`Skeleton`), boş, hata.
7. **UI kit:** `ui/Button`, `ui/Input`, `ui/Modal`, `useToast()`. Yeni stil yazılmaz.
8. **Mobile-first:** 390px önce. Dokunma hedefleri ≥44px.
9. **Tüm UI metinleri Türkçe.**
10. **Commit:** `npm run build` geçmeden commit YOK.

---

## 2. Tamamlananlar

| Faz | İçerik | Önemli dosyalar |
|---|---|---|
| 1 | BFF auth, white-label tema, UI kit | `lib/server/api.js`, `app/theme.css`, `config/boutique.js`, `components/ui/*` |
| 2 | Header/SearchBox/MobileNav, ürün liste+detay, ana sayfa, filtreler | `components/layout/*`, `components/catalog/*`, `lib/server/catalog.js` |
| 3 | Login, register, hesabım, adres defteri | `app/login`, `app/register`, `app/account/*` |
| 4 | Sepet (fiyat değişikliği kilidi), checkout (409 senaryoları, ordered flag fix) | `app/cart`, `app/checkout`, `hooks/useCart.jsx` |
| 5 | Sipariş geçmişi/detay/iptal | `app/account/orders/*`, `lib/order-status.js` |
| 6 | AdminGuard, admin nav, admin sipariş yönetimi | `app/admin/layout.js`, `app/admin/orders/*` |
| 7 | Kart redesign, ana sayfa revizyon, brands/categories RSC, seed data | `app/page.jsx`, `components/catalog/ProductCard.jsx`, `app/brands/`, `app/categories/` |
| 8 | Görsel altyapı, admin CRUD tamamlama, WhatsApp, Mağaza Ayarları, CSV yükleme, Wishlist | Bkz. §3 |

**E2E doğrulanan akışlar:** admin CRUD → public katalog → kayıt → sepet → fiyat değişikliği → checkout → sipariş → iptal.

**Bilinen backend davranışı:** 409 sonrası `GET /me/cart` snapshot'ı TAZELEMİYOR (handoff notu yanlış).
UI çözümü: `useCart.acceptPriceChanges` — silip yeniden ekler.

**2026-06-20 backend değişiklikleri (yeni görevler M–O için bağlam):**
- **G9 Kupon sistemi:** `CartDTO`'ya `couponCode`, `discountAmount`, `finalTotal` eklendi. Yeni sepet uçları: `POST /me/cart/coupon`, `DELETE /me/cart/coupon`. Admin CRUD: `/admin/coupons`.
- **G5 Kargo takip:** `OrderDTO` ve `AdminOrderDTO`'ya `trackingNumber`, `trackingUrl` eklendi. Admin durum güncelleme body'si genişletildi.
- **G7 CSV export:** `GET /admin/orders/export` ucu eklendi — tarayıcıdan doğrudan indirme çalışır.

---

## 3. Faz 8 detayı (2026-06-12)

| Görev | Açıklama | Dosyalar | Commit |
|---|---|---|---|
| A | `next.config.mjs` remotePatterns `{"https","**"}`, `blurData.js` silindi | `next.config.mjs`, `src/lib/media.js` | `4d7282e` |
| B | Admin brands/categories **create+edit** sayfaları oluşturuldu (link verdi 404 atıyordu) | `app/admin/brands/create/`, `app/admin/brands/[id]/edit/`, `app/admin/categories/create/` | `48bb155` |
| C | WhatsApp sipariş butonu — masaüstü + mobil bar, `boutique.js` `whatsappPhone` | `app/products/[id]/page.jsx`, `config/boutique.js` | `53e6782` |
| D | Admin Mağaza Ayarları — `GET/PUT /admin/settings`, renk picker, nav linki | `app/admin/settings/page.jsx`, `app/admin/layout.js` | `db83ab8` |
| E | CSV toplu yükleme — admin ürünler modal, BFF multipart proxy | `app/admin/products/page.jsx`, `app/api/admin/products/bulk/route.js` | `2010638` |
| F | Favori listesi — `WishlistButton`, `/account/wishlist`, 3 BFF route | `components/catalog/WishlistButton.jsx`, `app/account/wishlist/`, `app/api/me/wishlist/*` | `64767d9` |

---

## 4. GÖREVLER

### GÖREV G — Görsel QA ✅ TAMAMLANDI (2026-06-12)

Headless Chromium ile E2E turu yapıldı. Bulunan ve düzeltilen bug:
- `src/app/api/admin/settings/route.js` eksikti → Mağaza Ayarları her açılışta hata veriyordu. Düzeltildi: `4674140`

**QA Sonuçları:**

| Akış | Sonuç | Not |
|---|---|---|
| Ana sayfa (mobil + masaüstü) | ✅ | |
| Ürün listesi, filtreler, sayfalama | ✅ | |
| Kategoriler, Markalar sayfaları | ✅ | |
| Ürün detay — masaüstü + mobil bar | ✅ | |
| Kayıt + giriş | ✅ | |
| Sepet — rozet, ± butonları | ✅ | |
| Checkout — adres modalı → sipariş onayla | ✅ | `/account/orders/{id}?new=1` doğru |
| Sipariş listesi + iptal modalı | ✅ | |
| Favorilere ekle → liste → çıkar → boş durum | ✅ | |
| Admin panel + nav | ✅ | |
| Admin Mağaza Ayarları kaydet | ✅ | BFF route düzeltildi |
| Admin Marka oluştur / düzenle / sil | ✅ | |
| Admin CSV modal | ✅ UI | CSV format notuna bkz. |
| 401: çıkış → /account → login → geri dön | ✅ | `?next=` çalışıyor |

**CSV format notu:** Backend `BrandName/CategoryName` (isim bazlı) bekliyor ama Swagger şeması netleştirilmeli.

---

### GÖREV H — Deploy hazırlığı ⏸ ERTELENDİ

Geliştirme aşamasında deploy yapılmayacak. Local ortam (Next.js dev + .NET Docker Compose) yeterli.
İhtiyaç duyulunca tercih edilen yol: **VPS + Docker Compose** (Hetzner/DigitalOcean + Coolify).

---

### GÖREV I — iyzico Ödeme Entegrasyonu (Frontend)
**Süre tahmini:** 4-6 saat | **Zorluk:** Orta | **Backend:** ✅ hazır

**Yeni akış — checkout sayfası değişiyor:**

Eski: `POST /me/checkout` → sipariş oluşur
Yeni:
1. `POST /me/checkout/initiate` → iyzico token alınır
2. Frontend iyzico popup'ını token ile açar
3. Kullanıcı ödeme yapar, popup kapanır
4. `POST /me/checkout/confirm` → ödeme doğrulanır, sipariş oluşur

**Backend uçları:**

`POST /me/checkout/initiate` — Auth gerekli
```json
// Request
{ "addressId": 1 }
// Response
{
  "conversationId": "cart-42",
  "token": "iyzico-token-buraya",
  "checkoutFormContent": "<script>...</script>"
}
```

`POST /me/checkout/confirm` — Auth gerekli
```json
// Request
{ "token": "iyzico-token-buraya" }
// Response — OrderDTO (mevcut sipariş detay yapısıyla aynı)
{ "id": 42, "orderNumber": "MRK-XXXXXXXX", "status": "Ordered", ... }
```

**Frontend değişiklikleri:**

1. `src/app/checkout/page.jsx` — ödeme butonunu değiştir:
   - `POST /me/checkout/initiate` çağır, `{ token, checkoutFormContent }` al
   - `checkoutFormContent` (HTML/JS snippet) sayfaya inject et — `dangerouslySetInnerHTML` kullan, div'e ekle
   - iyzico popup açılır, kullanıcı ödeme yapar
   - Popup kapandıktan sonra `POST /me/checkout/confirm` çağır, `{ token }` ile
   - Cevap gelen OrderDTO'nun `id`'siyle `/account/orders/{id}?new=1`'e yönlendir

2. `src/app/api/me/checkout/initiate/route.js` — yeni BFF proxy (POST)
3. `src/app/api/me/checkout/confirm/route.js` — yeni BFF proxy (POST)

**iyzico popup davranışı:**
- `checkoutFormContent` genellikle bir `<script>` tag'i içerir
- Ekrana inject edilince iyzico kendi popup'ını otomatik açar
- Ödeme tamamlanınca iyzico sayfada bir callback çağırır veya yönlendirme yapar
- Sandbox'ta test etmek için iyzico sandbox hesabı gerekli (iyzico.com'dan açılır)

**Hata senaryoları:**
- iyzico popup kapatılırsa / ödeme başarısız olursa: `confirm` çağrısını yapma, kullanıcıya "ödeme tamamlanamadı" göster
- `confirm` 400/409 dönerse: "Ödeme işlemi başarısız, tekrar deneyin" toast göster

**Kabul kriteri:** iyzico sandbox'ta test kartıyla ödeme yapılır, `/account/orders/{id}?new=1` sayfası açılır.

---

### GÖREV J — Sipariş İptal Akışı Güncelleme (Frontend)
**Süre tahmini:** 1-2 saat | **Zorluk:** Düşük | **Backend:** ✅ hazır

Backend yeni iptal kuralları uyguluyor. Frontend iptal butonu + modal buna göre güncellenmeli.

**Yeni durumlar ve Türkçe karşılıkları:**

| status (API) | Türkçe | İptal edilebilir mi (müşteri) |
|---|---|---|
| `PaymentPending` | Ödeme Bekleniyor | Evet |
| `Ordered` | Onaylandı | Evet (iade tetiklenir) |
| `Preparing` | Hazırlanıyor | Evet (iade tetiklenir) |
| `Shipped` | Kargoya Verildi | Hayır |
| `Delivered` | Teslim Edildi | Hayır |
| `Cancelled` | İptal Edildi | — |

**`src/lib/order-status.js` güncellemesi:**
```js
export const ORDER_STATUSES = {
  PaymentPending: { label: "Ödeme Bekleniyor", color: "warning" },
  Ordered:        { label: "Onaylandı",         color: "primary" },
  Preparing:      { label: "Hazırlanıyor",       color: "primary" },
  Shipped:        { label: "Kargoya Verildi",    color: "accent"  },
  Delivered:      { label: "Teslim Edildi",      color: "success" },
  Cancelled:      { label: "İptal Edildi",       color: "danger"  },
};

export const canCustomerCancel = (status) =>
  ["PaymentPending", "Ordered", "Preparing"].includes(status);
```

**`src/app/account/orders/[id]/page.jsx` değişiklikleri:**
- `canCustomerCancel(status)` false ise iptal butonunu gizle
- `Shipped` durumunda: "Kargo çıktıktan sonra iptal edilemez." notu göster
- İptal onay modal mesajını güncelle:
  - `Ordered/Preparing` için: "Siparişiniz iptal edilecek ve ödemeniz iade edilecektir."
  - `PaymentPending` için: "Siparişiniz iptal edilecektir."

**Admin paneli (`src/app/admin/orders/[id]/page.jsx`):**
- Yeni durumları dropdown'a ekle: `Preparing`, `Shipped`, `Delivered`
- Durum geçiş akışı: `Ordered → Preparing → Shipped → Delivered`

**Kabul kriteri:** `Shipped` durumundaki siparişte iptal butonu görünmez; `Ordered` durumundaki siparişte modal "iade edilecektir" mesajı gösterir.

---

### GÖREV K — Dinamik Mağaza Verisi
**Süre tahmini:** 2-3 saat | **Zorluk:** Düşük | **Backend:** ✅ hazır

`boutique.js` statik yapılandırması yerine `GET /store-settings` API'sinden oku. Admin panelindeki değişiklikler anında yansısın.

**Backend ucu:** `GET /store-settings` — Auth gereksiz, public

```json
{
  "storeName": "Markadan",
  "logoUrl": "...",
  "accentColor": "#...",
  "currency": "TRY",
  "whatsappPhone": "+905XXXXXXXXX",
  "instagramUrl": "...",
  "twitterUrl": "..."
}
```

**Frontend değişiklikleri:**

1. `src/config/boutique.js` → SSR'da `GET /store-settings` çeken bir `getStoreSettings()` fonksiyonu yaz
2. `src/app/layout.js` (root layout) → `getStoreSettings()` çağır, `<Header>` ve `<Footer>`'a prop olarak geç
3. `src/app/products/[id]/page.jsx` → WhatsApp butonuna `whatsappPhone` prop'unu geç (`boutique.whatsappPhone` yerine)
4. `src/app/api/store-settings/route.js` → BFF proxy (GET, public, auth yok)

**Dikkat:**
- Root layout her request'te re-fetch yapar — Next.js `fetch` cache veya `unstable_cache` kullan
- `boutique.js` dosyasını silme, fallback olarak kalsın

**Kabul kriteri:** Admin panelinden mağaza adı veya WhatsApp numarası değiştirilince sayfa yenilendiğinde yeni değer görünür.

---

### GÖREV L — Middleware Auth Guard
**Süre tahmini:** 1-2 saat | **Zorluk:** Düşük | **Backend:** ✅ hazır (JWT)

Şu an `/account/*` ve `/admin/*` rotaları client-side redirect kullanıyor (`useAuth()` hook). `src/middleware.js` ile server-side token kontrolü ekle — bot'lar ve doğrudan URL erişimi de yönlendirilsin.

**`src/middleware.js` (yeni dosya):**
```js
import { NextResponse } from "next/server";

const PROTECTED = ["/account", "/admin"];
const ADMIN_ONLY = ["/admin"];

export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  const isProtected = PROTECTED.some((p) => pathname.startsWith(p));
  if (isProtected && !token) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/admin/:path*"],
};
```

**Dikkat:**
- Token cookie adını `useAuth()` hook'uyla uyumlu tut
- Admin rolü kontrolü middleware'de yapılmaz — sadece token varlığı kontrol edilir (rol kontrolü `AdminGuard` client bileşeninde kalır)

**Kabul kriteri:** Token olmadan `/account/orders` açmaya çalışınca `/login?next=/account/orders`'a yönlendirir.

---

### GÖREV M — Kupon / İndirim Kodu UI
**Süre tahmini:** 3-4 saat | **Zorluk:** Orta | **Backend:** ✅ hazır

Müşteri sepet sayfasına kupon kodu girişi; admin paneline kupon yönetimi.

---

#### M1 — Sepet: kupon girişi

**Backend uçları:**
```
POST /me/cart/coupon       body: { "code": "HOSGELDIN10" }  → CartDTO
DELETE /me/cart/coupon                                       → CartDTO
```

**CartDTO (güncel):**
```json
{
  "id": 1,
  "status": "Active",
  "items": [...],
  "total": 1649.60,
  "hasPriceChanges": false,
  "couponCode": "HOSGELDIN10",
  "discountAmount": 164.96,
  "finalTotal": 1484.64
}
```
`finalTotal` = `total - discountAmount`. Kupon yoksa `couponCode: null`, `discountAmount: 0`, `finalTotal == total`.

**Frontend değişiklikleri (`src/app/cart/` veya `hooks/useCart.jsx`):**

1. `useCart` hook'una iki action ekle:
   - `applyCoupon(code)` → `POST /me/cart/coupon`
   - `removeCoupon()` → `DELETE /me/cart/coupon`
   - Her ikisi de `setCart(data)` ile state'i günceller.

2. Sepet sayfasına kupon girişi ekle (ürünler listesinin altına, toplam üstüne):
   ```
   ┌─────────────────────────────────────┐
   │ 🏷  İndirim Kodu                     │
   │ [  KOD GİR...  ]  [ UYGULA ]        │
   │ ✅ HOSGELDIN10 uygulandı   [Kaldır]  │ ← kupon aktifse
   └─────────────────────────────────────┘
   ```

3. Toplam kart:
   ```
   Ara Toplam          1.649,60 TL
   İndirim (HOSGELDIN10) -164,96 TL   ← sadece kupon aktifse göster
   ─────────────────────────────────
   Toplam              1.484,64 TL
   ```
   Gösterilecek tutar: `cart.finalTotal` (kupon yoksa `cart.total` ile aynı).

4. Hata yönetimi: `catch (err) { toast.error(err.detail) }` — geçersiz/süresi dolmuş/limit dolu kupon 400/422 ile `detail` döner.

5. Checkout akışına dokunma — kupon zaten Cart'ta kayıtlı, checkout servisi otomatik uygular.

**BFF route (`src/app/api/me/cart/coupon/route.js`):**
```js
import { passThrough } from "@/lib/server/api";
export const POST = passThrough;
export const DELETE = passThrough;
```

---

#### M2 — Admin: Kupon Yönetimi

**Backend uçları (hepsi `AdminOnly`):**
```
GET    /admin/coupons        → CouponDTO[]
POST   /admin/coupons        → CouponDTO
PUT    /admin/coupons/{id}   → CouponDTO
DELETE /admin/coupons/{id}   → 204
```

**CouponDTO:**
```json
{
  "id": 1,
  "code": "HOSGELDIN10",
  "description": "İlk alışverişe %10 indirim",
  "type": "Percentage",
  "value": 10,
  "minOrderAmount": 100,
  "usageLimit": 500,
  "usageCount": 3,
  "expiresAt": "2026-12-31T23:59:59",
  "isActive": true,
  "createdAt": "2026-06-20T..."
}
```

**`type`:** `"Percentage"` veya `"FixedAmount"`.

**Sayfa: `src/app/admin/coupons/page.jsx`**
- Tablo: Kod | Tür | Değer | Min Tutar | Kullanım | Son Tarih | Aktif | İşlemler
- "Yeni Kupon" butonu → modal veya `/admin/coupons/create` sayfası
- Silme: onay modalı

**Form alanları (oluştur/düzenle):**
```
Kod*              [HOSGELDIN10]
Açıklama*         [İlk alışverişe indirim]
Tür*              ○ Yüzde (%)  ● Sabit (TL)
Değer*            [10]
Min Sipariş (TL)  [100]
Kullanım Limiti   [500]   (boş = limitsiz)
Son Geçerlilik    [2026-12-31]   (boş = süresiz)
Aktif             [✓]
```

**Admin nav'a ekle:** `src/app/admin/layout.js` → `{ href: "/admin/coupons", label: "Kuponlar" }`.

**BFF route'lar:**
```
src/app/api/admin/coupons/route.js         → GET, POST
src/app/api/admin/coupons/[id]/route.js    → PUT, DELETE
```

**Kabul kriteri:** Admin kupon oluşturur → müşteri sepete uygular → indirimi görür → checkouttan sonra `usageCount` artar.

---

### GÖREV N — Kargo Takip Görünümü
**Süre tahmini:** 1-2 saat | **Zorluk:** Düşük | **Backend:** ✅ hazır

Müşteri sipariş detay sayfasında kargo takip bilgisi; admin panelinde takip kodu girişi.

**Backend değişikliği:**
`OrderDTO` ve `AdminOrderDTO`'ya `trackingNumber (string?)` ve `trackingUrl (string?)` eklendi.
`PUT /admin/orders/{id}/status` body'si genişletildi:
```json
{
  "status": "Shipped",
  "trackingNumber": "YK123456789TR",
  "trackingUrl": "https://gonderitakip.yurticikargo.com/track/YK123456789TR"
}
```
Kargo maili backend otomatik gönderir — frontend'de mail tetikleme yok.

---

#### N1 — Müşteri sipariş detayı

**`src/app/account/orders/[id]/page.jsx`** (veya ilgili component):

`order.status === "Shipped"` veya `"Delivered"` ise ve `order.trackingNumber` doluysa:
```
┌──────────────────────────────────────┐
│ 📦 Kargo Takip                        │
│ Takip No: YK123456789TR               │
│ [Kargonuzu Takip Edin →]             │  ← trackingUrl varsa link, yoksa sadece no
└──────────────────────────────────────┘
```
Link: `<a href={order.trackingUrl} target="_blank" rel="noopener">`.
`trackingUrl` yoksa butonsuz, sadece numara göster.

---

#### N2 — Admin sipariş durum güncelleme

**`src/app/admin/orders/[id]/page.jsx`** (mevcut durum güncelleme formu):

Dropdown'da `Shipped` seçilince iki ek alan belir:
```
Kargo Takip No    [YK123456789TR]
Kargo Takip URL   [https://...]   (opsiyonel)
```
Bu alanlar yalnızca `Shipped` seçildiğinde görünür, diğer durumlar için gizli.
Submit body: `{ status: "Shipped", trackingNumber: "...", trackingUrl: "..." }`.

Mevcut siparişte `trackingNumber` doluysa okuma modunda göster:
```
Kargo Takip No: YK123456789TR  [Değiştir]
```

**Kabul kriteri:** Admin `Shipped` + takip kodu → müşteri `/account/orders/{id}`'de takip linkini görür.

---

### GÖREV O — Sipariş CSV Export Butonu
**Süre tahmini:** 30 dakika | **Zorluk:** Çok Düşük | **Backend:** ✅ hazır

**Backend ucu:** `GET /admin/orders/export?status=&dateFrom=&dateTo=` → `siparisler_YYYYMMDD.csv` dosyası indirir.

**`src/app/admin/orders/page.jsx`** mevcut filtre satırına "CSV İndir" butonu ekle:
```jsx
<a
  href={`/api/admin/orders/export?${new URLSearchParams({ status, dateFrom, dateTo }).toString()}`}
  download
  className="btn btn-secondary"
>
  CSV İndir
</a>
```

**BFF route (`src/app/api/admin/orders/export/route.js`):**
```js
import { passThrough } from "@/lib/server/api";
export const GET = passThrough;
```

`<a download>` + BFF yeterli — `fetch()` gerekmez. Aktif filtreler (status, tarih aralığı) URL'e parametreli geçilsin.

**Kabul kriteri:** "CSV İndir" tıklanınca tarayıcı `siparisler_YYYYMMDD.csv` dosyasını indirir; Excel'de Türkçe karakterler doğru görünür (backend BOM gönderiyor).

---

### GÖREV P — SEO Slug URL Güncellemesi
**Süre tahmini:** 1-2 saat | **Zorluk:** Düşük | **Backend:** ✅ hazır (627af25)

Ürün URL'leri `/products/42` → `/products/nike-air-max-2024` formatına geçiyor.

**Backend değişiklikleri:**
- `Product`'a `slug` (benzersiz) ve `metaDescription` alanları eklendi.
- Yeni route: `GET /products/{slug}` — var olan `GET /products/{id:int}` de çalışmaya devam eder.
- `ProductDetailDTO` ve `ProductListDTO`'ya `slug` ve `metaDescription` eklendi.

**Frontend değişiklikleri:**

1. **`src/lib/server/catalog.js`** — ürün detay fetch'ini slug ile yap:
   ```js
   export async function getProductBySlug(slug) {
     return backendFetch(`/products/${slug}`);
   }
   ```

2. **`src/app/products/[id]/page.jsx`** → **`src/app/products/[slug]/page.jsx`** olarak taşı:
   - `params.id` → `params.slug`
   - `getProductBySlug(slug)` kullan
   - `<head>` meta tag'larına `metaDescription` ekle:
     ```jsx
     export async function generateMetadata({ params }) {
       const { slug } = await params;
       const product = await getProductBySlug(slug);
       return {
         title: product.title,
         description: product.metaDescription ?? product.description?.slice(0, 160),
       };
     }
     ```

3. **`src/components/catalog/ProductCard.jsx`** — linki güncelle:
   ```jsx
   href={`/products/${product.slug}`}
   ```

4. **`src/app/admin/orders/[id]/page.jsx`** vb. — sipariş detayındaki ürün linkleri varsa güncelle.

5. **`src/app/api/products/[slug]/route.js`** — BFF proxy güncelle (path segment değişti).

**Dikkat:**
- Mevcut DB'deki ürünlerin slug'ı migration'da `CAST(Id AS nvarchar)` ile atandı (örn. "42").
  Bu geçerli bir slug — URL `GET /products/42` hem int route hem slug route ile çalışır, sorun yok.
  Admin panelden slug'ları düzenleyebilir.
- Checkout, sepet gibi akışlarda ürün ID'si hâlâ int — yalnızca public ürün sayfası URL'si değişiyor.

**Kabul kriteri:** `/products/nike-air-max-2024` ürün sayfasını açar; `<title>` ve `<meta description>` dolu gelir.

---

### Sonraki görevler — backend ekibinden gelecek

---

## 5. İleride değerlendirilecek

_(Görev K ve L'ye taşındı)_

---

## 6. Seed Data Referansı (geliştirme DB'sinde mevcut)

**Markalar (5):** Nike, Adidas, Zara, Mango, Vakko  
**Kategoriler (5):** Kadın Giyim, Erkek Giyim, Aksesuar, Spor, İç Giyim  
**Ürünler (20):** Her kategoride 4 ürün, stok 50-200, fiyat 149-4499 TL.

> **⚠️ Stok alanı:** Backend API `stock` bekler, `stockQuantity` değil.
> Ürün oluştururken/güncellerken: `{ stock: 50 }` — `{ stockQuantity: 50 }` değil.

---

## 7. Sorun Çıkarsa

| Belirti | Neden | Çözüm |
|---|---|---|
| Build asılıyor | `.env.local`'de `API_BASE_URL` yok | `echo "API_BASE_URL=http://localhost:8080" > .env.local` |
| API 401 | Token süresi dolmuş | Çıkış yapıp tekrar gir |
| `next/image` unconfigured host | — | `next.config.mjs` `remotePatterns` zaten `**` — düzeldi |
| `params.id` undefined | Next 15 | Server: `const { id } = await params;` / Client: `use(params)` |
| Stok 0 görünüyor | `stockQuantity` ile oluşturulmuş | `PUT /admin/products/{id}` → `{ stock: N }` |
| Checkout sonrası boş sepet | `ordered` flag | `setOrdered(true)` → `router.push()` → `reload()` (not awaited) |
| Port 3000 meşgul | Zombie process | `fuser -k 3000/tcp` |
| `.next` cache bozuldu | Uzun oturum | `rm -rf .next && npm run build` |
| Docker DB hatası | Şema uyumsuzluğu | `docker compose restart api` |
| 409 sonrası sepet güncellenmez | Backend handoff hatası | `useCart.acceptPriceChanges` kullan — sil+yeniden ekle |
