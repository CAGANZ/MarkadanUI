# STATUS — Markadan Frontend Şu An Neredeyiz

**Son güncelleme:** 2026-06-12  
**Güncelleyen:** Claude

---

## Şu an ne durumda

Frontend geliştirmesi tamamlandı — tüm fazlar (1-8) bitti, QA geçti, build temiz. Aktif geliştirme yok. Backend ekibinden yeni görevler bekleniyor.

---

## Son oturumda ne yapıldı

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

Backend ekibinden gelecek. Bilinen adaylar (ileride değerlendirilecek):

1. Dinamik mağaza verisi — `GET /store-settings` → Header/Footer'a bağla (şu an `boutique.js` statik)
2. WhatsApp ↔ Admin Settings senkronu — `boutique.js` yerine `GET /store-settings`
3. Middleware auth guard — `src/middleware.js` ile server-side token kontrolü

---

## Tamamlananlar

| Tarih | Görev | Notlar |
|-------|-------|--------|
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
