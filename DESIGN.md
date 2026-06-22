# Design System — Markadan

## Product Context

- **What this is:** White-label boutique e-commerce platform — küçük işletmeler kendi mağazalarını pazaryeri komisyonu ödemeden kurar ve yönetir
- **Who it's for:** Türkiye'deki küçük işletme sahipleri (moda, aksesuar, giyim) — teknik bilgisi sınırlı ama markasını ciddiye alan
- **Space/industry:** D2C E-ticaret, Türkiye pazarı — İkas, Shopify, IdeaSoft, Ticimax ile rekabet
- **Project type:** Web app (e-ticaret mağazası + yönetim paneli)
- **Memorable thing:** "Bunu kurmak bu kadar kolaysa, satışım artar" — kolaylık güven yaratır, güven satışa dönüşür

## Aesthetic Direction

- **Direction:** Editorial / Refined Boutique
- **Decoration level:** Intentional — tipografi ağır işi yapar; ince gölgeler, sıcak yüzeyler, gereksiz dekorasyon yok
- **Mood:** Sessiz, güvenli, kurumsal değil; bir Nişantaşı butiğine girme hissi. Yazılım gibi değil, marka sitesi gibi görünmeli. Son müşteri "küçük işletme platformu" değil "bu markanın kendi sitesi" olduğunu hissetmeli.
- **Competitive differentiation:** İkas ve IdeaSoft platform gibi görünür. Markadan butik gibi görünür. Fark: editorial serif display, cömert whitespace, sıcak nötrler — hiçbir Türk rakibi bunu yapmıyor.
- **Reference aesthetic:** Kinfolk magazine, Monocle web, Tekla fabrics — minimal ama soğuk değil, sıcak ve kurumsal

## Typography

### Font Choices

- **Display / Hero:** [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond) — weight 600-700
  - Neden: Editorial lüks hissi, moda/butik dünyasının standardı. Hiçbir Türk e-ticaret platformu editorial serif kullanmıyor — bu fark yaratır. Hero başlıklar, bölüm başlıkları, büyük fiyat gösterimi
  - Risk: Biraz daha uzun font yükleme süresi. Kazanç: rakipten ayrışan kimlik

- **Body / UI / Labels:** [Instrument Sans](https://fonts.google.com/specimen/Instrument+Sans) — weight 400-600
  - Neden: Modern, geometrik, mükemmel Türkçe karakter desteği (ğ, ş, ı, ö, ü, ç). 14-16px'de son derece okunabilir. Inter/Roboto'nun aşılmış alternatifleri değil, gerçek bir seçim
  - Kullanım: Gövde metni, butonlar, etiketler, navigasyon, form alanları, her UI elementi

- **Data / Tables / Fiyatlar:** Instrument Sans, `font-variant-numeric: tabular-nums`
  - Admin tabloları ve fiyat gösterimi için sayısal hizalama kritik

- **Code / Mono:** (Henüz kullanılmıyor — ileride gerekirse JetBrains Mono)

### Font Loading (Google Fonts)

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@600;700&family=Instrument+Sans:wght@400;500;600&display=swap" rel="stylesheet">
```

Next.js için `next/font/google` ile yükle:
```js
import { Cormorant_Garamond, Instrument_Sans } from "next/font/google"
const display = Cormorant_Garamond({ subsets: ["latin"], weight: ["600","700"] })
const body = Instrument_Sans({ subsets: ["latin", "latin-ext"], weight: ["400","500","600"] })
```

### Type Scale

| Token | Size | Line Height | Kullanım |
|-------|------|-------------|---------|
| `text-xs` | 12px | 1.5 | Badge, meta bilgi, küçük etiket |
| `text-sm` | 13px | 1.5 | İkincil metin, alt açıklama |
| `text-base` | 15px | 1.625 | Gövde metni (varsayılan) |
| `text-md` | 16px | 1.5 | Büyük gövde, önemli paragraf |
| `text-lg` | 20px | 1.4 | Kart başlığı, küçük bölüm başlığı |
| `text-xl` | 24px | 1.3 | Bölüm başlığı |
| `text-2xl` | 32px | 1.2 | Sayfa başlığı |
| `text-3xl` | 40px | 1.15 | Hero alt başlığı |
| `text-4xl` | 56px | 1.05 | Hero başlığı (Cormorant) |
| `text-5xl` | 72px | 0.95 | Editorial display (Cormorant) |

Display font (Cormorant) — `text-2xl` ve üstü başlıklarda kullan.
Body font (Instrument Sans) — `text-xl` ve altı her şeyde kullan.

---

## Color

- **Approach:** Restrained — 1 primary + 1 accent, renkler nadir ve anlamlı

### Palette (mevcut theme.css ile birebir uyumlu)

| Token | Hex | Kullanım |
|-------|-----|---------|
| `--mk-primary` | `#1f2933` | Ana aksiyon (butonlar, link hover, vurgu) |
| `--mk-primary-soft` | `#e8ebee` | Primary'nin yumuşak zemini, secondary button bg |
| `--mk-accent` | `#c2703d` | Terracotta — badge, indirim etiketi, marka vurgusu |
| `--mk-accent-soft` | `#f9ede4` | Accent'in yumuşak zemini |
| `--mk-surface` | `#faf8f5` | Sayfa zemini — sıcak beyaz (soğuk #f5f5f5 değil) |
| `--mk-surface-card` | `#ffffff` | Kart ve modal zemini |
| `--mk-ink` | `#1c1917` | Ana metin — sıcak siyah (#000 değil) |
| `--mk-ink-soft` | `#6b6560` | İkincil metin, placeholder |
| `--mk-line` | `#e7e2dc` | Çizgi, kenarlık — sıcak gri |
| `--mk-danger` | `#b3261e` | Hata, silme, uyarı |
| `--mk-danger-soft` | `#fceeed` | Hata zemini |
| `--mk-success` | `#1e7d4f` | Başarı, onay, aktif durum |
| `--mk-success-soft` | `#e9f5ef` | Başarı zemini |
| `--mk-warning` | `#9a6700` | Uyarı (amber değil, okunabilir kahve-sarı) |
| `--mk-warning-soft` | `#fdf3d7` | Uyarı zemini |

### Dark Mode Stratejisi

Şu an dark mode yok. İleride eklenirse:
- Surface: `#161412` (sıcak koyu, soğuk #111 değil)
- Surface-card: `#1f1d1a`
- Ink: `#f0ece7`
- Ink-soft: `#9e9890`
- Line: `#2e2b28`
- Primary ve accent tonlarını %10-15 doygunluk azalt

---

## Spacing

- **Base unit:** 8px
- **Density:** Comfortable — Türk pazaryerleri dense görünür, Markadan nefes alır

| Token | Value | Kullanım |
|-------|-------|---------|
| `spacing-0.5` | 2px | Mikro boşluk |
| `spacing-1` | 4px | İnline elementler arası |
| `spacing-2` | 8px | Component iç padding (sm) |
| `spacing-3` | 12px | Badge, chip, küçük element padding |
| `spacing-4` | 16px | Card iç padding, form alanı padding |
| `spacing-6` | 24px | Bölüm iç boşluğu |
| `spacing-8` | 32px | Kart arası boşluk, grid gap |
| `spacing-10` | 40px | Büyük bölüm padding |
| `spacing-12` | 48px | Sayfa bölümleri arası |
| `spacing-16` | 64px | **Storefront bölüm ritmi** — bu cömertlik fark yaratır |
| `spacing-20` | 80px | Hero padding |
| `spacing-24` | 96px | Büyük hero, editorial bölümler |

**Kural:** Admin paneli `spacing-4/6` ile çalışır (bilgi yoğun). Storefront `spacing-12/16/20` ile nefes alır.

---

## Layout

- **Approach:** Hybrid — admin için grid-disiplinli, storefront için creative-editorial
- **Max content width:** 1280px (storefront), 1440px (admin)
- **Breakpoints:** sm(640) md(768) lg(1024) xl(1280) 2xl(1440)

### Grid

| Breakpoint | Kolonlar | Gutter | Margin |
|-----------|----------|--------|--------|
| Mobile (<640px) | 4 | 16px | 16px |
| Tablet (640-1024px) | 8 | 24px | 24px |
| Desktop (>1024px) | 12 | 32px | 40px |

### Border Radius

| Token | Value | Kullanım |
|-------|-------|---------|
| `rounded-sm` | 4px | Küçük badge, chip |
| `rounded-md` | 8px | Input, küçük buton |
| `rounded-base` | 12px | Kart, buton (mevcut --mk-radius — değiştirilmez) |
| `rounded-lg` | 16px | Modal, drawer |
| `rounded-xl` | 24px | Büyük kart, hero kart |
| `rounded-full` | 9999px | Pill, avatar, rozet |

### Storefront Hero (Risk #2 — Asimetrik Layout)

Ana sayfa hero: magazine spread yaklaşımı.
- Desktop: 2 kolon split — sol %55 metin/CTA, sağ %45 ürün görseli. Grid kırar, görsel taşar.
- Mobile: Görsel üstte full-width, metin altında
- Referans: Tekla.com, Cos.com hero düzeni

---

## Motion

- **Approach:** Intentional — sadece anlam taşıyan animasyon

### Easing

```css
--ease-out: cubic-bezier(0, 0, 0.2, 1);   /* Giriş — hızlı başlar, yumuşak biter */
--ease-in: cubic-bezier(0.4, 0, 1, 1);    /* Çıkış — yavaş başlar, hızlı biter */
--ease-move: cubic-bezier(0.4, 0, 0.2, 1); /* Geçiş — her ikisi */
```

### Duration

| Token | Value | Kullanım |
|-------|-------|---------|
| `duration-micro` | 80ms | Hover renk değişimi, opacity |
| `duration-short` | 150ms | Buton state, input focus |
| `duration-medium` | 250ms | Kart hover (-translate-y), skeleton fade |
| `duration-long` | 350ms | Modal/drawer giriş, sayfa geçişi |

### Kurallar

- Scroll-driven animasyon: sadece ilk görünürde `opacity: 0 → 1 + translateY(8px → 0)`, 250ms ease-out
- Sayfa geçişleri: Next.js varsayılan — ek animasyon ekleme
- Loading state: Skeleton bileşeni zaten var — shimmer animasyonu `duration-long` kullan
- Hiçbir zaman: sonsuz dönen elementler, dikkat dağıtıcı mikro-interaksiyonlar

---

## Shadows

```css
--shadow-sm:  0 1px 3px rgba(28, 25, 23, 0.07);    /* Subtle lift */
--shadow-md:  0 4px 16px rgba(28, 25, 23, 0.08);   /* Card resting */
--shadow-lg:  0 8px 24px rgba(28, 25, 23, 0.12);   /* Card hover */
--shadow-xl:  0 20px 60px rgba(28, 25, 23, 0.15);  /* Modal */
```

Gölgeler sıcak zemine uygun — `rgba(0,0,0,x)` yerine `rgba(28,25,23,x)` kullan.

---

## Component Guidelines

### Buttons (mevcut Button.jsx ile uyumlu)

- Primary: `bg-primary text-white` — tek ana aksiyon, sayfada max 1-2
- Secondary: `bg-primary-soft text-primary` — alternatif aksiyon
- Accent: `bg-accent text-white` — sepete ekle, favoriye ekle
- Ghost: hover'da `bg-primary-soft` — nav linkleri, ikincil işlemler
- Danger: `bg-danger text-white` — silme, iptal

Buton boyutları: sm(px-3 py-1.5) md(px-4 py-2.5) lg(px-6 py-3). Mobilde min 44px yükseklik (zaten `globals.css`'de).

### Cards (ProductCard pattern)

- Resting: `border border-line bg-surface-card` + `shadow-md`
- Hover: `-translate-y-1 shadow-lg` (250ms ease-out)
- Border radius: `rounded-base` (12px)
- Image aspect: `3/4` (tekstil için — mevcut, değiştirme)

### Forms

- Input border: `border-line` resting, `border-primary` focus
- Label: `text-sm font-medium text-ink`
- Error: `border-danger text-danger text-xs`
- Disabled: `opacity-40 cursor-not-allowed`

### Admin vs Storefront

- **Storefront:** Cormorant Garamond başlıklar + geniş spacing + editorial layout
- **Admin:** Sadece Instrument Sans + compact spacing + veri yoğun grid + tablolar

---

## Design Risks & Rationale

### Risk 1 — Editorial Serif Display

Cormorant Garamond'u hero ve section başlıklarında kullanmak. Hiçbir Türk e-ticaret platformu editorial serif kullanmıyor. Butik hissi yaratır, platform hissi değil. **Kural:** `text-2xl` ve üstü = Cormorant. Altı = Instrument Sans.

### Risk 2 — Asimetrik Storefront Hero

Centered hero yerine magazine-spread 2-kolon layout. Pazaryeri alışkanlıklarından kopar, "bu markanın kendi sitesi" hissi verir.

### Risk 3 — Cömert Whitespace

Storefront bölümleri arası `spacing-16` (64px) minimum. Trendyol dense görünür, Markadan nefes alır. İlk scroll'da daha az ürün görünür — bunu kabul ediyoruz, çünkü premium his daha çok satış demek (memorable-thing).

---

## Safe Choices

1. **Standart checkout/cart UX** — kullanıcılar bu akışı bekliyor, deneyim yapma
2. **Mobile-first grid** — Türkiye'de alışverişin %75'i mobil
3. **Instrument Sans Turkish support** — ğ, ş, ı, ö, ü, ç karakterleri tam destekli

---

## Anti-patterns (Bu Projede Yasaklı)

- Bileşenlerde hex kod veya `amber-*`, `neutral-*`, `gray-*` — sadece tema token'ları
- `Inter`, `Roboto`, `Poppins` — overused, butik hissini öldürür
- Purple/violet gradyan — çağrışım yanlış
- 3 kolonlu icon grid feature bölümü — SaaS slop
- Her yerde centered layout — editorial değil, PowerPoint
- Gradient button — primary aksiyona zarar verir
- `system-ui` veya `-apple-system` body font olarak

---

## Decisions Log

| Tarih | Karar | Gerekçe |
|-------|-------|---------|
| 2026-06-22 | Cormorant Garamond display font seçildi | Rakip ayrışması — hiçbir Türk platform editorial serif kullanmıyor |
| 2026-06-22 | Instrument Sans body font seçildi | Türkçe karakter desteği, Inter alternatifleri arasında en az aşılmış |
| 2026-06-22 | Mevcut renk paleti korundu | #1f2933 + #c2703d zaten güçlü ve tutarlı kurulmuş |
| 2026-06-22 | Storefront 64px vertical rhythm | Premium / butik his — pazaryeri yoğunluğundan bilinçli kaçış |
| 2026-06-22 | Admin compact, storefront editorial | İki farklı kullanıcı modu — işletmeci çalışma, müşteri keşfeder |
