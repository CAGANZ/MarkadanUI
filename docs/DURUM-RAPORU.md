# Markadan Frontend — Durum Raporu ve Görev Listesi

**Tarih:** 2026-06-11 | **Son commit:** `a7effba` | **Build:** ✅ temiz | **E2E test:** ✅ tüm akışlar geçti
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
npm run build    # commit öncesi zorunlu — 29 sayfa hepsi geçmeli
```

---

## 1. GELİŞTİRME KURALLARI (her görevde geçerli — ZORUNLU)

1. **Renk yasakları:** Bileşenlerde `amber-*`, `neutral-*`, hex kod (`#FFF7E6`) KULLANILMAZ.
   Yalnızca tema utility'leri: `bg-primary`, `bg-primary-soft`, `bg-accent`, `bg-accent-soft`,
   `bg-surface`, `bg-surface-card`, `text-ink`, `text-ink-soft`, `border-line`,
   `bg-danger/-soft`, `bg-success/-soft`, `bg-warning/-soft`, `rounded-base`.
   Tanımlar: `src/app/theme.css` + `src/app/globals.css`.
2. **API çağrısı (client bileşen):** `import { api } from "@/lib/client/api"` →
   `await api("/me/cart", { method: "POST", body: {...} })`. Hata yakalama:
   `catch (err) { toast.error(err.detail) }` — `err.detail` her zaman Türkçe ve gösterilebilir.
   Çıplak `fetch()` client'ta YASAK.
3. **API çağrısı (RSC/server):** Public katalog için `src/lib/server/catalog.js` fonksiyonları.
   Yeni BFF route gerekirse desen: `backendFetch` + `passThrough` (örnek: `src/app/api/me/cart/route.js`).
4. **Token'a dokunma:** `localStorage`/`sessionStorage`'da token YASAK. Oturum bilgisi
   yalnızca `useAuth()` hook'undan (`user`, `loading`, `login`, `logout`). Token'lar httpOnly
   cookie'de yaşar, BFF yönetir — client kodu token görmez.
5. **Next 15:** `params` ve `searchParams` her zaman `await` edilir
   (client'ta `use(params)`). Eski sayfalardaki await'siz kullanım taşınırken düzeltilir.
6. **Durum tasarımı zorunlu:** Her liste/detay için üç durum: yükleniyor (`Skeleton`),
   boş (açıklama + yönlendirme CTA'sı), hata (`err.detail` + tekrar dene imkânı).
7. **UI kit:** Buton → `ui/Button` (variant: primary/secondary/ghost/danger/accent),
   form girdisi → `ui/Input` (label+error), onay/diyalog → `ui/Modal`,
   bildirim → `useToast()`. Yeni buton/input stili YAZILMAZ.
8. **Mobile-first:** Önce 390px genişlik düşünülür. Dokunma hedefleri ≥44px.
   Birincil aksiyon mobilde ekranın alt yarısında.
9. **Tüm UI metinleri Türkçe.**
10. **Commit:** `npm run build` geçmeden commit YOK. Mesaj Türkçe, ne+neden açıklar.

---

## 2. Tamamlananlar (özet)

| Faz | İçerik | Önemli dosyalar |
|---|---|---|
| 1 | BFF auth (httpOnly cookie + refresh kilidi), white-label tema, UI kit | `lib/server/api.js`, `app/theme.css`, `config/boutique.js`, `components/ui/*` |
| 2 | Header/SearchBox/MobileNav, ürün liste+detay, ana sayfa, filtreler | `components/layout/*`, `components/catalog/*`, `lib/server/catalog.js` |
| 3 | Login, register, hesabım, adres defteri | `app/login`, `app/register`, `app/account/*`, `components/account/AddressForm.jsx` |
| 4 | Sepet (fiyat değişikliği kilidi), checkout (409 senaryoları) | `app/cart`, `app/checkout`, `hooks/useCart.jsx`, `components/cart/*` |
| 5 | Sipariş geçmişi/detay/iptal | `app/account/orders/*`, `lib/order-status.js` |
| 6 | AdminGuard, admin nav, admin sipariş yönetimi, tüm proxy'lerde auth | `app/admin/layout.js`, `app/admin/orders/*`, `components/admin/AdminGuard.jsx` |

**E2E doğrulanan akışlar:** admin CRUD → public katalog → müşteri kayıt → sepet →
fiyat değişikliği onay döngüsü → checkout → sipariş → iptal (stok iadesiyle). Hepsi canlı backend'le test edildi.

**Bilinen backend davranışı:** 409 sonrası `GET /me/cart` snapshot'ı TAZELEMİYOR
(handoff dokümanının aksine). UI çözümü: `useCart.acceptPriceChanges` — fiyatı değişen
satırı silip aynı miktarla yeniden ekler. Backend'e `accept-prices` ucu önerildi; eklenirse
bu fonksiyon sadeleştirilir.

---

## 3. GÖREVLER (sırayla yapılacak)

### GÖREV 1 — `/brands` ve `/categories` sayfalarını yeni temaya geçir
**Süre tahmini:** 2-3 saat | **Zorluk:** Düşük

**Dosyalar:**
- `src/app/brands/page.jsx`, `src/app/categories/page.jsx` → yeniden yazılacak
- `src/app/brands/[id]/page.jsx`, `src/app/categories/[id]/page.jsx` → **silinip redirect'e çevrilecek**

**Adımlar:**
1. `brands/page.jsx`'i yeniden yaz: veriyi `getBrands()` ile çek (`lib/server/catalog.js`),
   ana sayfadaki marka grid'ini (`src/app/page.jsx` "Markalar" bölümü) büyütülmüş hâliyle kullan.
   Her kart `/products?brandId={id}`'ye gitsin. RSC olarak yaz ("use client" YOK).
2. `categories/page.jsx` aynı şekilde: `getCategories()` + ana sayfadaki kategori kartı deseni,
   linkler `/products?categoryId={id}`.
3. `[id]` sayfalarını redirect yap (ayrı detay sayfasına gerek yok — ürün listesi zaten filtreli):
   ```js
   // src/app/brands/[id]/page.jsx — tamamı bu
   import { redirect } from "next/navigation";
   export default async function BrandPage({ params }) {
     const { id } = await params;
     redirect(`/products?brandId=${id}`);
   }
   ```
   (categories için aynısı `categoryId` ile)
4. Artık kullanılmayanları sil: `components/cards/BrandCard.jsx`,
   `components/cards/CategoryCard.jsx`, `components/HorizontalScroller.jsx`
   (yalnızca bu sayfalar kullanıyordu — silmeden önce `grep -r "BrandCard" src/` ile doğrula).
5. `npm run build` → commit.

**Kabul kriteri:** İki sayfa tema renkleriyle görünür; `[id]` linkleri filtreli ürün listesine
düşer; `grep -rn "amber\|neutral-" src/app/brands src/app/categories` boş döner.

---

### GÖREV 2 — Ölü kodu sil
**Süre tahmini:** 15 dk | **Zorluk:** Çok düşük | **Görev 1'den sonra**

Kesin kullanılmıyor (doğrulandı):
```bash
git rm src/components/HScrollProducts.jsx src/components/Badges.jsx src/components/MagnifierImage.jsx
npm run build && git commit
```
> Not: `MagnifierImage` ürün detayının eski hâlindeydi; yeni detay sayfası `next/image` kullanıyor.

---

### GÖREV 3 — Admin CRUD sayfalarının tema uyumu (EN BÜYÜK İŞ)
**Süre tahmini:** 1-1.5 gün | **Zorluk:** Orta

**Dosyalar (toplam ~1.900 satır):**
| Dosya | İş |
|---|---|
| `src/app/admin/page.jsx` | Dashboard — tema uyumu + `/admin/orders` linki ekle |
| `src/app/admin/products/page.jsx` | Liste — tema + `ConfirmDeleteModal` yerine `ui/Modal` |
| `src/app/admin/products/create/page.jsx` | Form — `ui/Input` + `ui/Button`'a geçir |
| `src/app/admin/products/[id]/edit/page.jsx` | Form — aynı |
| `src/app/admin/categories/page.jsx` + `[id]/edit` | Aynı desen |
| `src/app/admin/brands/page.jsx` | Aynı desen |

**Referans desen:** `src/app/admin/orders/page.jsx` ve `[id]/page.jsx` — liste, filtre,
skeleton, boş durum, onay modalı, toast kullanımının tamamı orada örneklenmiş. **Onlara bakarak yaz.**

**Adımlar (her sayfa için aynı döngü):**
1. Çıplak `fetch` çağrılarını `api()` client'ına geçir; hata yönetimini `err.detail` + `useToast` ile yap.
2. Hardcoded renkleri tema utility'lerine çevir (Kural 1'deki liste).
3. `ConfirmDeleteModal` / `ConfirmDeleteBrandModal` / `ConfirmDeleteCategoryModal` kullanımlarını
   genel `ui/Modal` + `ui/Button variant="danger"` ile değiştir
   (örnek: `app/account/addresses/page.jsx` silme onayı). Sonra üç modal dosyasını sil.
4. `components/Pagination.jsx` kullanımlarını `components/catalog/Pager.jsx` ile değiştir
   (admin listeleri client-side olduğundan `buildHref` yerine `onClick` gerekirse Pager'a
   opsiyonel `onPage` prop'u ekle — Pager'ı bozmadan genişlet). Sonra `Pagination.jsx`'i sil.
5. Formlarda `ui/Input`'un `label` + `error` prop'larını kullan; mevcut validasyon kurallarını KORU
   (iş kuralları doğru, sadece görünüm değişiyor).
6. Her sayfa sonrası `npm run build` → tek tek commit (sayfa başına bir commit idealdir).

**Kabul kriteri:** `grep -rn "amber\|#FF\|neutral-" src/app/admin` boş döner;
tüm CRUD işlemleri çalışır (ekle/düzenle/sil canlı denenir); silme onayları `ui/Modal` ile.

**⚠️ Dikkat:** Admin sayfalarındaki mevcut validasyonlar ve iş kuralları (zorunlu alanlar,
fiyat/stok kontrolleri) bilinçli yazılmış — **silme, sadece görünümü değiştir.**

---

### GÖREV 4 — Görsel altyapısı
**Süre tahmini:** 1-2 saat | **Zorluk:** Düşük

1. `next.config.mjs`'e dış görsel domain'leri ekle (şu an dış URL verilirse `next/image` hata verir):
   ```js
   const nextConfig = {
     images: {
       remotePatterns: [
         { protocol: "https", hostname: "**" },  // MVP: tüm https kaynakları
       ],
     },
   };
   ```
   > Üretimde `**` yerine bilinen CDN domain'leriyle daraltılmalı — şimdilik MVP için kabul.
2. `src/lib/media.js` içindeki `BLUR` base64'leri hâlâ `"..."` placeholder —
   `public/media/*.webp` dosyalarından 16×16 webp üretip base64'le doldur, ya da
   `BLUR` kullanımını tamamen kaldır (şu an hiçbir bileşen import etmiyor; kaldırmak daha temiz).
   `src/lib/blurData.js` de aynı şekilde değerlendir (1 kullanım — kontrol et: `grep -rn "blurData" src/`).

---

### GÖREV 5 — Tarayıcıda görsel QA
**Süre tahmini:** Yarım gün | **Zorluk:** Düşük (dikkat işi)

Bugünkü testler API seviyesindeydi; görsel kontrol yapılmadı. Chrome DevTools'ta
**390px (iPhone 12 Pro)** ve masaüstünde şu turu yap, bozuklukları not et/düzelt:

- [ ] Ana sayfa: hero, vitrinler, kategori/marka kartları
- [ ] Ürün listesi: filtre paneli (mobilde alttan açılır), sıralama, sayfalama, boş arama sonucu (`?q=asdfgh`)
- [ ] Ürün detay: mobilde alt sabit "Sepete Ekle" çubuğu MobileNav'ın ÜSTÜNDE durmalı (bottom-14)
- [ ] Kayıt formu: hatalı girişlerde alan altı mesajlar
- [ ] Sepet: fiyat değişikliği banner'ı (admin'den fiyat değiştirerek tetikle), miktar ±, boş sepet
- [ ] Checkout: adres seçimi, yeni adres modalı, sipariş onayı → kutlama ekranı
- [ ] Siparişlerim: liste, detay, iptal onay modalı
- [ ] Admin: panel nav, sipariş filtreleri, durum güncelleme modalı
- [ ] Header: sepet rozeti güncellenmesi (ürün ekleyince anında artmalı)
- [ ] 401 senaryosu: çıkış yapıp `/account`'a git → login'e atmalı; login sonrası geri dönmeli (`?next=`)

---

### GÖREV 6 — Deploy hazırlığı (MİMARLA BİRLİKTE — tek başına başlama)
Hosting seçimi, production env, butik şablonlaması (`boutique.js` + `theme.css` + logo)
mimari karar gerektirir. Görev 1-5 bittiğinde mimarla planlanacak.

---

## 4. Sorun Çıkarsa

- **Build asılıyor / 60sn timeout:** `.env.local`'de `API_BASE_URL` var mı kontrol et.
- **API 401 dönüyor:** Çıkış yapıp tekrar gir (token süresi dolmuş + refresh reddedilmiş olabilir).
  Israr ederse backend ayakta mı: `curl http://localhost:8080/categories`.
- **Görsel hatası (`next/image` unconfigured host):** Görev 4 yapılmamış demektir.
- **`params.id` undefined:** Next 15 — `await params` unutulmuş.
- **Backend davranış soruları:** `~/MarkadanAPI/docs/FRONTEND-HANDOFF.md` + Swagger
  (`http://localhost:8080/swagger`). Handoff'taki "GET sepeti tazeler" notuna GÜVENME (bkz. §2 sonu).
