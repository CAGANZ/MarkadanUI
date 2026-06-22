# STATUS — Markadan Frontend Şu An Neredeyiz

**Son güncelleme:** 2026-06-22  
**Güncelleyen:** Claude

---

## Şu an ne durumda

GÖREV J→O tamamlandı (commit: a3a3017). DESIGN.md oluşturuldu. Backend ekibinden yeni görev bekleniyor.

---

## Son oturumda ne yapıldı

**2026-06-22**
- DESIGN.md oluşturuldu (Cormorant Garamond + Instrument Sans, editorial butik yönü)
- GÖREV J: Sipariş iptal akışı — 6 durum, canCustomerCancel, iade mesajları, admin dropdown genişletildi
- GÖREV K: Dinamik mağaza verisi — getStoreSettings() + 60s cache, Header/Footer/products bağlandı
- GÖREV L: Middleware auth guard — /account ve /admin token yoksa /login?next= yönlendirmesi
- GÖREV M: Kupon UI — useCart applyCoupon/removeCoupon, sepet kupon girişi, admin CRUD (/admin/coupons)
- GÖREV N: Kargo takip — müşteri sipariş detayında takip bloğu, admin Shipped seçilince form alanları
- GÖREV O: CSV export butonu admin sipariş listesine eklendi
- Build: temiz ✅

**2026-06-13**
- GÖREV I (iyzico ödeme entegrasyonu) frontend tamamlandı:
  - `src/app/api/me/checkout/initiate/route.js` — yeni BFF proxy
  - `src/app/api/me/checkout/confirm/route.js` — yeni BFF proxy
  - `src/app/checkout/page.jsx` — 2 adımlı iyzico akışı (initiate → popup → confirm)
  - Adres format düzeltmesi: ` / ` → `, ` (checkout + adreslerim sayfası)
- **Backend blocker:** `POST /me/checkout/initiate` → iyzico `"Geçersiz imza"` hatası (409). Sandbox API Key/Secret Key doğrulanmalı.

**2026-06-12**
- GÖREV G (Görsel QA) tamamlandı — tüm akışlar headless Chromium ile test edildi
- Bug düzeltildi: `src/app/api/admin/settings/route.js` eksikti, Mağaza Ayarları hata veriyordu (`4674140`)
- GÖREV H (Deploy) ertelendi — geliştirme aşamasında deploy gerekmez, local yeterli
- claude-templates sistemi kuruldu (WHO / WHAT / STATUS / CLAUDE.md)

**2026-06-12 (önceki)**
- Faz 8 tamamlandı: next.config.mjs fix, admin CRUD sayfaları, WhatsApp butonu, Mağaza Ayarları, CSV yükleme, Favori listesi
- DURUM-RAPORU.md güncellendi ve commit edildi

---

## Devam Eden

Yok — bekleme modunda.

---

## Sıradaki (öncelik sırasıyla)

Backend ekibinden gelecek.

---

## Tamamlananlar

| Tarih | Görev | Notlar |
|-------|-------|--------|
| 2026-06-22 | GÖREV J — İptal akışı güncelleme | 6 durum, canCustomerCancel, iade mesajları |
| 2026-06-22 | GÖREV K — Dinamik mağaza verisi | getStoreSettings() 60s cache, Header/Footer/products |
| 2026-06-22 | GÖREV L — Middleware auth guard | /account + /admin token kontrolü, ?next= yönlendirme |
| 2026-06-22 | GÖREV M — Kupon UI | sepet kupon girişi + admin CRUD |
| 2026-06-22 | GÖREV N — Kargo takip | müşteri detay bloğu + admin Shipped formu |
| 2026-06-22 | GÖREV O — CSV export | Admin sipariş listesine CSV İndir butonu |
| 2026-06-22 | DESIGN.md | Tasarım sistemi belgesi oluşturuldu |
| 2026-06-12 | GÖREV G — Görsel QA | admin/settings BFF route bug'ı bulundu ve düzeltildi |
| 2026-06-12 | Faz 8F — Favori listesi | WishlistButton + /account/wishlist + 3 BFF route |
| 2026-06-12 | Faz 8E — CSV toplu yükleme | Admin modal + BFF multipart proxy |
| 2026-06-12 | Faz 8D — Admin Mağaza Ayarları | GET/PUT /admin/settings, renk picker |
| 2026-06-12 | Faz 8C — WhatsApp butonu | Masaüstü + mobil bar, boutique.js whatsappPhone |
| 2026-06-12 | Faz 8B — Admin CRUD sayfaları | brands/create, brands/[id]/edit, categories/create |
| 2026-06-12 | Faz 8A — Görsel altyapı | next.config.mjs wildcard, blurData.js silindi |
| 2026-06-11 | Faz 7 | Kart redesign, ana sayfa revizyon, brands/categories RSC |
| 2026-06-10 | Faz 6 | AdminGuard, admin nav, sipariş yönetimi |
| — | Faz 1-5 | Auth, tema, UI kit, katalog, hesap, sepet, checkout, sipariş |

---

## Kim ne yapıyor

| Kişi / Araç | Sorumluluk | Şu an |
|-------------|------------|-------|
| Çağan | Backend mimari + ürün kararları | Yeni görevler verecek |
| Claude | Frontend geliştirme, QA | Beklemede |

---

## Dikkat — Bu Oturumda Unutma

- CSV yükleme format notu: backend `BrandName/CategoryName` (isim bazlı) bekliyor — Swagger'dan doğrulanmalı.
- Deploy seçeneği gerekirse: VPS + Docker Compose (Hetzner + Coolify).
