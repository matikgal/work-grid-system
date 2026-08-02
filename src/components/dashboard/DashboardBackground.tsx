/**
 * Lightweight aurora backdrop — static only, no CSS filter:blur / Framer Motion.
 * Animated + blurred layers force continuous repaints on software-rendered GPUs.
 */
export function DashboardBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div
        className="absolute -right-24 -top-28 h-[28rem] w-[28rem] rounded-full opacity-70"
        style={{
          background:
            'radial-gradient(circle at center, rgba(167,139,250,0.45) 0%, rgba(167,139,250,0) 70%)',
        }}
      />
      <div
        className="absolute -bottom-36 -left-20 h-[26rem] w-[26rem] rounded-full opacity-70"
        style={{
          background:
            'radial-gradient(circle at center, rgba(56,189,248,0.4) 0%, rgba(56,189,248,0) 70%)',
        }}
      />
      <div
        className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full opacity-60"
        style={{
          background:
            'radial-gradient(circle at center, rgba(240,171,252,0.35) 0%, rgba(240,171,252,0) 70%)',
        }}
      />
      <div
        className="absolute bottom-8 right-8 h-72 w-72 rounded-full opacity-55"
        style={{
          background:
            'radial-gradient(circle at center, rgba(129,140,248,0.35) 0%, rgba(129,140,248,0) 70%)',
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-white/15 dark:from-black/20 dark:to-black/30" />
    </div>
  );
}
