import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Loader2 } from 'lucide-react';

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { SchedulePage } from './pages/SchedulePage';
import { FreeSaturdaysPage } from './pages/FreeSaturdaysPage';
import { VacationsPage } from './pages/VacationsPage';
import { OrdersPage } from './pages/OrdersPage';
import { AdminOrderPage } from './pages/AdminOrderPage';
import { PublicOrderPage } from './pages/PublicOrderPage';
import { InstructionsPage } from './pages/InstructionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { ThemeProvider } from './context/ThemeContext';
import { AppProvider } from './context/AppContext';
import { Toaster } from 'sonner';

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
      <div className="flex items-center justify-center h-screen bg-slate-900 text-emerald-500">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-10 h-10 animate-spin" />
           <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Ładowanie systemu...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <AppProvider>
        <Toaster richColors position="bottom-right" />
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
                path="/orders" 
                element={session ? <OrdersPage session={session} /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/orders/:id" 
                element={session ? <AdminOrderPage /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/order/:token" 
                element={<PublicOrderPage />} 
              />
              <Route 
                path="/instructions" 
                element={session ? <InstructionsPage /> : <Navigate to="/login" replace />} 
              />
              <Route 
                path="/settings" 
                element={session ? <SettingsPage /> : <Navigate to="/login" replace />} 
              />
              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
