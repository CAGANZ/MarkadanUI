# Markadan Frontend — Sistem Analizi, Gereksinimler ve Mimari Rapor

**Hazırlayan:** Frontend Mimarisi | **Tarih:** 2026-06-11 | **Sürüm:** 1.0
**Hedef API:** Markadan API v1 (ASP.NET Core, JWT Bearer)

---

## 1. Proje Vizyonu

Markadan, tekstil butiklerine **beyaz etiket (white-label)** olarak verilen bir
e-ticaret platformudur. Her butik kendi domain'inde, kendi logosu, renkleri ve
adıyla bağımsız bir deploy alır. Butiğin müşterileri ağırlıklı olarak **mobil
cihazlardan** alışveriş yapar.

Başarı kriteri: müşterinin "en sevdiğim butiğin sitesi" diyeceği, kullanmaktan
zevk aldığı, hızlı ve güvenilir bir alışveriş deneyimi.

---

## 2. Mevcut Durum Analizi

### 2.1 Korunacaklar
| Varlık | Durum | Karar |
|---|---|---|
| BFF proxy deseni (`src/app/api/*`) | Doğru mimari, backend URL'i gizliyor | **Korunur ve genişletilir** |
| Admin CRUD ekranları (~2.000 satır) | Çalışıyordu, validasyonlar tamam | **Yeni API client'a bağlanır** |
| `useDebounce`, `Pagination`, modal bileşenleri | Yeniden kullanılabilir | **Korunur** |
| Next.js 15 + App Router + Tailwind v4 | Güncel stack | **Korunur** |

### 2.2 Eksikler (sıfırdan yapılacak)
- **Token yönetimi**: refresh akışı, httpOnly cookie, oturum süresi takibi → hiç yok
- **Sepet / Checkout / Sipariş / Adres**: ne sayfa ne proxy var
- **Kayıt (register)** sayfası yok
- **White-label tema sistemi**: renkler hardcoded (`bg-[#FFF7E6]`, `amber-*`)
- **Arama deneyimi**: basit form submit; öneri, geçmiş, boş durum yok
- **Hata yönetimi**: ProblemDetails formatı hiçbir yerde parse edilmiyor

---

## 3. Gereksinimler

### 3.1 Fonksiyonel Gereksinimler

#### Ziyaretçi (auth yok)
- **FR-01** Ana sayfa: vitrin (öne çıkan ürünler), kategoriler, markalar
- **FR-02** Ürün listesi: filtre (kategori, marka, fiyat aralığı), sıralama (5 tip), sayfalama (12/sayfa)
- **FR-03** Arama: başlık/marka/kategori içinde (`?q=`), debounce'lu, boş durum tasarımlı
- **FR-04** Ürün detay: görsel, fiyat, açıklama, marka/kategori linkleri, "Sepete Ekle" (girişe yönlendirir)
- **FR-05** Kayıt ve giriş (validasyonlu, Türkçe hata mesajları)

#### Üye (JWT)
- **FR-06** Sepet: ekle/çıkar/miktar değiştir (0 = sil), toplam, **fiyat değişikliği uyarısı** (`priceChanged`)
- **FR-07** Adres defteri: CRUD, checkout'ta seçim
- **FR-08** Checkout: adres seç → onayla → sipariş numarası göster (`MRK-XXXXXXXX`)
  - 409 fiyat değişti → sepeti tazele, farkları göster, tekrar onay iste
  - 409 stok yok → ilgili ürünü vurgula, çıkar/azalt seçeneği sun
- **FR-09** Sipariş geçmişi: liste + detay (adres snapshot ile) + iptal (yalnızca `Ordered`)
- **FR-10** Oturum: token süresi dolmadan otomatik refresh; refresh başarısızsa login'e yönlendir

#### Admin
- **FR-11** Ürün/marka/kategori CRUD (mevcut ekranlar yeni client'a bağlanır; stok alanı görünür)
- **FR-12** Sipariş yönetimi: filtreli liste (status, tarih aralığı), detay, durum güncelleme
- **FR-13** Admin koruması: `isAdmin` olmayan kullanıcı `/admin`'e giremez (middleware)

### 3.2 Fonksiyonel Olmayan Gereksinimler
- **NFR-01 Mobile-first**: tüm ekranlar önce 390px için tasarlanır; dokunma hedefleri ≥44px
- **NFR-02 White-label**: logo, renkler, butik adı tek dosyadan (`theme.config`) değişir; kod dokunulmaz
- **NFR-03 Performans**: LCP < 2.5s, görseller `next/image` + blur placeholder, katalog sayfaları RSC
- **NFR-04 Güvenlik**: accessToken yalnızca memory; refreshToken httpOnly+Secure+SameSite=Lax cookie; backend URL client'a sızmaz
- **NFR-05 Rate limit dostu**: public katalog istekleri sunucuda kısa süreli cache'lenir (60 req/dk limiti)
- **NFR-06 Erişilebilirlik**: semantik HTML, klavye navigasyonu, ARIA, kontrast ≥ 4.5:1
- **NFR-07 Türkçe**: tüm UI metinleri Türkçe, tek sözlük dosyasında toplanır

---

## 4. Mimari Kararlar

### 4.1 Katmanlar

```
Tarayıcı (Client Components)
   │  fetch("/api/...")           ← yalnızca relative URL
   ▼
Next.js BFF (Route Handlers)      ← src/app/api/*
   │  Authorization: Bearer ...   ← token'ı httpOnly cookie'den okur
   ▼
Markadan API (ASP.NET Core)       ← API_BASE_URL (yalnızca sunucuda)
```

**Karar A1 — BFF (Backend-for-Frontend) deseni:** Tarayıcı backend'i hiç görmez.
Tüm istekler Next.js route handler'lardan geçer. Gerekçe: (1) refreshToken
httpOnly cookie'de güvenle taşınır, (2) CORS sorunu olmaz, (3) backend URL'i
deploy başına env ile değişir.

**Karar A2 — Token stratejisi (API dokümanıyla birebir uyum):**
- `accessToken` → **httpOnly cookie** (`mk_at`), maxAge = `expiresAtUtc`'den hesaplanır
- `refreshToken` → **httpOnly cookie** (`mk_rt`), uzun ömürlü
- Client tarafında token YOK — sadece `/api/auth/me`'den gelen kullanıcı bilgisi (context'te)
- BFF her istekte `mk_at`'ı Bearer header'a çevirir; 401 gelirse **bir kez**
  `/auth/refresh` dener, başarılıysa isteği tekrarlar ve yeni cookie'leri yazar;
  başarısızsa cookie'leri temizler ve 401 döner → client login'e yönlendirir
- API kuralı: her refresh yeni çift üretir, eskisi geçersizleşir → refresh işlemi
  **tek uçta** (`/api/auth/refresh`) kilitlenir, yarış koşulu engellenir

> Not: API dokümanı "accessToken memory'de" der; BFF deseninde tarayıcıya hiç
> token inmediği için httpOnly cookie bunun daha güvenli üst kümesidir
> (XSS ile dahi okunamaz).

**Karar A3 — White-label tema sistemi:**
- `src/config/boutique.js` → butik adı, logo yolu, iletişim, sosyal medya
- `src/app/theme.css` → CSS değişkenleri: `--color-primary`, `--color-surface`,
  `--color-accent`, `--radius-base`, `--font-display` ...
- Tailwind v4 `@theme` direktifi bu değişkenleri utility'lere bağlar
  (`bg-primary`, `text-accent` gibi)
- **Kural:** Hiçbir bileşende sabit renk kodu (`amber-50`, `#FFF7E6`) kullanılamaz
- Yeni butik = `boutique.js` + `theme.css` + `public/media/logo.svg` değişir, başka hiçbir şey değişmez

**Karar A4 — Render stratejisi:**
| Sayfa | Strateji | Gerekçe |
|---|---|---|
| Ana sayfa, ürün/marka/kategori listeleri | RSC + `revalidate: 60` | Rate limit'i korur, hızlı LCP |
| Ürün detay | RSC + `revalidate: 60` | SEO + hız |
| Sepet, checkout, siparişler, hesap | Client (SWR benzeri hook) | Kişisel, gerçek zamanlı |
| Admin | Client | Form ağırlıklı, mevcut yapı |

**Karar A5 — Hata sözleşmesi:** Tüm ProblemDetails yanıtları tek yerden
(`lib/api-error.js`) parse edilir. `detail` alanı Türkçe ve kullanıcıya gösterilebilir
(backend böyle tasarlamış). 409'lar checkout'ta **senaryo bazlı** ele alınır.

### 4.2 Dizin Yapısı (hedef)

```
src/
├── config/
│   └── boutique.js          # butik kimliği (white-label)
├── app/
│   ├── theme.css            # CSS değişkenleri (white-label)
│   ├── (shop)/              # müşteri grubu: ana sayfa, ürünler, sepet...
│   ├── (auth)/              # login, register
│   ├── admin/               # admin paneli
│   └── api/                 # BFF route handlers
│       ├── auth/            # login, register, refresh, logout, me
│       ├── me/              # cart, addresses, orders, checkout
│       ├── products|brands|categories/   # public proxy (+cache)
│       └── admin/           # admin proxy
├── components/
│   ├── ui/                  # Button, Input, Badge, Modal, Skeleton, Toast
│   ├── catalog/             # ProductCard, FilterBar, SortSelect...
│   ├── cart/                # CartLine, PriceChangeBanner...
│   └── layout/              # Header, Footer, MobileNav
├── hooks/                   # useCart, useAuth, useDebounce...
└── lib/
    ├── server/api.js        # BFF→backend fetch + token + refresh kilidi
    ├── client/api.js        # tarayıcı→BFF fetch + hata parse
    ├── api-error.js         # ProblemDetails sözleşmesi
    └── format.js            # ₺ fiyat, tarih formatları
```

### 4.3 UI/UX Tasarım Esasları

1. **Butik hissi, pazar yeri değil.** Geniş beyaz alan, büyük ürün görselleri,
   zarif tipografi. Trendyol kalabalığı değil, butik vitrini sakinliği.
2. **Mobilde başparmak bölgesi.** Sepete ekle, checkout onayı gibi birincil
   aksiyonlar ekranın alt yarısında sabit (sticky bottom bar).
3. **Durum tasarımı zorunlu.** Her liste için: yükleniyor (skeleton), boş
   (illüstrasyon + yönlendirme), hata (tekrar dene). Boş sepet bir satış fırsatıdır.
4. **Fiyat değişikliği şeffaflığı.** `priceChanged` satırları eski→yeni fiyatla,
   ürün bazında gösterilir; toplu "Yeni fiyatları onayla" CTA'sı ile çözülür.
5. **Mikro geri bildirim.** Sepete ekleme → header rozeti animasyonu + toast.
   Sipariş onayı → sipariş numarası büyük, kopyalanabilir.
6. **Güven sinyalleri.** Sipariş numarası formatı (MRK-…), adres snapshot bilgisi
   ("Bu siparişin teslimat adresi kaydedildi"), iptal koşulları açıkça yazılır.

---

## 5. API Uyum Matrisi

| Backend ucu | BFF route | Tüketen ekran |
|---|---|---|
| `POST /auth/register` | `/api/auth/register` | Kayıt |
| `POST /auth/login` | `/api/auth/login` | Giriş |
| `POST /auth/refresh` | `/api/auth/refresh` (iç) | Otomatik |
| `GET /auth/me` | `/api/auth/me` | AuthContext |
| `GET /products` (+filtreler) | `/api/products` | Liste, arama, vitrin |
| `GET /products/{id}` | `/api/products/[id]` | Detay |
| `GET /brands`, `/brands/{id}` | `/api/brands…` | Marka sayfaları |
| `GET /categories`, `/categories/{id}` | `/api/categories…` | Kategori sayfaları |
| `GET/POST/PUT/DELETE /me/addresses…` | `/api/me/addresses…` | Adres defteri, checkout |
| `GET /me/cart` | `/api/me/cart` | Sepet, header rozeti |
| `POST /me/cart/items` | `/api/me/cart/items` | Sepete ekle |
| `PUT/DELETE /me/cart/items/{id}` | `/api/me/cart/items/[id]` | Miktar/sil |
| `DELETE /me/cart` | `/api/me/cart` | Sepeti boşalt |
| `POST /me/checkout` | `/api/me/checkout` | Checkout |
| `GET /me/orders`, `/me/orders/{id}` | `/api/me/orders…` | Sipariş geçmişi |
| `POST /me/orders/{id}/cancel` | `/api/me/orders/[id]/cancel` | İptal |
| `/admin/products|brands|categories` CRUD | `/api/admin/…` | Admin CRUD |
| `GET /admin/orders`, `PUT …/status` | `/api/admin/orders…` | Admin sipariş |

**Kritik iş kuralları (frontend sorumlulukları):**
- Ödeme tutarı daima `unitPriceSnapshot` üzerinden gösterilir
- `hasPriceChanges: true` iken checkout butonu "Yeni fiyatları onayla ve devam et"e dönüşür
- Public uçlarda stok yok → "stokta yok" durumu yalnızca checkout 409'undan öğrenilir
- Revoked token tespitinde (refresh 401) tüm oturum temizlenir → login
- Sipariş iptali yalnızca `Ordered` durumunda; buton diğer durumlarda gizlenir

---

## 6. Geliştirme Fazları

| Faz | Kapsam | Çıktı |
|---|---|---|
| **1. Temel altyapı** | API client (server+client), auth cookie+refresh akışı, white-label tema, UI kit (Button/Input/Toast/Skeleton/Modal), layout | Çalışan giriş + temalı iskelet |
| **2. Katalog** | Ana sayfa, ürün listesi+filtre+arama, ürün detay, marka/kategori sayfaları | Ziyaretçi deneyimi tamam |
| **3. Auth ekranları** | Kayıt, giriş, hesabım, adres defteri CRUD | Üyelik tamam |
| **4. Sepet+Checkout** | Sepet (priceChanged), checkout (409 senaryoları), sipariş onayı | Satış akışı tamam |
| **5. Siparişler** | Geçmiş, detay, iptal | Üye deneyimi tamam |
| **6. Admin** | Mevcut CRUD'un yeni client'a bağlanması, sipariş yönetimi, middleware koruması | Butik sahibi deneyimi tamam |

Her faz sonunda: build geçer, manuel QA yapılır, commit atılır.

---

## 7. Riskler ve Önlemler

| Risk | Önlem |
|---|---|
| Rate limit (60/dk) vitrin sayfalarında aşılır | RSC cache (`revalidate: 60`) + tek BFF üzerinden istek |
| Refresh yarış koşulu (eski token geçersizleşir) | BFF'de tek uçlu, kilitli refresh |
| Tema değişkeni unutulup sabit renk yazılması | ESLint kuralı / kod inceleme kontrol listesi |
| Checkout 409 döngüsü (fiyat sürekli değişiyor) | Her 409'da sepet otomatik tazelenir, kullanıcı net bilgilendirilir |
| Görsel URL'leri kırık (imageUrl boş/ölü) | `next/image` + onError fallback → varsayılan medya |
