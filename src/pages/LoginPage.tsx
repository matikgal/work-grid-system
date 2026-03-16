import React, { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Loader2,
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  AlertCircle,
  Github,
} from "lucide-react";
import { APP_CONFIG } from "../config/app";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginEmail = email.includes("@") ? email : `${email}@example.com`;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      console.error("Login error:", err);
      setError("Nieprawidłowy login lub hasło.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[100dvh] w-full flex items-center justify-center relative overflow-hidden font-sans bg-[#1B1D24] text-white selection:bg-[#0EA5E9] selection:text-white">
      {/* Tło jako obraz (prawa strona / spód pod wszystkim) */}

      {/* Folia dla czytelności na urządzeniach mobilnych, kiedy lewy background zostanie ukryty */}
      <div className="absolute inset-0 bg-[#1c1e26]/90 backdrop-blur-md lg:hidden z-10"></div>

      {/* Główny kontener na pozycjonowanie nałożony nad z-10 */}
      <div className="relative z-20 w-full h-[100dvh] max-w-[1400px] flex flex-col px-6 md:px-12 py-8 overflow-y-auto overflow-x-hidden pt-8">
        {/* Górny Pasek i Nazwa Apki */}
        <div className="flex items-center gap-2 mb-10 md:mb-0">
          {/* Kulka imitująca ikonę ze screena */}
          <div className="w-6 h-6 rounded-full bg-[#0EA5E9] shadow-[0_0_15px_rgba(14,165,233,0.3)]"></div>
          <span className="font-bold text-lg tracking-tight">Work Grid.</span>
        </div>

        {/* Panel Logowania wymodelowany ściśle do zdjęcia */}
        <div className="flex-1 flex flex-col justify-center w-full max-w-[400px]">
          <div className="text-[#848C9E] text-[10px] font-black tracking-widest uppercase mb-3 text-center">
            WITAJ W SYSTEMIE
          </div>

          <h1 className="text-4xl md:text-5xl font-bold mb-5 tracking-tight flex justify-center items-baseline gap-1 text-center">
            Zaloguj się
            <span className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9] inline-block mb-1 shadow-[0_0_10px_rgba(14,165,233,0.5)]"></span>
          </h1>

          <div className="flex items-center justify-center gap-2 mb-10 text-sm font-medium">
            <span className="text-[#848C9E]">Potrzebujesz konta?</span>
            <button
              onClick={() => setIsAccessModalOpen(true)}
              className="text-[#0EA5E9] font-bold hover:text-[#5abdf6] transition-colors outline-none cursor-pointer"
            >
              Zapytaj o dostęp
            </button>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Input Login/ID */}
            <div className="bg-[#292C38] rounded-2xl p-4 flex flex-col border border-transparent focus-within:border-[#0EA5E9]/50 focus-within:ring-1 focus-within:ring-[#0EA5E9]/20 transition-all shadow-inner">
              <label className="text-[10px] text-[#848C9E] font-bold mb-1 pl-1 uppercase tracking-wider">
                ID PRACOWNIKA / LOGIN
              </label>
              <div className="flex items-center pr-2">
                <input
                  type="text"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent text-white w-full text-sm outline-none px-1 placeholder:text-[#5B6071] font-semibold"
                  placeholder="np. admin"
                  autoComplete="username"
                  required
                />
                <User className="w-5 h-5 text-[#848C9E]" strokeWidth={2} />
              </div>
            </div>

            {/* Input Hasło */}
            <div className="bg-[#292C38] rounded-2xl p-4 flex flex-col border border-transparent focus-within:border-[#0EA5E9]/50 focus-within:ring-1 focus-within:ring-[#0EA5E9]/20 transition-all shadow-inner">
              <label className="text-[10px] text-[#A0A6B5] font-bold mb-1 pl-1 uppercase tracking-wider">
                Hasło
              </label>
              <div className="flex items-center pr-2">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-transparent text-[#0EA5E9] w-full text-sm outline-none px-1 placeholder:text-[#5B6071] font-black tracking-[0.2em]"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="focus:outline-none hover:opacity-80 transition-opacity"
                >
                  {showPassword ? (
                    <EyeOff
                      className="w-5 h-5 text-[#848C9E]"
                      strokeWidth={2}
                    />
                  ) : (
                    <Eye className="w-5 h-5 text-[#848C9E]" strokeWidth={2} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="mt-2 text-rose-400 text-xs font-bold px-4 py-3 bg-rose-500/10 rounded-xl border border-rose-500/20 flex items-center gap-2">
                <AlertCircle size={15} />
                {error}
              </div>
            )}

            {/* Dual Buttons z designu */}
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-6">
              <button
                type="button"
                onClick={() => setIsAccessModalOpen(true)}
                className="w-full sm:w-1/2 px-6 py-4 rounded-full bg-[#343846] hover:bg-[#3D4252] text-[#B0B6CB] text-sm font-bold transition-colors active:scale-95 flex justify-center"
              >
                Zapytaj o dostęp
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-1/2 px-6 py-4 rounded-full bg-[#0EA5E9] hover:bg-[#129ADD] text-white text-sm font-bold shadow-[0_8px_25px_-5px_rgba(14,165,233,0.6)] transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Zaloguj się
              </button>
            </div>
          </form>
        </div>

        {/* Stopka na dole przyklejona jako elastyczna */}
        <div className="w-full p-2 mt-auto mb-4 border-t border-white/5 opacity-80 pt-6 z-30 relative block">
          <div className="w-full flex flex-col md:flex-row items-center justify-between text-[11px] font-medium text-[#727685] gap-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-1 md:gap-4 flex-1">
              <span className="text-[10px] sm:text-xs flex items-center justify-center md:justify-start gap-1.5">
                Autor:
                <a
                  href="https://github.com/matikgal"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[#B0B6CB] hover:text-[#0EA5E9] transition-colors font-bold"
                >
                  <Github className="w-3.5 h-3.5" />
                  {APP_CONFIG.APP_AUTHOR}
                </a>
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 justify-center md:justify-end flex-1">
              <span className="opacity-50 hidden sm:block">
                {APP_CONFIG.APP_NAME}
              </span>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-white/5 rounded-[4px] border border-white/5 font-mono text-[10px] text-gray-400">
                  v{APP_CONFIG.APP_VERSION}
                </span>
                <span>&copy; {APP_CONFIG.APP_YEAR}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal - Dodany na żądanie z gładkim tłem */}
      {isAccessModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-[#0F1116]/80 backdrop-blur-sm"
            onClick={() => setIsAccessModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-[#1c1e26] border border-[#292C38] p-8 rounded-[20px] shadow-2xl flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 z-50">
            <h2 className="text-2xl font-bold tracking-tight text-white mb-2">
              Formularz zgłoszeniowy
            </h2>

            <form
              className="flex flex-col gap-5 text-sm"
              onSubmit={(e) => {
                e.preventDefault();
                setIsAccessModalOpen(false);
              }}
            >
              <div className="flex flex-col gap-1.5 focus-within:text-[#0EA5E9] transition-colors">
                <label className="text-[11px] font-bold text-[#A0A6B5] uppercase tracking-wider pl-1">
                  Imię i nazwisko / Firma
                </label>
                <input
                  type="text"
                  required
                  className="bg-[#292C38] border border-transparent rounded-xl px-4 py-3 outline-none focus:border-[#0EA5E9]/50 focus:ring-1 focus:ring-[#0EA5E9]/20 text-white placeholder:text-[#5B6071] transition-all"
                  placeholder="np. Jan Kowalski"
                />
              </div>
              <div className="flex flex-col gap-1.5 focus-within:text-[#0EA5E9] transition-colors">
                <label className="text-[11px] font-bold text-[#A0A6B5] uppercase tracking-wider pl-1">
                  Dlaczego potrzebujesz dostępu?
                </label>
                <textarea
                  required
                  rows={3}
                  className="bg-[#292C38] border border-transparent rounded-xl px-4 py-3 outline-none focus:border-[#0EA5E9]/50 focus:ring-1 focus:ring-[#0EA5E9]/20 text-white placeholder:text-[#5B6071] transition-all resize-none"
                  placeholder="Oczekuję nadania praw do zarządzania..."
                ></textarea>
              </div>
              <div className="flex flex-col gap-1.5 focus-within:text-[#0EA5E9] transition-colors">
                <label className="text-[11px] font-bold text-[#A0A6B5] uppercase tracking-wider pl-1">
                  Od kogo dowiedziałeś się o systemie?
                </label>
                <input
                  type="text"
                  required
                  className="bg-[#292C38] border border-transparent rounded-xl px-4 py-3 outline-none focus:border-[#0EA5E9]/50 focus:ring-1 focus:ring-[#0EA5E9]/20 text-white placeholder:text-[#5B6071] transition-all"
                  placeholder="np. Od menedżera regionu"
                />
              </div>

              <div className="mt-5 flex gap-3 justify-end items-center border-t border-[#292C38] pt-6">
                <button
                  type="button"
                  onClick={() => setIsAccessModalOpen(false)}
                  className="px-5 py-3 rounded-full text-[#A0A6B5] hover:text-white hover:bg-[#292C38] text-sm font-bold transition-colors"
                >
                  Anuluj krok
                </button>
                <button
                  type="submit"
                  className="bg-[#0EA5E9] hover:bg-[#129ADD] text-white px-6 py-3 rounded-full text-sm font-bold transition-all shadow-[0_5px_15px_-5px_rgba(14,165,233,0.5)]"
                >
                  Zgłoś zapytanie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
