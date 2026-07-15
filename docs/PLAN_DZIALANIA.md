# Plan działania — Work Grid System (Freshmarket Scheduler)

> **Ostatnia aktualizacja:** 2025-06-25  
> **Status ogólny:** 🟢 Gotowi do pracy — localhost + konto admina  
> **Produkcja (użytkownicy):** https://matikgal.github.io/work-grid-system  
> **Kod:** `C:\Users\MAT\Documents\repos\work-grid-system`  
> **Dokumentacja klienta:** `C:\Users\MAT\Desktop\apka paulinka`

---

## Werdykt strategiczny

| Opcja | Decyzja |
|-------|---------|
| Pisanie od nowa | ❌ NIE — mamy działającą aplikację v2.3.0 (~9k LOC) |
| Osobna apka w folderze Paulinka | ❌ NIE — tam jest tylko dokumentacja, nie kod |
| Upgrade + naprawa + rozbudowa | ✅ TAK — to jest nasza ścieżka |

---

## Zasada nr 1: Jak pracujemy bez psucia danych użytkowników

**Ta sama baza Supabase — izolacja przez konta (`user_id`).**

| Co | Jak |
|----|-----|
| **Baza danych** | Jedna — produkcyjna Supabase (wszyscy) |
| **Izolacja danych** | Każde konto widzi tylko swoje rekordy (pracownicy, grafiki, urlopy…) |
| **Kodowanie** | `npm run dev` na localhost — logujesz się na **konto admina** |
| **Użytkownicy** | GitHub Pages — stary kod do czasu `npm run deploy` |

### Jak to działa

1. Uruchamiasz `npm run dev` → podgląd live na localhost
2. Logujesz się na konto demo/admin — edytujesz tylko swoje dane testowe
3. Inni kierownicy pracują na GitHub Pages — **nie widzą** Twoich zmian w kodzie
4. Gdy kod gotowy: `npm run build` → `npm run deploy` → wszyscy dostają nową wersję

### Checklist: start pracy (PRIORYTET)

- [x] Ta sama baza — bez osobnego projektu Supabase
- [x] `npm run dev` działa od razu (bez `.env.local`)
- [x] Konto demo potwierdzone — izolacja danych działa
- [x] **Nie logować się** na konta użytkowników produkcyjnych podczas testów (zasada)

Szczegóły: [docs/SRODOWISKO_DEV.md](./SRODOWISKO_DEV.md)

---

## Faza 0 — Porządki i bezpieczeństwo (1–2 dni)

Cel: przygotować fundament bez psucia produkcji.

- [x] Zapisać plan działania (ten plik)
- [x] Konfiguracja Supabase przez zmienne środowiskowe (`VITE_SUPABASE_*`)
- [x] Plik `.env.example` + dokumentacja środowiska dev
- [x] Przenieść dokumentację z `apka paulinka` do `docs/client/`
- [x] Naprawić backup JSON w Settings (`items` + `shop_responses` + `ws_adjustments`)
- [x] Usunąć z repo plik `backup-workgrid-2026-03-17T09-13-27-521Z.json`
- [x] Audyt RLS — checklist i SQL referencyjny w `docs/RLS_AUDIT.md`
- [x] Ujednolicić nazewnictwo (`metadata.json` → Work Grid System)
- [x] Schemat referencyjny w `supabase/migrations/20250625_reference_schema.sql`
- [ ] Zastosować/weryfikować polityki RLS w Supabase Dashboard (ręcznie)

---

## Faza 1 — Utwardzenie techniczne ✅ UKOŃCZONA

Cel: kod produkcyjnej jakości, nadal bez zmiany logiki biznesowej.

- [x] Tailwind z builda zamiast CDN w `index.html`
- [x] Konfigurowalna liczba sklepów (`APP_CONFIG.ORDER_SHOP_COUNT`)
- [x] ESLint + Prettier
- [x] GitHub Actions: `npm run build` na pull requestach
- [x] Vitest — testy `utils.ts` + `orderAccess.ts`
- [x] Usunąć martwy kod (`seed_data.ts`, zależność `list`)
- [x] Zabezpieczenie publicznych zamówień (PIN + RPC Supabase)
- [ ] **Uruchomić migrację** `supabase/migrations/20250625_order_access_pin.sql` w Supabase SQL Editor

---

## Faza 2 — Wdrożenie u klienta Paulinka ✅ UKOŃCZONA

Cel: dostarczyć gotowy produkt pod konkretnego klienta.

- [x] Rebranding (Freshmarket Scheduler, logo SVG, kolory brand)
- [x] Import pracowników CSV/JSON w Ustawieniach
- [x] PWA — `vite-plugin-pwa`, manifest, ikona, service worker
- [ ] Supabase Pro + własna domena (decyzja klienta — patrz `docs/DEPLOY_KLIENT.md`)
- [x] Konfiguracja lokalizacji pogody (presety + własne współrzędne)
- [x] Instrukcja wdrożenia: `docs/DEPLOY_KLIENT.md`

---

## Faza 3 — Płatne rozszerzenia (po umowie)

Źródło wymagań: `apka paulinka/DOKUMENTACJA_CZESC2_PLAN_ROZBUDOWY.md`

| Moduł | Szac. czas | Status | Uwagi |
|-------|------------|--------|-------|
| Eksport Excel | 4–6 h | ✅ | grafik, pracownicy, urlopy |
| PWA | 2–4 h | ✅ | W Fazie 2 |
| Czat między sklepami | 10–16 h | ✅ | `/chat`, tabela `messages` + Realtime |
| Powiadomienia | 8–12 h | ✅ | In-app w Ustawieniach |
| Wnioski urlopowe | 12–16 h | ✅ | Sekcja na stronie Urlopy |
| Panel admina sieci sklepów | 20–30 h | ✅ (uproszczony) | `/network`, tabela `stores` |
| Audit log | 8–12 h | ✅ | Ustawienia + log przy mutacjach |
| Konflikty w grafiku | 6–10 h | ✅ | Banner na stronie Grafik |

**Nie robimy:** aplikacji desktopowej (Electron/Tauri) — rekomendacja PWA z dokumentacji.

---

## Co już działa w produkcji (nie psuć bez potrzeby)

| Moduł | Route | Stan |
|-------|-------|------|
| Dashboard | `/` | ✅ |
| Grafik zmian | `/schedule` | ✅ |
| Pracownicy | `/employees` | ✅ |
| Urlopy | `/vacations` | ✅ |
| Wolne soboty | `/free-saturdays` | ✅ |
| Telefony | `/phones` | ✅ |
| Zamówienia (admin) | `/orders` | ✅ |
| Zamówienia (publiczne) | `/order/:token` | ✅ |
| Ustawienia + backup JSON | `/settings` | ✅ |
| Instrukcje | `/instructions` | ✅ |
| Logowanie | `/login` | ✅ |

**Placeholdery (nie krytyczne):** powiadomienia, Excel, PDF export, feedback w menu.

---

## Workflow deployu

```
Kod lokalny (localhost + konto admina, ta sama baza)
    ↓ testy ręczne na localhost:3000
    ↓ commit + push
    ↓ npm run build → npm run deploy → GitHub Pages
Użytkownicy dostają nową wersję kodu (baza bez zmian, chyba że była migracja)
```

### Zasady

1. Podczas testów — **tylko konto admina**, nie konta użytkowników
2. Zmiany schematu DB dotyczą wszystkich — robić ostrożnie, z backupem
3. Deploy dopiero gdy funkcja działa lokalnie
4. Duże zmiany: deploy wieczorem / w weekend

---

## Dziennik postępów

| Data | Co zrobiono |
|------|-------------|
| 2025-06-25 | Plan działania; workflow: ta sama baza + konto admina + localhost |
| 2025-06-25 | Faza 0: backup naprawiony, docs przeniesione, RLS checklist, usunięty plik backup z repo |
| 2025-06-25 | Faza 1: Tailwind build, sklepy konfigurowalne, ESLint/Prettier, CI, Vitest |
| 2025-06-25 | Faza 1 ukończona: strict TS, PIN + RPC dla publicznych zamówień |
| 2025-06-25 | Faza 2: rebranding Freshmarket, PWA, import pracowników, pogoda, docs wdrożenia |
| 2025-06-25 | Faza 3: Excel, czat, powiadomienia, wnioski urlopowe, panel sieci, audit log, konflikty grafiku (v2.5.0) |

---

## Szybkie komendy

```bash
# Podgląd live (localhost, konto admina)
npm run dev

# Build produkcyjny (lokalnie, przed deployem)
npm run build

# Deploy na GitHub Pages (PROD — użytkownicy)
npm run deploy
```

---

## Linki

- Produkcja: https://matikgal.github.io/work-grid-system
- Repo: https://github.com/matikgal/work-grid-system
- Supabase dashboard: https://supabase.com/dashboard
- Dokumentacja środowiska: [SRODOWISKO_DEV.md](./SRODOWISKO_DEV.md)
