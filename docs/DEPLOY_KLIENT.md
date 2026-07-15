# Wdrożenie u klienta — Grafik Pracy

## Checklist przed oddaniem klientowi

- [ ] Audyt RLS (opcjonalnie — patrz `docs/RLS_AUDIT.md`, nie blokuje pracy)
- [ ] Import pracowników (CSV/JSON w Ustawieniach)
- [ ] Ustawienie lokalizacji pogody dla sklepu klienta
- [ ] Test PWA — instalacja z Chrome/Edge („Zainstaluj aplikację”)
- [ ] Kopia zapasowa JSON przed importem danych produkcyjnych

## Hosting — opcje

### Opcja A: GitHub Pages (obecna, darmowa)

- URL: `https://matikgal.github.io/work-grid-system`
- Deploy: `npm run build && npm run deploy`
- Wystarczy dla MVP i konta demo

### Opcja B: Własna domena + Supabase Pro (zalecane dla klienta)

1. **Supabase Pro** (~25 USD/mies.) — backupy, więcej miejsca, wsparcie
2. **Domena klienta** np. `grafik.freshmarket.pl`
3. **Hosting frontendu:**
   - Cloudflare Pages / Netlify / Vercel (darmowy tier często wystarczy)
   - Ustaw `base: '/'` w `vite.config.ts` zamiast `/work-grid-system/`
4. **Koszt dla klienta:** ~100–150 PLN/mies. (infrastruktura)

## PWA — instrukcja dla kierowników

1. Otwórz aplikację w **Chrome** lub **Edge**
2. Menu przeglądarki → **Zainstaluj aplikację** / **Dodaj do ekranu głównego**
3. Ikona pojawi się na pulpicie jak natywna aplikacja
4. Aktualizacje pobierają się automatycznie przy połączeniu z internetem

## Import pracowników

**CSV** (Excel → Zapisz jako CSV UTF-8):

```text
Imię i nazwisko;Rola;Telefon
Jan Kowalski;kasa;123456789
Anna Nowak;mięso;987654321
```

**JSON** — sekcja `data.employees` z kopii zapasowej.

Ustawienia → Import pracowników → wybierz plik.

Duplikaty (ta sama nazwa) są pomijane.

## Zamówienia — link dla sklepów

Prosty link z ID zamówienia (bez PIN):
`https://.../order/{uuid}`

Kopiuj link z listy zamówień i wyślij sklepom. Gdy zamówienie jest zamknięte, dane służą do zestawienia dla przedstawiciela handlowego.

## Wsparcie po wdrożeniu

- Instrukcje w aplikacji: `/instructions`
- Changelog: menu → O aplikacji → Changelog
- Autor: Mateusz Gałuszka — [GitHub](https://github.com/matikgal)
