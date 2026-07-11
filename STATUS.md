# STATUS — Markadan Frontend Şu An Neredeyiz

**Son güncelleme:** 2026-07-11  
**Güncelleyen:** Claude

---

## Şu an ne durumda

T4/T2/F2 frontend bağlantıları tamamlandı. Kalan: **T5** (jenerik varyant/opsiyon, backend mimari kararı bekliyor) ve iyzico gerçek entegrasyonu.

---

## Son oturumda ne yapıldı

**2026-07-11**
- **T4 frontend ✅:** `src/app/api/admin/products/[id]/active/route.js` eklendi (PATCH passthrough) — aktif/pasif toggle artık gerçek uca bağlı.
- **T2 frontend ✅:** `src/app/api/admin/products/export/route.js` eklendi (orders/export ile aynı desen — arrayBuffer + Content-Disposition passthrough). Admin ürün listesindeki "CSV İndir" butonu client-side toplama mantığından çıkarılıp `<a download href="/api/admin/products/export?q=&sort=">`'a çevrildi (T1'in geçici çözümü kaldırıldı).
- **F2 frontend ✅:** `src/app/api/me/cart/accept-prices/route.js` eklendi (POST passthrough). `useCart.acceptPriceChanges` artık sil+yeniden-ekle workaround'u yerine tek `POST /me/cart/accept-prices` çağrısı yapıp dönen `CartDTO`'yu doğrudan state'e yazıyor.
- Build: temiz ✅

**2026-06-25**
- Backend teslimi doğrulandı: T4 `isActive` + `PATCH /admin/products/{id}/active`, T2 `GET /admin/products/export`, T3 bulk upsert semantiği, T6 sunucu güvenliği (satır limiti/MIME/SSRF/rate limit), F2 `POST /me/cart/accept-prices`.
- Frontend iş kuyruğu güncellendi (bkz. Sıradaki).

**2026-06-24**
- Çağan siteyi uçtan uca test etti (admin dahil). Ürün yönetiminde 5 iyileştirme tespit edildi → **GÖREV T** (docs/DURUM-RAPORU.md).
- **T1 ✅ (frontend):** Admin ürün listesine "CSV İndir" eklendi — yükleme ile aynı başlık, round-trip uyumlu (description detaydan tamamlanıyor, UTF-8 BOM + CRLF).
- **T4 UI hazır:** Listede aktif/pasif toggle eklendi, `isActive` alanı backend'den gelince otomatik görünür.
- **T6 güvenlik (frontend ✅):** Bulk BFF route'a auth/boyut(413)/uzantı-tip(415)/boş kontrolü; middleware `/api/admin/*` 401; form ön-kontrolü; export'ta CSV formül enjeksiyonu sanitizasyonu (`=`/`+`/`@`).
- **Backend'e iletildi (GÖREV T):** T2 products export endpoint, T3 bulk **upsert** semantiği (eski ürünler silinmemeli), T4 `isActive` + PATCH toggle, T5 jenerik varyant/opsiyon sistemi, **T6 backend güvenlik zorunlulukları (rol 403, sunucu boyut/satır limiti, MIME, ImageUrl SSRF, rate limit)**.
- Build: temiz ✅

**2026-06-23**
- iyzico credentials sorunu → backend mock ödeme koydu, sipariş akışı uçtan uca çalışıyor ✅
- Gerçek iyzico entegrasyonu ertelendi (credentials hazır olunca dönülecek)
- "Unable to add filesystem" → ürün veritabanındaki silinmiş Unsplash görseli (`photo-1594938298603-c8148c4b4d2a`) — admin panelden URL güncellenmeli

**2026-06-22 (oturum 1)**
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
- **Backend blocker:** `POST /me/checkout/initiate` → iyzico `"Geçersiz imza"` hatası (409). Sandbox API Key/Secret Key doğrulanmalı. → **Backend ekibine iletildi 2026-06-22, çözüm bekliyor.**

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

GÖREV T'nin frontend kısmı (T1/T2/T4/T6) tamamlandı. T5 hâlâ backend mimari kararı bekliyor.

---

## Sıradaki (öncelik sırasıyla)

### Backend bekliyor
1. **GÖREV T5** — jenerik varyant/opsiyon sistemi → önce backend mimari kararı
2. iyzico gerçek entegrasyon — credentials hazır olunca dönülecek

### İçerik / kod değil
3. Admin panelden kırık Unsplash görselini güncelle

---

## Tamamlananlar

| Tarih | Görev | Notlar |
|-------|-------|--------|
| 2026-07-11 | GÖREV T2/T4/F2 frontend bağlama | Ürün export sunucu tarafına taşındı, aktif/pasif toggle + sepet fiyat onayı gerçek uçlara bağlandı |
| 2026-06-24 | GÖREV T1 — Ürün CSV İndir | Round-trip uyumlu, client-side, BOM+CRLF (T2 ile sunucu tarafına taşındı) |
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
