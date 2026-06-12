# Markadan Frontend — Durum Raporu ve Görev Listesi

**Tarih:** 2026-06-12 | **Son commit:** `4674140` | **Build:** ✅ temiz | **E2E test:** ✅ tüm akışlar geçti
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

### Sonraki görevler — backend ekibinden gelecek

---

## 5. İleride değerlendirilecek

- **Dinamik mağaza verisi:** `GET /store-settings` → Header/Footer'a bağla (şu an `boutique.js` statik).
- **WhatsApp ↔ Admin Settings senkronu:** `boutique.js` yerine `GET /store-settings` ile `whatsappPhone` oku.
- **Middleware auth guard:** `src/middleware.js` ile server-side token kontrolü (şu an client-side CSR).

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
