import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, Loader2, Save, ChevronDown, MapPin, Navigation, ExternalLink, Star } from 'lucide-react';
import { MainLayout } from '../components/layout/MainLayout';
import { PageHeader } from '../components/shared/PageHeader';
import { storeService, Store } from '../services/storeService';
import { auditService } from '../services/auditService';
import { APP_CONFIG, PAULINKA_STORES } from '../config/app';
import { DashboardBackground } from '../components/dashboard/DashboardBackground';
import { PageFooter } from '../components/shared/PageFooter';
import { cn } from '../utils';
import { toast } from 'sonner';
import '../components/dashboard/dashboard-modern.css';

interface NetworkPageProps {
  session: Session;
}

export const storeKeys = {
  all: (userId: string) => ['stores', userId] as const,
};

export const NetworkPage: React.FC<NetworkPageProps> = ({ session }) => {
  const userId = session.user.id;
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, Partial<Store>>>({});
  const [openId, setOpenId] = useState<string | null>(null);

  const { data: stores = [], isLoading } = useQuery({
    queryKey: storeKeys.all(userId),
    queryFn: () => storeService.ensureDefaults(userId),
    enabled: !!userId,
  });

  const { mutateAsync: saveStore, isPending: saving } = useMutation({
    mutationFn: ({ id, fields }: { id: string; fields: Partial<Pick<Store, 'name' | 'address' | 'managerName'>> }) =>
      storeService.update(id, fields),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: storeKeys.all(userId) }),
  });

  useEffect(() => {
    setEdits({});
  }, [stores]);

  const getField = (store: Store, field: 'name' | 'address' | 'managerName') =>
    edits[store.id]?.[field] ?? store[field] ?? '';

  const setField = (storeId: string, field: 'name' | 'address' | 'managerName', value: string) => {
    setEdits((prev) => ({
      ...prev,
      [storeId]: { ...prev[storeId], [field]: value },
    }));
  };

  const handleSave = async (store: Store) => {
    const fields = edits[store.id];
    if (!fields) return;
    try {
      await saveStore({ id: store.id, fields });
      await auditService.log(userId, 'store_updated', 'stores', store.id, fields);
      toast.success(`Sklep ${store.number} zaktualizowany`);
      setEdits((prev) => {
        const next = { ...prev };
        delete next[store.id];
        return next;
      });
    } catch {
      toast.error('Błąd zapisu. Uruchom migrację Fazy 3 w Supabase.');
    }
  };

  return (
    <MainLayout pageTitle="Sieć sklepów">
      <div className="dash-modern">
        <DashboardBackground />

        <div className="dash-scroll relative z-10 min-h-0 flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <PageHeader
              title="Panel sieci sklepów"
              icon={Building2}
              accent="#7c3aed"
              subtitle={`${APP_CONFIG.ORDER_SHOP_COUNT} sklepów w sieci`}
              className="!mb-0"
            />

            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
              </div>
            ) : (
              <div className="space-y-3">
                {stores.map((store) => {
                  const isOpen = openId === store.id;
                  const preset = PAULINKA_STORES.find((p) => p.number === store.number);
                  const presetAddress = preset ? `${preset.address}, ${preset.city}` : '';
                  // Display falls back to the curated Paulinka list when the DB field is empty.
                  const name = getField(store, 'name') || preset?.name || `Sklep ${store.number}`;
                  const address = getField(store, 'address') || presetAddress;
                  const query =
                    [getField(store, 'name') || preset?.name, address]
                      .filter(Boolean)
                      .join(' ')
                      .trim() || `Sklep ${store.number}`;
                  const enc = encodeURIComponent(query);
                  // Precise pin from the curated coordinates; otherwise geocode the address string.
                  const mapSrc = preset
                    ? `https://maps.google.com/maps?q=${preset.latitude},${preset.longitude}&z=16&output=embed`
                    : `https://maps.google.com/maps?q=${enc}&z=15&output=embed`;
                  const hasMap = !!preset || !!getField(store, 'address');
                  const hasEdits = !!edits[store.id];
                  const presetUnsaved =
                    !!preset &&
                    (!store.name || !store.address) &&
                    !edits[store.id]?.name &&
                    !edits[store.id]?.address;

                  const fillFromPreset = () => {
                    if (!preset) return;
                    setEdits((prev) => ({
                      ...prev,
                      [store.id]: {
                        ...prev[store.id],
                        ...(store.name ? {} : { name: preset.name }),
                        ...(store.address ? {} : { address: presetAddress }),
                      },
                    }));
                  };

                  const inputClass =
                    'w-full rounded-xl border border-indigo-950/12 bg-white/70 px-3 py-2 text-sm text-indigo-950 outline-none transition-all placeholder:text-indigo-950/35 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-white/12 dark:bg-white/5 dark:text-indigo-50 dark:placeholder:text-indigo-100/35';

                  return (
                    <div key={store.id} className="dash-glass overflow-hidden">
                      {/* Nagłówek harmonijki */}
                      <button
                        type="button"
                        onClick={() => setOpenId(isOpen ? null : store.id)}
                        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-white/40 dark:hover:bg-white/[0.03]"
                        aria-expanded={isOpen}
                      >
                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/18 to-violet-500/10 text-base font-bold text-violet-600 dark:text-violet-300">
                          {store.number}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-semibold tracking-tight">{name}</div>
                          <div className="flex items-center gap-1.5 text-sm text-indigo-950/50 dark:text-indigo-100/55">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{address || 'Brak adresu'}</span>
                          </div>
                        </div>
                        {hasEdits && (
                          <span className="hidden rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-600 sm:inline dark:text-amber-400">
                            Niezapisane
                          </span>
                        )}
                        <ChevronDown
                          className={cn(
                            'h-5 w-5 shrink-0 text-indigo-950/40 transition-transform dark:text-indigo-100/45',
                            isOpen && 'rotate-180',
                          )}
                        />
                      </button>

                      {/* Rozwijana zawartość */}
                      {isOpen && (
                        <div className="animate-in fade-in slide-in-from-top-2 border-t border-white/40 duration-200 dark:border-white/10">
                          <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_1fr]">
                            {/* Mapa */}
                            <div className="overflow-hidden rounded-2xl border border-white/50 bg-white/40 dark:border-white/10 dark:bg-white/[0.03]">
                              {hasMap ? (
                                <iframe
                                  title={`Mapa: ${name}`}
                                  src={mapSrc}
                                  className="h-64 w-full border-0 lg:h-full lg:min-h-[20rem]"
                                  loading="lazy"
                                  referrerPolicy="no-referrer-when-downgrade"
                                />
                              ) : (
                                <div className="flex h-64 flex-col items-center justify-center gap-2 text-center text-indigo-950/45 dark:text-indigo-100/45">
                                  <MapPin className="h-8 w-8" />
                                  <p className="text-sm">Dodaj adres, aby zobaczyć mapę</p>
                                </div>
                              )}
                            </div>

                            {/* Dane + akcje */}
                            <div className="flex flex-col gap-3">
                              <div className="space-y-2.5">
                                <div className="space-y-1">
                                  <label className="ml-0.5 text-xs font-semibold text-indigo-950/55 dark:text-indigo-100/55">Nazwa</label>
                                  <input
                                    value={getField(store, 'name')}
                                    onChange={(e) => setField(store.id, 'name', e.target.value)}
                                    placeholder="Nazwa sklepu"
                                    className={inputClass}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="ml-0.5 text-xs font-semibold text-indigo-950/55 dark:text-indigo-100/55">Adres</label>
                                  <input
                                    value={getField(store, 'address')}
                                    onChange={(e) => setField(store.id, 'address', e.target.value)}
                                    placeholder="np. Bielska 28a, Bielsko-Biała"
                                    className={inputClass}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="ml-0.5 text-xs font-semibold text-indigo-950/55 dark:text-indigo-100/55">Kierownik</label>
                                  <input
                                    value={getField(store, 'managerName')}
                                    onChange={(e) => setField(store.id, 'managerName', e.target.value)}
                                    placeholder="Imię i nazwisko"
                                    className={inputClass}
                                  />
                                </div>
                              </div>

                              {presetUnsaved && (
                                <button
                                  type="button"
                                  onClick={fillFromPreset}
                                  className="dash-btn dash-btn--ghost self-start text-xs"
                                  title={`${preset!.name} — ${presetAddress}`}
                                >
                                  <MapPin className="h-4 w-4" />
                                  Wpisz dane z listy Paulinka
                                </button>
                              )}

                              {/* Linki Google */}
                              {address && (
                                <div className="flex flex-wrap gap-2">
                                  <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${enc}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="dash-btn dash-btn--ghost"
                                  >
                                    <Navigation className="h-4 w-4" />
                                    Trasa
                                  </a>
                                  <a
                                    href={`https://www.google.com/maps/search/?api=1&query=${enc}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="dash-btn dash-btn--ghost"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    Mapy
                                  </a>
                                  <a
                                    href={`https://www.google.com/search?q=${encodeURIComponent(query + ' opinie')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="dash-btn dash-btn--ghost"
                                  >
                                    <Star className="h-4 w-4" />
                                    Opinie
                                  </a>
                                </div>
                              )}

                              <button
                                onClick={() => handleSave(store)}
                                disabled={!hasEdits || saving}
                                className="dash-btn mt-auto self-start"
                              >
                                <Save className="h-4 w-4" />
                                {saving ? 'Zapisywanie...' : 'Zapisz zmiany'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <PageFooter />
      </div>
    </MainLayout>
  );
};
