import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SchedulePage } from './pages/SchedulePage';
import { FreeSaturdaysPage } from './pages/FreeSaturdaysPage';
import { VacationsPage } from './pages/VacationsPage';
import { PhonesPage } from './pages/PhonesPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminOrderPage } from './pages/AdminOrderPage';
import { PublicOrderPage } from './pages/PublicOrderPage';
import { InstructionsPage } from './pages/InstructionsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { SettingsPage } from './pages/SettingsPage';
import { ChatPage } from './pages/ChatPage';
import { NetworkPage } from './pages/NetworkPage';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'sonner';

const queryClient = new QueryClient();

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setCheckingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (checkingSession) {
    return (
      <div className="login-aurora flex h-screen items-center justify-center p-6">
        <div className="flex flex-col items-center gap-5 rounded-[1.75rem] border border-white/55 bg-white/70 px-12 py-10 shadow-[0_36px_80px_-36px_rgba(49,46,129,0.55)] backdrop-blur-2xl dark:border-white/10 dark:bg-[#14121f]/80">
          <span className="relative flex h-14 w-14 items-center justify-center">
            <span className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10" />
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" strokeWidth={2.25} />
          </span>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-indigo-950/55 dark:text-indigo-100/60">
            Ładowanie systemu…
          </p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppProvider>
        <Toaster
          richColors
          position="bottom-right"
          theme="system"
          toastOptions={{ className: 'dash-toast' }}
        />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              {/* Public Route: Login */}
              <Route 
                path="/login" 
                element={!session ? <LoginPage /> : <Navigate to="/" replace />} 
              />

              {/* Protected Routes */}
              <Route 
                path="/" 
                element={session ? <DashboardPage session={session} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/schedule" 
                element={session ? <SchedulePage session={session} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/free-saturdays" 
                element={session ? <FreeSaturdaysPage session={session} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/vacations" 
                element={session ? <VacationsPage session={session} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/phones" 
                element={session ? <PhonesPage session={session} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/orders" 
                element={session ? <OrdersPage session={session} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/orders/:id" 
                element={session ? <AdminOrderPage /> : <Navigate to="/login" replace />} 
              />
              <Route path="/order/:token" element={<PublicOrderPage />} />
              <Route 
                path="/instructions" 
                element={session ? <InstructionsPage /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/employees" 
                element={session ? <EmployeesPage session={session} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/settings" 
                element={session ? <SettingsPage /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/chat" 
                element={session ? <ChatPage session={session} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/network" 
                element={session ? <NetworkPage session={session} /> : <Navigate to="/login" replace />} 
              />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
