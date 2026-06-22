# Markadan Frontend — Claude Giriş Noktası

## Önce bunları oku (sırasıyla)

1. **`WHO.md`** — Çağan kimdir, nasıl çalışmak istiyor
2. **`WHAT.md`** — Proje ne, mimari neden böyle, kararlar neden alındı
3. **`STATUS.md`** — Şu an neredeyiz, ne bitti, sırada ne var
4. **`DESIGN.md`** — Tasarım sistemi (tipografi, renk, spacing, motion, kurallar)

## Design System

`DESIGN.md` dosyası bu projenin tasarım kaynağıdır. Her UI/görsel karar öncesi okunmalı.

- Font: **Cormorant Garamond** (display, `text-2xl`+) + **Instrument Sans** (body, UI)
- Renk: sadece `theme.css` token'ları (`bg-primary`, `text-ink`, `border-line` vb.) — hex/amber/neutral YASAK
- Spacing: storefront `spacing-12/16` (geniş), admin `spacing-4/6` (kompakt)
- Motion: intentional — sadece anlam taşıyan, 80-350ms arası
- QA modunda: `DESIGN.md`'ye uymayan kodu işaretle

---

## Hızlı başlangıç

```bash
# Oturum başında — önce güncelle
git pull

# Backend (MarkadanAPI dizininde)
docker compose up -d

# Frontend
echo "API_BASE_URL=http://localhost:8080" > .env.local   # yoksa build asılır
npm run dev
```

**Kritik — bunları unutma:**
- `api()` wrapper'ı client bileşenlerde kullan, çıplak `fetch()` yasak (FormData istisnası var)
- Bileşenlerde renk utility'leri: `bg-primary`, `text-ink`, `border-line` vb. — hex/amber/neutral YASAK
- Commit öncesi `npm run build` zorunlu
- `params` ve `searchParams` Next 15'te her zaman `await` (server) veya `use()` (client)

---

## Oturum sonu kontrol

- [ ] STATUS.md güncellendi
- [ ] Commit atıldı

---

## Skill routing

When the user's request matches an available skill, invoke it via the Skill tool. When in doubt, invoke the skill.

- Product ideas/brainstorming → invoke /office-hours
- Strategy/scope → invoke /plan-ceo-review
- Architecture → invoke /plan-eng-review
- Design system/plan review → invoke /design-consultation or /plan-design-review
- Full review pipeline → invoke /autoplan
- Bugs/errors → invoke /investigate
- QA/testing site behavior → invoke /qa or /qa-only
- Code review/diff check → invoke /review
- Visual polish → invoke /design-review
- Ship/deploy/PR → invoke /ship or /land-and-deploy
- Save progress → invoke /context-save
- Resume context → invoke /context-restore
- Author a backlog-ready spec/issue → invoke /spec
