# Markadan Frontend — Claude Giriş Noktası

## Önce bunları oku (sırasıyla)

1. **`WHO.md`** — Çağan kimdir, nasıl çalışmak istiyor
2. **`WHAT.md`** — Proje ne, mimari neden böyle, kararlar neden alındı
3. **`STATUS.md`** — Şu an neredeyiz, ne bitti, sırada ne var

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
