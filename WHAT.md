# WHAT — Markadan Nedir, Neden Böyle Tasarlandı

## Ne bu proje

Markadan, küçük işletme sahiplerine kendi e-ticaret mağazalarını kurma imkânı veren white-label bir platformdur. Her müşteriye özel paketlenip verilir — kendi markası, kendi teması, kendi alan adıyla.

Pazaryerleri (Trendyol, Hepsiburada) %15-25 komisyon alıyor. Bu platform işletme sahiplerinin kendi müşterileriyle doğrudan ilişki kurmasını ve komisyon ödemeden satış yapmasını sağlıyor.

---

## Mimari model

**Multi-instance, single-tenant:**
Her müşteri ayrı bir sunucuda (Docker container) + ayrı veritabanında çalışır. Bir müşterinin verisi diğerini etkileyemez.

**Neden bu model?**
Multi-tenant (tek DB, TenantId kolonu) daha az kaynak kullanır ama bir bug tüm müşterileri etkiler, her müşteri için ayrı özelleştirme zorlaşır. Trade-off: her yeni müşteri için ayrı deploy — müşteri sayısı 50-100 bandında kalması bekleniyor.

---

## Teknik stack

| Katman | Teknoloji | Neden seçildi |
|--------|-----------|---------------|
| Backend | ASP.NET Core Web API (.NET 9) | Ekip .NET biliyor, güçlü tip sistemi |
| Frontend | Next.js 15 (App Router) | SSR + BFF pattern, SEO desteği |
| Veritabanı | SQL Server (Docker) | Mevcut altyapıyla uyumlu |
| Auth | JWT + httpOnly cookie | Token browser JS'e hiç ulaşmaz — XSS güvenli |
| Deploy | Docker Compose | Kolay paketleme, instance başına izolasyon |
| Frontend tema | Tailwind v4 CSS variables | White-label için renk/şekil özelleştirilebilir |

---

## Kritik mimari kararlar

### httpOnly Cookie + BFF Pattern
**Ne:** Access token hiçbir zaman frontend JS'ine ulaşmıyor. Next.js BFF katmanı cookie'yi yönetiyor, backend'e proxy'liyor.  
**Neden:** XSS saldırısıyla token çalınamaz.  
**Alternatif:** localStorage — hızlı implementasyon ama güvensiz.

### Client-side auth guard (şimdilik)
**Ne:** Admin ve hesap sayfaları CSR'da kontrol ediliyor (`useAuth()` hook), middleware yok.  
**Neden:** Hız — middleware server-side token doğrulaması ekstra latency getirir.  
**İleride:** `src/middleware.js` ile server-side token kontrolü yapılabilir.

### 409 sonrası sepet sorunu
**Ne:** Backend fiyat değişikliği sonrası `GET /me/cart` snapshot'ı tazelemiyor.  
**Geçici çözüm:** `useCart.acceptPriceChanges` — satırı silip yeniden ekliyor.  
**Kalıcı:** Backend'de `POST /me/cart/accept-prices` ucu yazılacak.

### FormData / multipart özel davranış
**Ne:** `api()` wrapper'ı her zaman `Content-Type: application/json` ekliyor. CSV yükleme için direkt `fetch()` kullanılıyor.  
**Neden:** Multipart boundary browser tarafından otomatik set edilmeli.

---

## Repolar ve servisler

**Repolar:**
- Backend: `git@github.com:CAGANZ/MarkadanAPI.git` (branch: main)
- Frontend: `git@github.com:CAGANZ/MarkadanUI.git` (branch: Main)

**Çalışan servisler (local):**
- Frontend: `http://localhost:3000`
- API: `http://localhost:8080` — REST API + Swagger (`/swagger`)
- DB: `localhost:1433` — SQL Server (Docker)
- Admin: `admin@markadan.com` / şifre `~/MarkadanAPI/.env`'de

---

## Dosya haritası (frontend)

```
src/app/                          → Next.js sayfalar (App Router)
src/app/api/                      → BFF proxy route'ları
src/app/admin/                    → Admin paneli sayfaları
src/app/account/                  → Kullanıcı hesap sayfaları
src/components/ui/                → UI kit (Button, Modal, Input, Toast...)
src/components/catalog/           → Ürün kartı, WishlistButton
src/components/layout/            → Header, MobileNav
src/lib/client/api.js             → Client API wrapper (çıplak fetch yasak)
src/lib/server/api.js             → BFF: backendFetch + passThrough
src/lib/server/catalog.js         → Public katalog RSC fonksiyonları
src/config/boutique.js            → White-label statik config
src/app/theme.css                 → CSS variable tanımları
docs/DURUM-RAPORU.md              → Frontend handoff belgesi (geliştiriciye)
docs/MIMARI-RAPOR.md              → Mimari kararlar (detaylı)
```
