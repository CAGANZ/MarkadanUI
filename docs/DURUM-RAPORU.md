# Markadan Frontend — Durum Raporu

**Tarih:** 2026-06-11 | **Son commit:** `b64771a` | **Build:** ✅ temiz | **E2E test:** ✅ tüm akışlar geçti

> Başka makinede devam etmek için: bu dosya + `docs/MIMARI-RAPOR.md` tüm bağlamı içerir.
> Kurulum: `npm install` → `.env.local` oluştur (`API_BASE_URL=http://localhost:8080`) → backend Docker'ı kaldır → `npm run dev`

---

## 1. Tamamlanan İşler (6 faz)

### Faz 1 — Temel Altyapı
- **BFF deseni**: Tarayıcı backend'i hiç görmez; tüm istekler `src/app/api/*` route handler'lardan geçer
- **Auth**: Token'lar httpOnly cookie'de (`mk_at`, `mk_rt`) — tarayıcıya hiç inmez, XSS'e kapalı
  - `src/lib/server/api.js` → `backendFetch`: cookie→Bearer çevirimi + 401'de **tek uçlu kilitli** otomatik refresh (API her refresh'te yeni çift verir, yarış koşulu engellendi)
- **White-label**: `src/config/boutique.js` (ad/logo/iletişim) + `src/app/theme.css` (CSS değişkenleri) + Tailwind v4 `@theme` köprüsü → `bg-primary`, `text-ink` gibi utility'ler. **Kural: bileşenlerde sabit renk yasak.**
- **UI kit**: `src/components/ui/` → Button, Input, Modal (mobilde bottom sheet), Toast, Skeleton
- **Hata sözleşmesi**: `src/lib/api-error.js` — ProblemDetails parse, `err.detail` doğrudan gösterilebilir (Türkçe)

### Faz 2 — Katalog
- Header (RSC, kategoriler `revalidate:60`) + SearchBox + HeaderActions (sepet rozeti)
- **MobileNav**: mobil alt navigasyon (h-14); admin sayfalarında gizli
- `/products`: filtre (kategori/marka/fiyat) + sıralama + arama + sayfalama — tümü URL'de (paylaşılabilir)
- `/products/[id]`: breadcrumb, benzer ürünler, mobilde sticky "Sepete Ekle" (bottom-14, MobileNav üstünde)
- Ana sayfa: hero + yeni gelenler + kategori/marka vitrinleri
- `src/lib/server/catalog.js`: RSC veri katmanı, `revalidate: 60` (rate limit 60/dk koruması), boş env + 8sn timeout guard'ı

### Faz 3 — Üyelik
- `/login` (`?next=` dönüş desteği, admin'i panele yönlendirir), `/register` (TC/telefon/şifre validasyonları)
- `/account`: profil + kısayollar + çıkış; `/account/addresses`: CRUD (paylaşılan `AddressForm`)

### Faz 4 — Sepet + Checkout
- `/cart`: miktar ± (0=sil), onaylı boşaltma, **fiyat değişikliği banner'ı** — `hasPriceChanges` iken "Ödemeye Geç" KİLİTLİ
- `acceptPriceChanges` (useCart): fiyatı değişen satırı sil + aynı miktarla yeniden ekle → yeni snapshot (bkz. §3 backend notu)
- `/checkout`: radio adres seçimi + modal yeni adres; 409 → sepet tazele + toast + `/cart`'a dön; başarıda `/account/orders/{id}?new=1`

### Faz 5 — Siparişler
- `/account/orders`: liste (MRK numarası, durum rozeti); `/account/orders/[id]`: detay + `?new=1` kutlaması + kopyalanabilir sipariş no + snapshot adres açıklaması + yalnızca `Ordered` için onaylı iptal

### Faz 6 — Admin
- `AdminGuard` (`isAdmin` değilse atar) + admin nav (`src/app/admin/layout.js`)
- `/admin/orders`: durum + tarih filtreli liste; `/admin/orders/[id]`: userEmail'li detay + onaylı durum güncelleme
- **Tüm admin proxy'leri auth kazandı** (eskiden token hiç iletilmiyordu!)

## 2. E2E Test Sonuçları (canlı backend'le doğrulandı)

✅ Admin login → kategori/marka/ürün ekleme → public katalogda görünme
✅ Müşteri kaydı → adres → sepet (snapshot fiyat) → checkout → sipariş `MRK-…`
✅ Stok düşümü (25→23) ve iptalde iadesi (→25); tekrar iptal 409
✅ Fiyat değişikliği: `priceChanged` algılama → checkout 409 engeli → onay akışı → checkout 200
✅ Auth'suz `/api/me/cart` → 401; user token'la admin ucu → 403

## 3. Backend Ekibiyle Konuşulacaklar

1. **Snapshot tazeleme ucu yok** — Handoff "409 sonrası GET fiyatları günceller" diyordu ama GET de PUT de snapshot'ı tazelemiyor (sonsuz 409 döngüsü riski). UI'da sil+yeniden-ekle workaround'u çalışıyor. **İdeal çözüm:** `POST /me/cart/accept-prices` benzeri bir uç.
2. ~~Checkout 500 (EF `SqlServerRetryingExecutionStrategy` + manuel transaction)~~ → **düzeltildi, doğrulandı** ✓

## 4. Kalan İşler (öncelik sırasıyla)

| # | İş | Kapsam | Not |
|---|---|---|---|
| 1 | **Eski admin CRUD sayfalarının tema uyumu** | `admin/page.jsx`, `admin/products/*`, `admin/categories/*`, `admin/brands/page.jsx` (~1.900 satır) | Çalışıyor ama amber hardcoded; UI kit + tema utility'lerine geçirilmeli. `ConfirmDelete*Modal`'lar genel `Modal`'a birleşebilir |
| 2 | **Eski bileşen temizliği** | `HScrollProducts` (artık kullanılmıyor olabilir — kontrol et), `Badges`, `HorizontalScroller`, `cards/BrandCard`, `cards/CategoryCard`, `MagnifierImage`, `Pagination` | Kullanılmayanlar silinmeli; kullanılanlar tema uyumlu hale getirilmeli |
| 3 | **`/brands` ve `/categories` sayfaları tema uyumu** | `brands/page.jsx`, `categories/page.jsx`, `[id]` sayfaları | Hâlâ eski stil; ProductCard/tema utility'lerine geçirilmeli. `[id]` sayfaları `/products?brandId=` filtresine yönlendirilebilir (basitleştirme) |
| 4 | **Görsel yükleme stratejisi** | Ürün/marka/kategori görselleri şu an URL string | `next.config.mjs`'e `images.remotePatterns` ekle (dış görsel domain'leri için zorunlu); `lib/media.js`'teki BLUR base64'leri doldurulmalı |
| 5 | **Tarayıcıda görsel QA** | Tüm sayfalar gerçek cihazda/tarayıcıda gezilmeli | Bugünkü testler API seviyesindeydi; görsel kontrol yapılmadı. `/qa` veya `/design-review` ile sistematik yapılabilir |
| 6 | **Deploy hazırlığı** | Dockerfile / hosting seçimi, production env, `boutique.js` + `theme.css` butik şablonu | Butik başına: `.env` + `boutique.js` + `theme.css` + logo değişir |
| 7 | **İyileştirmeler (opsiyonel)** | Arama önerileri (debounce hazır: `useDebounce`), sepette adet sınırı UX'i, sipariş durumu genişlerse `order-status.js` sözlüğü güncelle | Backend'e yeni statüler (Shipped, Delivered) eklenirse UI hazır — sadece sözlük dosyası |

## 5. Önemli Teknik Notlar (yeni makine için)

- **`.env.local` zorunlu**: `API_BASE_URL=http://localhost:8080` — yoksa build asılır (guard eklendi ama env yine de gerekli)
- Backend repo: `~/MarkadanAPI` (Docker: `docker compose up -d`); admin bilgileri backend `.env`'inde (`Seed__AdminEmail/Password`)
- Build: `npm run build` — 29 sayfa, hepsi geçmeli
- Mimari kararların tamamı: `docs/MIMARI-RAPOR.md`
- Git: tek branch `Main`, push edilmiş durumda
