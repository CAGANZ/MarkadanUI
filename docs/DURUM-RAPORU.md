# Markadan Frontend — Durum Raporu ve Görev Listesi

**Tarih:** 2026-06-12 | **Son commit:** `3f6cd06` | **Build:** ✅ temiz | **E2E test:** ✅ tüm akışlar geçti
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
# Backend token al
TOKEN=$(curl -s -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@markadan.com","password":"Markadan.2026!"}' | jq -r '.accessToken')

# Örnek: marka ekle
curl -s -X POST http://localhost:8080/admin/brands \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Nike","description":"Just Do It","imageUrl":"https://..."}'
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

## 2. Tamamlananlar

| Faz | İçerik | Önemli dosyalar |
|---|---|---|
| 1 | BFF auth (httpOnly cookie + refresh kilidi), white-label tema, UI kit | `lib/server/api.js`, `app/theme.css`, `config/boutique.js`, `components/ui/*` |
| 2 | Header/SearchBox/MobileNav, ürün liste+detay, ana sayfa, filtreler | `components/layout/*`, `components/catalog/*`, `lib/server/catalog.js` |
| 3 | Login, register, hesabım, adres defteri | `app/login`, `app/register`, `app/account/*`, `components/account/AddressForm.jsx` |
| 4 | Sepet (fiyat değişikliği kilidi), checkout (409 senaryoları) | `app/cart`, `app/checkout`, `hooks/useCart.jsx`, `components/cart/*` |
| 5 | Sipariş geçmişi/detay/iptal | `app/account/orders/*`, `lib/order-status.js` |
| 6 | AdminGuard, admin nav, admin sipariş yönetimi, tüm proxy'lerde auth | `app/admin/layout.js`, `app/admin/orders/*`, `components/admin/AdminGuard.jsx` |
| 7 | Kart redesign, ana sayfa revizyon, brands/categories sayfaları, checkout bug fix | Aşağıda detay |

**E2E doğrulanan akışlar:** admin CRUD → public katalog → müşteri kayıt → sepet →
fiyat değişikliği onay döngüsü → checkout → sipariş → iptal (stok iadesiyle). Hepsi canlı backend'le test edildi.

### Faz 7 detayı (2026-06-12)

**ProductCard yeniden tasarımı** (`src/components/catalog/ProductCard.jsx`):
- 3:4 portrait aspect ratio (tekstil için ideal)
- Hover: `-translate-y-1` + `shadow-xl` + görsel scale 105% (500ms)
- Marka adı: uppercase, tracking-widest, `text-accent`
- `id <= 8` ise "Yeni" rozeti (gerçek `isNew` flag gelene kadar placeholder)
- Hover chip: "Detayları gör →" — `translate-y-2` → 0, `opacity-0` → 100
- Stok bitti: fiyat üstü çizili + "Stok yok" etiketi

**Ana sayfa redesign** (`src/app/page.jsx`):
- Yeni `CategoryCard` bileşeni: portrait 3:4, gradient overlay, accent ring hover, description reveal
- Yeni `BrandCard` bileşeni: avatar daire, hover translate + accent border
- Yeni Hero: radial-gradient dot texture, "Yeni Sezon" chip, ikili CTA (rounded-full butonlar)
- Bölüm sırası: Hero → Kategoriler → Yeni Gelenler → Markalar → CTA bandı

**Markalar ve Kategoriler sayfaları yeniden yazıldı** (RSC, tema uyumlu):
- `src/app/brands/page.jsx`: `getBrands()` ile veri, aspect-video görsel, hover efektleri
- `src/app/categories/page.jsx`: `getCategories()` ile veri, editorial grid, ilk kart `col-span-2 row-span-2` vitrin etkisi
- `src/app/brands/[id]/page.jsx`: `redirect(\`/products?brandId=${id}\`)` — artık ayrı detay sayfası yok
- `src/app/categories/[id]/page.jsx`: `redirect(\`/products?categoryId=${id}\`)`

**Ölü kod silindi:**
- `src/components/cards/BrandCard.jsx`
- `src/components/cards/CategoryCard.jsx`
- `src/components/HorizontalScroller.jsx`

**Checkout bug fix** (`src/app/checkout/page.jsx`):
- **Sorun:** Sipariş sonrası `reload()` sepeti boşaltıyordu; cart guard `useEffect` bunu algılayıp `/cart`'a yönlendiriyordu — `router.push("/account/orders/...")` yarışı kaybediyordu.
- **Çözüm:** `ordered` flag state'i eklendi. `setOrdered(true)` sonrası guard devre dışı; `router.push` önce çalışır.
- `reload()` intentionally not awaited (sipariş sonrası arka planda temizlik).

**Seed data (canlı DB'de mevcut):** 5 marka, 5 kategori, 20 ürün — bkz. §5.

**Bilinen backend davranışı:** 409 sonrası `GET /me/cart` snapshot'ı TAZELEMİYOR
(handoff dokümanının aksine). UI çözümü: `useCart.acceptPriceChanges` — fiyatı değişen
satırı silip aynı miktarla yeniden ekler. Backend'e `accept-prices` ucu önerildi; eklenirse
bu fonksiyon sadeleştirilir.

---

## 3. GÖREVLER (sırayla yapılacak)

### GÖREV A — Görsel altyapısı (next.config.mjs)
**Süre tahmini:** 30 dk | **Zorluk:** Çok düşük

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
2. `src/lib/media.js` içindeki `BLUR` base64'leri hâlâ placeholder — ya doldur ya tamamen kaldır.
   `grep -rn "blurData\|BLUR" src/` ile kaç kullanım var kontrol et; sıfırsa dosyayı sil.
3. `npm run build` → commit.

---

### GÖREV B — Admin CRUD sayfalarının tema uyumu (EN BÜYÜK İŞ)
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
   genel `ui/Modal` + `ui/Button variant="danger"` ile değiştir. Sonra üç modal dosyasını sil.
4. `components/Pagination.jsx` kullanımlarını `components/catalog/Pager.jsx` ile değiştir.
   Admin listeleri client-side olduğundan `onClick` gerekirse Pager'a opsiyonel `onPage` prop'u ekle.
   Sonra `Pagination.jsx`'i sil.
5. Formlarda `ui/Input`'un `label` + `error` prop'larını kullan; mevcut validasyon kurallarını KORU.
6. Her sayfa sonrası `npm run build` → tek tek commit.

**Kabul kriteri:** `grep -rn "amber\|#FF\|neutral-" src/app/admin` boş döner;
tüm CRUD işlemleri çalışır; silme onayları `ui/Modal` ile.

**⚠️ Dikkat:** Mevcut validasyonlar ve iş kuralları bilinçli yazılmış — **sadece görünümü değiştir.**

---

### GÖREV C — WhatsApp sipariş butonu
**Süre tahmini:** 1-2 saat | **Zorluk:** Düşük | **Backend efor: Sıfır**

Ürün detay sayfasına "WhatsApp'tan Sipariş Ver" butonu ekle.

**Nasıl çalışır:**
- `config/boutique.js`'e `whatsappPhone: "905xxxxxxxxx"` alanı ekle (ülke koduyla, başında + yok)
- Ürün detay sayfasında bu alan doluysa buton görünür, boşsa görünmez
- Tıklanınca yeni sekmede şu URL açılır:
  ```
  https://wa.me/{phone}?text=Merhaba%2C%20{ürün adı}%20ürününü%20sipariş%20etmek%20istiyorum.%0A{ürün URL}
  ```
- Buton stili: yeşil özel renk veya `variant="accent"` — WhatsApp tanınan yeşil (#25D366)

**Neden önemli:** Kapıda ödeme tercih eden müşteriler için birincil sipariş kanalı.
Türkiye esnaf segmentinde checkout dönüşümünden yüksek tamamlanma oranı beklenir.

---

### GÖREV D — Mağaza Ayarları — Admin
**Süre tahmini:** 2-3 saat | **Zorluk:** Düşük | **Backend:** ✅ hazır

Backend uçları:
- `GET /store-settings` — herkese açık
- `GET /admin/settings` — admin token
- `PUT /admin/settings` — admin token

**DTO (PUT body & GET yanıtı):**
```json
{
  "storeName": "Mağazam",
  "logoUrl": "https://...",
  "description": "Kısa açıklama",
  "whatsAppPhone": "905xxxxxxxxx",
  "contactPhone": "05xx",
  "contactEmail": "info@magaza.com",
  "instagramUrl": "https://instagram.com/...",
  "facebookUrl": "https://facebook.com/...",
  "primaryColor": "#FF6B35",
  "accentColor": "#2EC4B6",
  "metaDescription": "SEO açıklaması"
}
```

Renk alanları validation: `^#[0-9A-Fa-f]{6}$`.

**Yapılacaklar:**
1. `src/app/admin/settings/page.jsx` (yeni) — `ui/Input` ile tüm alanlar; renk alanları için
   `<input type="color">` + text input birlikte kullanılabilir.
2. Admin nav'ına "Mağaza Ayarları" linki ekle (`src/app/admin/layout.js`).
3. **Opsiyonel:** `GET /store-settings` çıktısını Header/Footer'da kullan (mağaza adı, logo, iletişim).

**Kabul kriteri:** Admin'den mağaza adı değiştirilince kaydedilir, tekrar açınca aynı değer gelir.

---

### GÖREV E — Toplu ürün yükleme (CSV) — Admin
**Süre tahmini:** 2-3 saat | **Zorluk:** Düşük-Orta | **Backend:** ✅ hazır

Backend ucu: `POST /admin/products/bulk` — `multipart/form-data`, alan adı `file`, `.csv` zorunlu.
Maksimum: 10 MB. Dönen yapı:
```json
{ "succeeded": 12, "failed": 3, "errors": [{ "row": 4, "reason": "Bilinmeyen marka: XYZ" }] }
```

**CSV formatı (başlık satırı zorunlu):**
```
Title,Description,Price,Stock,BrandName,CategoryName,ImageUrl
Ürün A,Açıklama,149.90,50,Nike,Ayakkabı,https://...
```

**⚠️ Dikkat:** Stok alanı `Stock` (büyük S), `stockQuantity` değil — backend sözleşmesi böyle.

**Yapılacaklar:**
1. `src/app/admin/products/page.jsx`'e "CSV Yükle" butonu ekle.
2. Modal içinde `<input type="file" accept=".csv">` — `api()` FormData ile çalışıyorsa kullan,
   çalışmıyorsa (Content-Type otomatik set etmiyorsa) doğrudan `fetch` ile çağır.
3. Yanıt sonrası: başarı toast + modal içinde satır bazlı hata listesi.
4. Yükleme bittikten sonra ürün listesini yenile.

---

### GÖREV F — Favori listesi (Wishlist) — Müşteri
**Süre tahmini:** 3-4 saat | **Zorluk:** Orta | **Backend:** ✅ hazır

Backend uçları:
- `GET /me/wishlist` → `[{ id, productId, productTitle, productPrice, productImageUrl, addedAt }]`
- `POST /me/wishlist/items` → `{ productId: 123 }` — 409: "zaten favorilerde"
- `DELETE /me/wishlist/items/{id}` — id: wishlistItem id'si (productId değil)

**Yapılacaklar:**
1. Ürün detay sayfasına kalp ikonu butonu ekle. Giriş yoksa `/login?next=...`'e yönlendir.
   Toggle: `GET /me/wishlist` ile durum tespit → ekle/çıkar. Optimistic UI tercih edilir.
2. `src/app/account/wishlist/page.jsx` (yeni): favori ürün kartları, boş durum, "Favoriden Çıkar" butonu.
3. Hesabım nav'ına "Favorilerim" linki ekle.

---

### GÖREV G — Görsel QA
**Süre tahmini:** Yarım gün | **Zorluk:** Düşük (dikkat işi)

Chrome DevTools'ta **390px (iPhone 12 Pro)** ve masaüstünde şu turu yap:

- [ ] Ana sayfa: hero, kategoriler, yeni gelenler, markalar, CTA bandı
- [ ] Ürün listesi: filtre paneli (mobilde alttan açılır), sıralama, sayfalama, boş sonuç
- [ ] Ürün detay: mobilde alt sabit "Sepete Ekle" çubuğu MobileNav'ın ÜSTÜNDE durmalı (`bottom-14`)
- [ ] Kayıt formu: hatalı girişlerde alan altı mesajlar
- [ ] Sepet: fiyat değişikliği banner, miktar ±, boş sepet
- [ ] Checkout: adres seçimi, yeni adres modalı, sipariş onayı → `/account/orders/{id}?new=1`
- [ ] Siparişlerim: liste, detay, iptal onay modalı
- [ ] Admin: panel nav, sipariş filtreleri, durum güncelleme
- [ ] Header: sepet rozeti canlı güncelleniyor mu (ürün ekleyince anında artmalı)
- [ ] 401 senaryosu: çıkış yapıp `/account`'a git → login'e atmalı; login sonrası geri dönmeli

---

### GÖREV H — Deploy hazırlığı (MİMARLA BİRLİKTE — tek başına başlama)
Hosting seçimi, production env, butik şablonlaması (`boutique.js` + `theme.css` + logo)
mimari karar gerektirir. Görev A-E bittiğinde mimarla planlanacak.

---

## 4. Seed Data Referansı (geliştirme DB'sinde mevcut)

**Markalar (5):** Nike, Adidas, Zara, Mango, Vakko

**Kategoriler (5):** Kadın Giyim, Erkek Giyim, Aksesuar, Spor, İç Giyim

**Ürünler (20):** Her kategoride 4 ürün, stok 50-200 arası, fiyatlar 149-4499 TL.
Örnek ürünler: Nike Air Max 270 (1299 TL), Zara Kadın Trençkot (1599 TL), Vakko Yün Eşarp (899 TL).

> **Not:** `stock` alanı (backend API) = `stockQuantity` değil. Ürün oluştururken/güncellerken
> `{ stock: 50 }` gönderin, `{ stockQuantity: 50 }` değil.

---

## 5. Sorun Çıkarsa

| Belirti | Neden | Çözüm |
|---|---|---|
| Build asılıyor / 60sn timeout | `.env.local`'de `API_BASE_URL` yok | `echo "API_BASE_URL=http://localhost:8080" > .env.local` |
| API 401 dönüyor | Token süresi dolmuş | Çıkış yapıp tekrar gir; `curl http://localhost:8080/categories` ile backend kontrolü |
| `next/image` unconfigured host hatası | GÖREV A yapılmamış | `next.config.mjs`'e `remotePatterns` ekle |
| `params.id` undefined | Next 15 — `await params` unutulmuş | Server component: `const { id } = await params;` / Client: `const { id } = use(params);` |
| Stok 0 görünüyor | Ürün `stockQuantity` ile oluşturulmuş | Backend `PUT /admin/products/{id}` ile `{ stock: 50 }` gönder |
| Checkout sonrası boş sepet flash | `ordered` flag eksik veya erken | `setOrdered(true)` → `router.push()` sırasına dikkat; reload() await edilmemeli |
| Port 3000 EADDRINUSE | Eski dev server zombie | `fuser -k 3000/tcp` → `npm run dev` |
| `.next` cache bozuldu | Uzun oturum / çok restart | `rm -rf .next && npm run build && npm run dev` |
| Backend container DB hatası | Şema uyumsuzluğu | `docker compose restart api` (~/MarkadanAPI içinde) |
| Backend davranış soruları | — | `~/MarkadanAPI/docs/FRONTEND-HANDOFF.md` + Swagger `http://localhost:8080/swagger` |

> **⚠️ Handoff notu:** Handoff'taki "409 sonrası GET sepeti tazeler" ifadesine GÜVENME —
> backend bunu yapmıyor. UI `acceptPriceChanges` ile çözüyor (sil + yeniden ekle).
