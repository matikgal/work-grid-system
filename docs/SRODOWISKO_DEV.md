# Środowisko developerskie — praca na istniejącej bazie

## Zasada

**Jedna baza Supabase — izolacja przez konta (`user_id` + RLS).**

Podczas kodowania loguj się na konto demo/admin. Dane innych użytkowników są odizolowane.

---

## Jak pracować na żywo

```bash
npm install
npm run dev
```

Otwórz: http://localhost:3000/work-grid-system/

Zaloguj się na konto demo. Edytujesz kod → Vite odświeża stronę na żywo (HMR).

---

## Dwa „środowiska”

| | Lokalnie (`npm run dev`) | Produkcja (GitHub Pages) |
|--|--------------------------|--------------------------|
| Baza Supabase | Ta sama | Ta sama |
| Kod | Twój, lokalny | Ostatni deploy |
| Kto widzi zmiany | Tylko Ty | Wszyscy po `npm run deploy` |

---

## Na co uważać

- Nie loguj się na konta użytkowników produkcyjnych podczas testów destrukcyjnych
- Zmiany schematu DB i RLS dotyczą wszystkich — patrz [RLS_AUDIT.md](./RLS_AUDIT.md)
- Deploy dopiero gdy funkcja działa lokalnie

---

## Deploy

```bash
npm run build
npm run deploy
```
