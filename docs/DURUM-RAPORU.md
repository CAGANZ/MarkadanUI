# Markadan Frontend — Durum Raporu ve Görev Listesi

**Tarih:** 2026-06-25 | **Son backend commit:** `b104b08` | **Build:** ✅ temiz | **E2E test:** ✅ tüm akışlar geçti
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

**2026-06-25 backend değişiklikleri (GÖREV T + F2 tamamlandı):**
- **F2 accept-prices:** `POST /me/cart/accept-prices` — fiyat değişen tüm item snapshot'larını güncel fiyata eşitler. `useCart` workaround'u (sil+yeniden ekle) bu uçla değiştirilmeli. Yanıt: `CartDTO`.
- **T4 IsActive:** `Product`'a `isActive` (bool) eklendi. `PATCH /admin/products/{id}/active` body: `{ "isActive": bool }` → 200. Admin liste ve detay DTO'larına `isActive` eklendi. Public katalog yalnızca `isActive=true` döndürür. **UI todo:** `src/app/api/admin/products/[id]/active/route.js` (PATCH passthrough) — toggle zaten listede aktif hale gelir.
- **T2 Ürün export:** `GET /admin/products/export?q=&sort=` → `urunler_YYYYMMDD.csv` (BOM'lu UTF-8). **UI todo:** `src/app/api/admin/products/export/route.js` (GET passthrough) + `<a download>` butonu (T1 butonu bu route'a yönlendirilecek).
- **T6 Bulk güvenlik:** Satır limiti (5.000), binary MIME kontrolü, ImageUrl http/https zorunlu, rate limit (dk/5).
- **T3 Bulk UPSERT:** `POST /admin/products/bulk` artık upsert — `Title+BrandName` eşleşmesi, eşleşen güncellenir, yeni eklenir, dosyada olmayan **silinmez**. Yanıt: `{ succeeded, failed, errors }`.

**2026-06-22–23 backend değişiklikleri (yeni görevler R–S için bağlam):**
- **G4 Tekrar sipariş ver:** `POST /me/orders/{id}/reorder` eklendi. Tamamlanan siparişin ürünlerini aktif sepete kopyalar; stokta olmayan ürünler atlanır, güncel fiyat snapshot alınır. Yanıt: `CartDTO`.
- **G12 Benzer ürünler:** `GET /products/{id}/related?limit=6` eklendi. Aynı kategori, stokta olan, fiyata yakın ürünler döner. Yanıt: `ProductListDTO[]`.
- **G13 WhatsApp bildirimi:** Sipariş onaylanınca `AppUser.PhoneNumber` varsa WhatsApp mesajı gönderilir. Frontend'in müşteriden telefon alması gerekiyor (bkz. GÖREV S).

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

### GÖREV Q — Stok Bildirimi (Giriş Gerektirmez)
**Süre tahmini:** 1-2 saat | **Zorluk:** Düşük | **Backend:** ✅ hazır (G3)

Tükenmiş ürün sayfasında "Stok gelince haber ver" butonu. Kullanıcı giriş yapmak zorunda değil.

**Backend ucu:**
```
POST /products/{id}/notify-stock
Body: { "email": "string", "name": "string?" }
Yanıt 200: { "message": "..." }
Yanıt 404: ürün bulunamadı
Aynı email ile tekrar kayıt → 200 (idempotent, hata vermez)
```
Stok restore edilince (admin ürünü günceller, Stock 0→pozitif) kayıtlı tüm e-postalar mail alır ve kayıt silinir.

**Frontend değişiklikleri:**

1. **`src/components/catalog/ProductDetail.jsx`** (veya ürün detay bileşeni):
   - `product.stock === 0` iken `StockNotifyForm` bileşeni göster, sepete ekle butonunu gizle.

2. **Yeni bileşen `src/components/catalog/StockNotifyForm.jsx`:**
   ```jsx
   // Email input + "Haber ver" butonu
   // Başarıda toast + form gizle
   const handleSubmit = async (e) => {
     e.preventDefault();
     await api(`/products/${productId}/notify-stock`, {
       method: "POST",
       body: { email, name },
     });
     toast.success("Stok geldiğinde e-posta ile bildirileceksiniz.");
     setSubmitted(true);
   };
   ```

**Kabul kriteri:** Stoku 0 olan ürün sayfasında form görünür; email girilip gönderilince toast çıkar, form yerine "Kaydınız alındı" mesajı gelir.

---

### GÖREV R — Tekrar Sipariş Ver
**Süre tahmini:** 1 saat | **Zorluk:** Düşük | **Backend:** ✅ hazır (G4)

Müşteri sipariş detay sayfasında tamamlanmış siparişlere "Tekrar Sipariş Ver" butonu.

**Backend ucu:**
```
POST /me/orders/{id}/reorder
Body: (boş)
Yanıt 200: CartDTO  ← aktif sepet güncellendi
Yanıt 404: sipariş bulunamadı
Yanıt 400: sipariş aktif/ödeme bekleniyor durumunda (tekrar siparişe uygun değil)
```
Stokta olmayan ürünler atlanır, güncel fiyat snapshot alınır. Sepette zaten varsa miktar artırılır.

**Frontend değişiklikleri:**

1. **`src/app/account/orders/[id]/page.jsx`** — sipariş `Delivered` veya `Cancelled` ise "Tekrar Sipariş Ver" butonu göster:
   ```jsx
   {(order.status === "Delivered" || order.status === "Cancelled") && (
     <Button onClick={handleReorder} loading={reordering}>
       Tekrar Sipariş Ver
     </Button>
   )}
   ```

2. Handler:
   ```js
   const handleReorder = async () => {
     setReordering(true);
     try {
       await api(`/me/orders/${order.id}/reorder`, { method: "POST" });
       toast.success("Ürünler sepetinize eklendi.");
       router.push("/cart");
     } catch (err) {
       toast.error(err.detail);
     } finally {
       setReordering(false);
     }
   };
   ```

3. **BFF route `src/app/api/me/orders/[id]/reorder/route.js`:**
   ```js
   import { passThrough } from "@/lib/server/api";
   export const POST = passThrough;
   ```

**Kabul kriteri:** Teslim edilmiş sipariş detayında "Tekrar Sipariş Ver" tıklanınca sepete yönlendirir; tükenmiş ürünler atlanmış, kalan ürünler sepette.

---

### GÖREV S — Benzer Ürünler + WhatsApp Telefon
**Süre tahmini:** 2-3 saat | **Zorluk:** Düşük | **Backend:** ✅ hazır (G12 + G13)

#### S1 — Ürün detayına benzer ürünler bölümü

**Backend ucu:**
```
GET /products/{id}/related?limit=6
Yanıt: ProductListDTO[]
```
`ProductListDTO` zaten kullandığın `ProductCard` bileşeniyle uyumlu.

**`src/app/products/[slug]/page.jsx`** (veya `ProductDetail` bileşeni):
```jsx
// Ürünün altına ekle
const related = await getRelatedProducts(product.id);

{related.length > 0 && (
  <section>
    <h2>Benzer Ürünler</h2>
    <div className="product-grid">
      {related.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  </section>
)}
```

**`src/lib/server/catalog.js`'e ekle:**
```js
export async function getRelatedProducts(productId, limit = 6) {
  return backendFetch(`/products/${productId}/related?limit=${limit}`);
}
```

**Kabul kriteri:** Ürün detay sayfasının altında aynı kategoriden en fazla 6 ürün görünür; tıklanınca ilgili ürün sayfasına gider.

---

#### S2 — Kayıt / profil sayfasına telefon alanı

WhatsApp bildirimleri için `AppUser.PhoneNumber` dolu olmalı. `IdentityUser.PhoneNumber` zaten var; backend `PUT /me/profile` ile güncelleniyor.

**`src/app/register/page.jsx`** — opsiyonel telefon alanı ekle:
```
Telefon (WhatsApp)  [+90 5XX XXX XX XX]   ← opsiyonel
```
Kayıt body'sine `phoneNumber` ekle. Backend `POST /auth/register`'ı kontrol et — alan kabul ediliyorsa direkt, değilse kayıt sonrası `PUT /me/profile` ile güncelle.

**`src/app/account/profile/page.jsx`** (varsa) — mevcut profil düzenleme formuna da ekle.

**Kabul kriteri:** Kayıt sırasında telefon girilince sipariş onayında WhatsApp mesajı gider (backend `WhatsApp__Enabled=true` iken).

---

### GÖREV T — Ürün Yönetimi: Export, Bulk Upsert, Pasif Durum, Varyantlar
**Süre tahmini:** T1 ✅ bitti · T2-T3-T4-T6 backend ✅ bitti · T5 backend ✅ bitti (2026-07-11), frontend bekliyor | **Tetikleyen:** QA sonrası Çağan geri bildirimi (2026-06-24)

Site uçtan uca test edildi. Ürün yönetiminde 5 iyileştirme tespit edildi. T1 frontend'de tamamlandı; T2–T6 backend'de tamamlandı, T5'in frontend tarafı (opsiyon/varyant editörü, ürün detayı seçici, sepet gösterimi) hâlâ bekliyor.

---

#### T1 — CSV Dışa Aktarma (çekme) ✅ TAMAMLANDI (frontend, 2026-06-24)
**Amaç:** Var olan ürünleri CSV olarak indir → Excel'de toplu düzenle → tekrar yükle (round-trip).

Yapılan: `src/app/admin/products/page.jsx` → "CSV İndir" butonu. Tüm ürünler `/admin/products` listesinden (büyük pageSize) çekilir; admin liste `description` döndürmediği için her ürün `/admin/products/{id}` detayından tamamlanır (8'lik eşzamanlı gruplar). Çıktı yükleme ile **aynı başlık**: `Title,Description,Price,Stock,BrandName,CategoryName,ImageUrl`. UTF-8 BOM + CRLF (Excel Türkçe uyumu). Dosya: `urunler_YYYYMMDD.csv`.

**Sınırlama:** Katalog büyüdükçe (yüzlerce ürün) N adet detay çağrısı yapılıyor — geçici çözüm. Kalıcı çözüm T2.

#### T2 — Backend `/admin/products/export` Endpoint (kalıcı çözüm) — ✅ TAMAMLANDI (backend 2026-06-25, frontend bağlandı)
T1'in client-side detay çağrılarını ortadan kaldırır. `/admin/orders/export` ile birebir aynı desen:
```
GET /admin/products/export?q=&sort=
→ text/csv; charset=utf-8 (BOM'lu), Content-Disposition: attachment; filename="urunler_YYYYMMDD.csv"
Başlık satırı: Title,Description,Price,Stock,BrandName,CategoryName,ImageUrl
```
Hazır olunca frontend'de tek satır BFF route (`src/app/api/admin/products/export/route.js`, orders/export'un kopyası) + butonu `<a download href="/api/admin/products/export?...">`'a çevir. **Kabul:** tek istekte tüm katalog, description dahil, doğru iner.

#### T3 — Bulk Yükleme Semantiği: UPSERT (eskiyi silme) — ✅ TAMAMLANDI (2026-06-25, sadece backend — frontend değişikliği yok)
**Sorun:** `POST /admin/products/bulk` davranışı belgesiz. Dosyada olmayan eski ürünlerin silinip silinmediği bilinmiyor. **İstenen:** eskiler silinmeden, dosyadakiler eklensin/güncellensin.
- Varsayılan davranış **append/upsert** olmalı: CSV'de olmayan ürünler **silinmez**.
- Eşleştirme anahtarı netleştirilsin: `slug` (benzersiz) veya `Title+BrandName`. Eşleşen ürün **güncellenir**, eşleşmeyen **eklenir**.
- (Opsiyonel) `?mode=upsert|append|replace` query parametresi — varsayılan `upsert`. `replace` yalnızca açıkça istenirse.
- Boş hücre davranışı tanımlansın: boş `Description` mevcut açıklamayı **silmemeli** (T1 export zaten dolduruyor ama elle düzenlemede risk).

**Kabul:** 20 ürünlük katalogda, 2 ürünlük CSV yüklenince diğer 18 ürün yerinde kalır; 2 ürün eklenir/güncellenir.

#### T4 — İçerik Açmadan Pasife Alma — ✅ TAMAMLANDI (backend 2026-06-25, frontend bağlandı)
**Sorun:** Pasif ürün yapmak için ürünü düzenleme sayfasına girmek gerekiyor; modelde `isActive` alanı yok.

Backend:
- `Product`'a `isActive` (bool, default `true`) ekle. `ProductListDTO` ve `ProductDetailDTO`'ya ekle.
- Toggle endpoint: `PATCH /admin/products/{id}/active` body `{ "isActive": bool }` → 200.
- Public katalog (`GET /products`, `/products/{slug}`) **yalnızca `isActive=true`** döndürmeli. Admin liste hepsini döndürür.

Frontend (hazır, backend bekliyor): `src/app/admin/products/page.jsx`'te liste satırına "Aktif/Pasif" toggle eklendi; `items[0].isActive !== undefined` olunca **otomatik görünür**. Handler `PATCH /admin/products/{id}/active` çağırıyor. Backend hazır olunca tek yapılacak: BFF route `src/app/api/admin/products/[id]/active/route.js` (PATCH passthrough) eklemek.

**Kabul:** Listede toggle'a basınca ürün anında pasife/aktife geçer; pasif ürün public katalogda görünmez.

#### T5 — Jenerik Ürün Varyantları / Opsiyonları — **BACKEND ✅ TAMAMLANDI (2026-07-11) / frontend bekliyor**
**Amaç:** Sadece kıyafet bedeni değil; takı/eşarp/elektronik için renk, kapasite vb. **isteğe bağlı** seçenekler.

Uygulanan model (EAV değil, opsiyon+varyant):
```
ProductOption      { id, productId, name ("Beden"/"Renk"), sortOrder }
ProductOptionValue { id, optionId, value ("M"/"Kırmızı"), sortOrder }
ProductVariant     { id, productId, sku?, price? (null→ürün fiyatı), stock, imageUrl?, isActive }
ProductVariantValue{ variantId, optionValueId }   // M:N — bir varyantı oluşturan seçim kombinasyonu
```
- Varyantsız ürün mevcut akışla çalışmaya devam ediyor — `stock`/`price` ürün düzeyinde, `options`/`variants` boş dizi döner.
- Varyantlı üründe sepete eklerken `productVariantId` **zorunlu**; basit üründe gönderilirse 409.
- Stok düşümü/iadesi varyant bazında (checkout, iptal, reorder hepsi varyant-farkında).

**Admin uçları** (`[Authorize(Policy="AdminOnly")]`, tümü `admin/products/{productId}/...` altında):
```
GET    /admin/products/{id}/options                       opsiyon (eksen) listesi + değerleri
POST   /admin/products/{id}/options                       { name, sortOrder, values?:[{value,sortOrder}] }
DELETE /admin/products/{id}/options/{optionId}             (varyantta kullanılıyorsa 409)
POST   /admin/products/{id}/options/{optionId}/values      { value, sortOrder }
DELETE /admin/products/{id}/option-values/{valueId}        (varyantta kullanılıyorsa 409)

GET    /admin/products/{id}/variants                       varyant listesi
POST   /admin/products/{id}/variants                       { sku?, price?, stock, imageUrl?, isActive, optionValueIds:[..] }
PUT    /admin/products/{id}/variants/{variantId}           aynı body, tam güncelleme
DELETE /admin/products/{id}/variants/{variantId}            (sepette/siparişte kullanılıyorsa 409 — "pasife alın")
```
Kurallar: aynı üründe aynı isimli eksen olmaz, aynı eksende aynı değer olmaz, aynı seçenek kombinasyonuyla iki varyant olmaz — hepsi 409 ile engellenir.

**Public/müşteri tarafında değişen uçlar:**
- `GET /products/{id}` ve `GET /products/{slug}` yanıtına eklendi:
  ```
  options: [{ id, name, values: [{ id, value }] }]
  variants: [{ id, sku, price, stock, imageUrl, optionValueIds:[..] }]
  ```
  `price` her zaman **etkin fiyat** (varyantın kendi fiyatı yoksa ürün fiyatı) — frontend ek hesap yapmasın.
- `POST /me/cart/items` body'sine `productVariantId` eklendi (varyantlı üründe zorunlu).
- `GET /me/cart`, sipariş DTO'ları (`GET /me/orders/{id}`, admin sipariş detayı) satırlarına `variantId` + `variantLabel` ("Kırmızı / M") eklendi — UI seçili varyantı tek alandan gösterebilir.

**Frontend görevi (bu madde kapsam dışı bırakıldı, ayrı iş):** ürün detayında seçenek seçici (options → uyumlu variant bul → price/stock/image güncelle), admin'de opsiyon/varyant editörü, sepet/sipariş satırlarında `variantLabel` gösterimi.

#### T6 — CSV Yükleme Güvenliği — ✅ TAMAMLANDI (frontend 2026-06-24, backend 2026-06-25)
CSV yükleme bir dosya alım yüzeyi; saldırı vektörleri ele alındı.

**Frontend'de yapıldı (2026-06-24, defense-in-depth):**
- BFF `src/app/api/admin/products/bulk/route.js`: token yoksa 401; `Content-Length` > 10 MB → 413 (gövde belleğe alınmadan); dosya yoksa/boşsa 400; uzantı `.csv` değilse veya tip beyaz listede değilse 415.
- `src/middleware.js`: `/api/admin/*` matcher'a eklendi — kimliksiz çağrı erken 401 JSON (redirect değil).
- Frontend form: yükleme öncesi uzantı + boyut + boş dosya kontrolü.
- CSV **export** (T1): formül enjeksiyonu sanitizasyonu — `=`, `+`, `@` ile başlayan hücreler `'` ile metne çevrilir.

**Backend'de ZORUNLU (asıl otorite — frontend kapıları bypass edilebilir, doğrudan API'ye istek atılabilir):**
1. **Rol kontrolü:** `/admin/*` uçları `Admin` rolü olmayan token'ı **403** ile reddetmeli. Middleware yalnızca token *varlığına* bakıyor, role bakmıyor — yetki kontrolü tamamen backend'de.
2. **Sunucu tarafı boyut limiti:** ASP.NET `MultipartBodyLengthLimit` / request body limiti (örn. 10 MB). BFF limiti bypass edilebilir.
3. **Satır sayısı limiti:** örn. max 5.000 satır → aşılırsa 413/400. Aşırı satır = DoS / uzun işlem.
4. **İçerik doğrulama (MIME sniffing):** uzantı değil içerik kontrol edilmeli; gerçek metin/CSV değilse reddet. İlk byte'lar binary ise reddet.
5. **Alan bazlı validasyon:** `Price` sayısal ve ≥0, `Stock` integer ≥0, `Title` zorunlu/uzunluk limiti, `ImageUrl` yalnızca `http(s)://` şeması — `file://`, `data:`, iç ağ adresleri (SSRF) reddedilmeli; backend bu URL'i fetch ediyorsa allowlist/host doğrulaması.
6. **Hata raporu:** hatalı satırlar işlemi tümden düşürmemeli; `{ succeeded, failed, errors:[{row,reason}] }` döndürülmeli (frontend zaten bu şekli gösteriyor).
7. **Formül enjeksiyonu (backend export T2):** `/admin/products/export` üreten taraf da `=`/`+`/`@` hücrelerini sanitize etmeli.
8. **Rate limit:** bulk endpoint'e dakikada birkaç istekten fazlası throttle edilmeli.

**Kabul:** Admin olmayan token `/admin/products/bulk`'a 403 alır; 10 MB üstü / 5.000+ satır reddedilir; `ImageUrl=file:///etc/passwd` içeren satır hata olarak raporlanır, işlem diğer satırları işler.

**Öncelik sırası (uygulandı):** T6 (güvenlik) → T3 (veri kaybı riski) → T4 (sık kullanılan) → T2 (export iyileştirme) → T5 (yeni özellik). Hepsi backend'de bitti; **kalan tek iş T5'in frontend'i** (bkz. T5 bölümü sonu).

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
