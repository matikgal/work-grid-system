import React, { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { pl } from 'date-fns/locale';
import { supabase } from '../lib/supabase';
import {
  Loader2,
  Eye,
  EyeOff,
  X,
  AlertCircle,
  Github,
  CalendarDays,
  Palmtree,
  ShoppingCart,
  Users,
  ArrowRight,
  Clock,
  type LucideIcon,
} from 'lucide-react';
import { APP_CONFIG, publicAssetUrl } from '../config/app';
import '../components/dashboard/dashboard-modern.css';

type Feature = { icon: LucideIcon; title: string; desc: string };

const FEATURES: Feature[] = [
  { icon: CalendarDays, title: 'Grafik zmian', desc: 'Planowanie tygodnia i miesiąca, wykrywanie konfliktów.' },
  { icon: Palmtree, title: 'Urlopy', desc: 'Salda, nieobecności i kolizje z grafikiem.' },
  { icon: ShoppingCart, title: 'Zamówienia', desc: 'Zestawienia towaru i linki dla sklepów.' },
  { icon: Users, title: 'Zespół', desc: 'Pracownicy, kontakty i przypisania do zmian.' },
];

const capitalize = (value: string) =>
  value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}` : value;

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
  const [isRegulaminOpen, setIsRegulaminOpen] = useState(false);
  const [now, setNow] = useState(() => new Date());
  const loginInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    document.title = `Logowanie · ${APP_CONFIG.APP_NAME}`;
    const timer = window.setTimeout(() => loginInputRef.current?.focus(), 80);
    const clock = window.setInterval(() => setNow(new Date()), 1000);
    return () => {
      window.clearTimeout(timer);
      window.clearInterval(clock);
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginEmail = email.includes('@') ? email : `${email}@example.com`;

    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });
      if (authError) throw authError;
    } catch (err) {
      console.error('Login error:', err);
      setError('Nieprawidłowy login lub hasło.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-aurora flex min-h-[100dvh] w-full flex-col overflow-hidden selection:bg-indigo-500/20">
      {/* Zdjęcie w tle */}
      <img
        src={publicAssetUrl('sklep.webp')}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full object-cover object-center"
      />
      {/* Ciemne przyciemnienie zdjęcia — głęboki granat/indygo, spójny z trybem ciemnym aplikacji */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#070611]/88 via-[#0d0b1f]/72 to-[#070611]/92"
        aria-hidden
      />
      {/* Akcent aurory — spójny z resztą aplikacji */}
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(58%_46%_at_100%_0%,rgba(99,102,241,0.3),transparent_60%),radial-gradient(48%_42%_at_0%_100%,rgba(56,189,248,0.22),transparent_58%)]"
        aria-hidden
      />

      <div className="relative z-10 flex min-h-[100dvh] flex-col">
        {/* Górny pasek — logo + zegar */}
        <header className="flex items-center justify-between gap-3 px-5 py-5 sm:px-8">
          <div className="flex items-center gap-2.5">
            <img
              src={publicAssetUrl(APP_CONFIG.LOGO_PATH)}
              alt=""
              className="h-9 w-9 object-contain"
              width={36}
              height={36}
            />
            <div className="leading-tight">
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
                System
              </p>
              <p className="text-base font-semibold tracking-tight text-white">Grafik Pracy</p>
            </div>
          </div>

          <div className="hidden items-center gap-2.5 rounded-2xl border border-white/15 bg-white/10 px-4 py-2 text-white backdrop-blur-xl sm:flex">
            <Clock className="size-4 text-indigo-300" strokeWidth={2} aria-hidden />
            <div className="text-right leading-tight">
              <p className="tnum text-sm font-semibold tracking-tight">{format(now, 'HH:mm:ss')}</p>
              <p className="text-[10px] text-white/55">
                {capitalize(format(now, 'EEEE, d MMMM', { locale: pl }))}
              </p>
            </div>
          </div>
        </header>

        {/* Środek — karta logowania */}
        <main className="flex flex-1 items-center justify-center px-4 py-6 sm:px-6">
          <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/55 bg-white/70 shadow-[0_36px_80px_-36px_rgba(49,46,129,0.55)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#14121f]/75 lg:grid-cols-2">
            {/* Lewa — showcase */}
            <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-sky-500 p-10 text-white lg:flex">
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.4) 0, transparent 35%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.25) 0, transparent 40%)',
                }}
                aria-hidden
              />
              <div className="relative">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
                  {APP_CONFIG.APP_NAME}
                </p>
                <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight">
                  Wszystko, czego potrzebuje kierownik sklepu — w jednym miejscu.
                </h2>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-white/80">
                  {APP_CONFIG.APP_DESCRIPTION}
                </p>
              </div>

              <ul className="relative mt-8 space-y-3">
                {FEATURES.map((f) => (
                  <li key={f.title} className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                      <f.icon className="size-5" strokeWidth={2} aria-hidden />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{f.title}</p>
                      <p className="text-xs leading-snug text-white/70">{f.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>

              <p className="relative mt-8 text-xs text-white/65">
                Wewnętrzny panel dla sieci sklepów · konta zakłada administrator (ok. 14 użytkowników).
              </p>
            </div>

            {/* Prawa — formularz */}
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Witaj <span className="dash-gradient-text">ponownie</span>
              </h1>
              <p className="mt-1.5 text-sm text-indigo-950/55 dark:text-indigo-100/60">
                Zaloguj się do panelu kierownika sklepu.
              </p>

              <form onSubmit={handleLogin} className="mt-7 space-y-4" noValidate>
                <div>
                  <label htmlFor="login-email" className="sr-only">
                    Login
                  </label>
                  <input
                    ref={loginInputRef}
                    id="login-email"
                    type="text"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="login-input"
                    placeholder="Login"
                    autoComplete="username"
                    required
                  />
                </div>

                <div className="relative">
                  <label htmlFor="login-password" className="sr-only">
                    Hasło
                  </label>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="login-input pr-12"
                    placeholder="Hasło"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 flex h-full cursor-pointer items-center px-3.5 text-indigo-950/45 transition-colors hover:text-indigo-600 focus:outline-none dark:text-indigo-100/50"
                    aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" strokeWidth={2} />
                    ) : (
                      <Eye className="h-4 w-4" strokeWidth={2} />
                    )}
                  </button>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 rounded-xl border border-rose-300/50 bg-rose-50/80 px-3.5 py-3 text-sm text-rose-700 dark:border-rose-400/25 dark:bg-rose-500/10 dark:text-rose-300"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_-12px_rgba(99,102,241,0.8)] transition-all duration-200 hover:-translate-y-0.5 hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                      Logowanie…
                    </>
                  ) : (
                    <>
                      Zaloguj się
                      <ArrowRight className="h-4 w-4" aria-hidden />
                    </>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-indigo-950/55 dark:text-indigo-100/60">
                Nie masz konta?{' '}
                <button
                  type="button"
                  onClick={() => setIsAccessModalOpen(true)}
                  className="cursor-pointer font-semibold text-indigo-600 underline-offset-4 transition-colors hover:text-indigo-700 hover:underline focus:outline-none dark:text-indigo-300"
                >
                  Zapytaj o dostęp
                </button>
              </p>
            </div>
          </div>
        </main>

        {/* Stopka */}
        <footer className="flex flex-col items-center justify-between gap-3 px-5 py-5 sm:flex-row sm:px-8">
          <a
            href={APP_CONFIG.APP_AUTHOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 text-sm font-medium text-white/70 transition-colors hover:text-white"
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-white/10 text-indigo-200 shadow-sm transition-transform group-hover:-translate-y-0.5">
              <Github className="size-4" aria-hidden />
            </span>
            matikgal
            <span className="tnum text-white/45">· v{APP_CONFIG.APP_VERSION}</span>
          </a>

          <button
            type="button"
            onClick={() => setIsRegulaminOpen(true)}
            className="cursor-pointer rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white/80 backdrop-blur-xl transition-colors hover:bg-white/20 hover:text-white"
          >
            Regulamin
          </button>
        </footer>
      </div>

      {isRegulaminOpen && (
        <Modal
          titleId="regulamin-title"
          onClose={() => setIsRegulaminOpen(false)}
          title="Regulamin"
          subtitle="Grafik Pracy — zasady korzystania"
          maxWidth="max-w-2xl"
        >
          <div className="mt-6 space-y-3 text-sm leading-relaxed">
            {[
              {
                h: '§1. Postanowienia ogólne',
                p: 'System Grafik Pracy służy do planowania zmian, zarządzania urlopami i obsługi zamówień towaru w sieci sklepów. Korzystanie z systemu wymaga konta kierownika lub administratora.',
              },
              {
                h: '§2. Dane i poufność',
                p: 'Dane pracowników są poufne. Użytkownik zobowiązuje się wykorzystywać je wyłącznie w celach służbowych. Udostępnianie loginu osobom trzecim jest zabronione.',
              },
              {
                h: '§3. Odpowiedzialność',
                p: 'Kierownik sklepu odpowiada za poprawność wpisów w grafiku i zamówieniach. Administrator sieci nadzoruje konta użytkowników i dostęp do modułów.',
              },
              {
                h: '§4. Dostęp techniczny',
                p: 'W razie problemów z logowaniem skontaktuj się z administratorem systemu lub autorem oprogramowania (matikgal).',
              },
            ].map((s) => (
              <section
                key={s.h}
                className="rounded-2xl border border-indigo-950/10 bg-white/55 p-4 dark:border-white/10 dark:bg-white/[0.04]"
              >
                <h3 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">{s.h}</h3>
                <p className="mt-1.5 text-indigo-950/70 dark:text-indigo-100/70">{s.p}</p>
              </section>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setIsRegulaminOpen(false)}
            className="mt-6 w-full rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(99,102,241,0.8)] transition-all hover:-translate-y-0.5 hover:brightness-105 sm:w-auto"
          >
            Zamknij
          </button>
        </Modal>
      )}

      {isAccessModalOpen && (
        <Modal
          titleId="access-modal-title"
          onClose={() => setIsAccessModalOpen(false)}
          title="Dostęp do systemu"
          subtitle="Wypełnij formularz — odezwiemy się w sprawie konta"
          maxWidth="max-w-lg"
        >
          <form
            className="mt-6 space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              setIsAccessModalOpen(false);
            }}
          >
            <div>
              <label htmlFor="access-name" className="mb-1.5 block text-xs font-semibold text-indigo-950/60 dark:text-indigo-100/60">
                Imię i nazwisko / firma
              </label>
              <input id="access-name" type="text" required className="login-input" placeholder="Jan Kowalski" />
            </div>
            <div>
              <label htmlFor="access-reason" className="mb-1.5 block text-xs font-semibold text-indigo-950/60 dark:text-indigo-100/60">
                Powód
              </label>
              <textarea
                id="access-reason"
                required
                rows={3}
                className="login-input resize-none"
                placeholder="Krótko opisz potrzebę…"
              />
            </div>
            <div>
              <label htmlFor="access-source" className="mb-1.5 block text-xs font-semibold text-indigo-950/60 dark:text-indigo-100/60">
                Skąd wiesz o systemie?
              </label>
              <input id="access-source" type="text" required className="login-input" placeholder="Od kierownika regionu" />
            </div>

            <div className="flex flex-col gap-2 border-t border-indigo-950/10 pt-5 dark:border-white/10 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(false)}
                className="cursor-pointer rounded-xl border border-indigo-950/12 bg-white/60 px-5 py-2.5 text-sm font-medium text-indigo-950/70 transition-colors hover:bg-white dark:border-white/12 dark:bg-white/5 dark:text-indigo-100/70"
              >
                Anuluj
              </button>
              <button
                type="submit"
                className="rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_12px_24px_-12px_rgba(99,102,241,0.8)] transition-all hover:-translate-y-0.5 hover:brightness-105"
              >
                Wyślij
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

type ModalProps = {
  titleId: string;
  title: string;
  subtitle: string;
  maxWidth: string;
  onClose: () => void;
  children: React.ReactNode;
};

const Modal = ({ titleId, title, subtitle, maxWidth, onClose, children }: ModalProps) => (
  <div
    className="login-geist fixed inset-0 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-modal="true"
    aria-labelledby={titleId}
  >
    <button
      type="button"
      className="absolute inset-0 cursor-pointer bg-indigo-950/40 backdrop-blur-sm"
      onClick={onClose}
      aria-label="Zamknij okno"
    />
    <div
      className={`relative z-10 max-h-[85dvh] w-full ${maxWidth} overflow-y-auto rounded-3xl border border-white/55 bg-white/85 p-6 shadow-[0_40px_90px_-40px_rgba(49,46,129,0.6)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#14121f]/90 sm:p-8`}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-indigo-950/10 bg-white/60 text-indigo-950/55 transition-colors hover:bg-white hover:text-indigo-700 dark:border-white/10 dark:bg-white/5 dark:text-indigo-100/60"
        aria-label="Zamknij"
      >
        <X className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <h2 id={titleId} className="pr-12 text-2xl font-semibold tracking-tight">
        {title}
      </h2>
      <p className="mt-1.5 text-sm text-indigo-950/55 dark:text-indigo-100/60">{subtitle}</p>

      {children}
    </div>
  </div>
);
