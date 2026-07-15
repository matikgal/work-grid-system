import React, { useEffect, useRef, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { MessageSquare, Loader2, ChevronDown, Check, Store } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader } from '../components/shared/PageHeader';
import { ChatPanel } from '../components/features/chat/ChatPanel';
import { useMessages } from '../hooks/useMessages';
import { useAppContext } from '../context/AppContext';
import { getOrderShopNumbers } from '../config/app';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import { PageFooter } from '../components/shared/PageFooter';
import '../components/dashboard/dashboard-modern.css';
import { cn } from '../utils';
import { toast } from 'sonner';

interface ChatPageProps {
  session: Session;
}

// Czat ma teraz jeden, wspólny kanał ogólny.
const CHANNEL = 'ogolny';

export const ChatPage: React.FC<ChatPageProps> = ({ session }) => {
  const [storeFilter, setStoreFilter] = useState<string>('');
  const [isStoreSelectOpen, setIsStoreSelectOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const { messages, loading, sendMessage } = useMessages(CHANNEL);
  const { userName } = useAppContext();
  const storeSelectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStoreSelectOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (storeSelectRef.current && !storeSelectRef.current.contains(e.target as Node)) {
        setIsStoreSelectOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsStoreSelectOpen(false);
    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [isStoreSelectOpen]);

  const displayName = userName || session.user.email?.split('@')[0] || 'Użytkownik';

  const handleSend = async (content: string) => {
    setSending(true);
    try {
      await sendMessage({
        senderId: session.user.id,
        senderName: displayName,
        content,
        storeId: storeFilter || undefined,
      });
    } catch {
      toast.error('Nie udało się wysłać wiadomości. Uruchom migrację Fazy 3 w Supabase.');
    } finally {
      setSending(false);
    }
  };

  return (
    <MainLayout pageTitle="Czat">
      <div className="dash-modern">
        <DashboardBackground />

        <div className="relative z-10 mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col gap-4 p-4 md:p-6">
          <PageHeader
            title="Czat między sklepami"
            icon={MessageSquare}
            accent="#0ea5e9"
            subtitle="Komunikacja w czasie rzeczywistym"
            className="!mb-0"
          />

          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <span className="rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-[0_8px_18px_-10px_rgba(99,102,241,0.8)]">
              Ogólny
            </span>

            <div ref={storeSelectRef} className="relative ml-auto w-full sm:w-52">
              <button
                type="button"
                onClick={() => setIsStoreSelectOpen((v) => !v)}
                className="settings-input flex w-full cursor-pointer items-center justify-between gap-2 text-left"
                aria-expanded={isStoreSelectOpen}
              >
                <span className="flex min-w-0 items-center gap-2">
                  <Store className="h-4 w-4 shrink-0 text-indigo-500" strokeWidth={2} aria-hidden />
                  <span className="truncate text-sm font-medium">
                    {storeFilter ? `Sklep ${storeFilter}` : 'Wszystkie sklepy'}
                  </span>
                </span>
                <ChevronDown
                  className={cn('h-4 w-4 shrink-0 transition-transform', isStoreSelectOpen && 'rotate-180')}
                  strokeWidth={2}
                  aria-hidden
                />
              </button>

              {isStoreSelectOpen && (
                <div className="dash-scroll absolute right-0 top-full z-20 mt-1.5 max-h-64 w-full overflow-y-auto rounded-xl border border-indigo-950/10 bg-white/90 shadow-[0_16px_32px_-16px_rgba(49,46,129,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-[#14121f]/90">
                  {[{ value: '', label: 'Wszystkie sklepy' }, ...getOrderShopNumbers().map((n) => ({ value: String(n), label: `Sklep ${n}` }))].map(
                    (opt) => (
                      <button
                        key={opt.value || 'all'}
                        type="button"
                        onClick={() => {
                          setStoreFilter(opt.value);
                          setIsStoreSelectOpen(false);
                        }}
                        className={cn(
                          'flex w-full cursor-pointer items-center justify-between gap-2 px-3 py-2.5 text-left text-sm font-medium transition-colors hover:bg-indigo-50 dark:hover:bg-white/5',
                          storeFilter === opt.value && 'bg-indigo-50 dark:bg-white/5',
                        )}
                      >
                        {opt.label}
                        {storeFilter === opt.value && (
                          <Check className="h-4 w-4 text-indigo-600" strokeWidth={2} />
                        )}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="min-h-0 flex-1">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : (
              <ChatPanel
                messages={messages}
                currentUserId={session.user.id}
                onSend={handleSend}
                sending={sending}
              />
            )}
          </div>
        </div>

        <PageFooter />
      </div>
    </MainLayout>
  );
};
