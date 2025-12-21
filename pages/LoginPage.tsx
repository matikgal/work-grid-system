import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const loginEmail = email.includes('@') ? email : `${email}@example.com`;

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      });

      if (error) throw error;
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Nieprawidłowy login lub hasło.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row font-sans bg-white overflow-hidden">
        
        {/* Left Side - Image & Atmosphere */}
        <div className="w-full md:w-[55%] lg:w-[60%] relative bg-slate-900 text-white p-10 md:p-20 flex flex-col justify-between overflow-hidden">
             {/* Background Image with Overlay */}
             <div className="absolute inset-0 z-0">
                 <img 
                    src="/sklep.webp" 
                    className="w-full h-full object-cover opacity-60 scale-105" 
                    alt="Background" 
                 />
                 {/* Gradient to darken image */}
                 <div className="absolute inset-0 bg-gradient-to-br from-slate-950/80 via-slate-900/40 to-slate-950/90 mix-blend-multiply" />
                 <div className="absolute inset-0 bg-[#0f3d3e]/30 mix-blend-overlay" /> {/* Teal tint */}
             </div>
             
             {/* Main Hero Text - Minimalist */}
             <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white opacity-90 drop-shadow-2xl leading-none">
                    System<br/>
                    <span className="text-emerald-400">Harmonogramów</span>
                </h1>
                <p className="mt-8 text-xl text-slate-300 max-w-lg font-light leading-relaxed">
                    Kompleksowe narzędzie do zarządzania czasem pracy.
                    Planuj, edytuj i optymalizuj grafiki w jednym miejscu.
                </p>
                <div className="h-1.5 w-24 bg-emerald-500 mt-10" />
             </div>

             {/* Footer Text */}
             <div className="relative z-10">
                <p className="text-[10px] text-white/40 uppercase tracking-widest font-medium">Zdjęcie jest własnością firmy Paulinka Sp. z o.o.</p>
             </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-[45%] lg:w-[40%] bg-slate-50 p-8 md:p-16 lg:p-24 flex flex-col justify-center relative overflow-hidden">
            
            {/* Animated Background Effects */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#083637]/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/4 animate-pulse pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-slate-300/20 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4 pointer-events-none" />

            <div className="max-w-md mx-auto w-full relative z-10">
                <div className="mb-12">
                   <h2 className="text-4xl font-black text-slate-900 tracking-tight uppercase">Logowanie</h2>
                </div>

                <form onSubmit={handleLogin} className="space-y-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-widest">Login</label>
                            <input 
                                type="text" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full px-0 py-4 border-b-2 border-slate-200 focus:border-[#083637] outline-none transition-all bg-transparent text-slate-900 text-xl font-bold rounded-none placeholder:text-slate-300"
                                placeholder="login"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-900 mb-2 uppercase tracking-widest">Hasło</label>
                            <div className="relative">
                                <input 
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className="w-full px-0 py-4 pr-10 border-b-2 border-slate-200 focus:border-[#083637] outline-none transition-all bg-transparent text-slate-900 text-xl font-bold rounded-none placeholder:text-slate-300"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-0 bottom-4 text-slate-400 hover:text-[#083637] transition-colors outline-none"
                                >
                                    {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <label className="flex items-center cursor-pointer group select-none">
                            <input 
                                type="checkbox" 
                                className="w-5 h-5 rounded-sm border-2 border-slate-300 text-[#083637] focus:ring-[#083637] transition-all" 
                                defaultChecked 
                            />
                            <span className="ml-3 text-xs font-bold uppercase tracking-wider text-slate-500 group-hover:text-slate-900 transition-colors">Zapamiętaj</span>
                        </label>
                    </div>

                    {error && (
                        <div className="p-4 bg-rose-50 text-rose-600 text-sm font-bold border border-rose-100 flex items-center gap-3">
                            <AlertCircle size={20} />
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-5 bg-[#083637] hover:bg-black text-white font-black text-xl shadow-2xl transition-all hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
                    >
                        {loading ? <Loader2 className="animate-spin mx-auto w-7 h-7" /> : 'Zaloguj'}
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};
