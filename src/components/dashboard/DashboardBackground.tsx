import { motion, useReducedMotion } from 'framer-motion';

/**
 * Żywe tło „aurora" — dryfująca siatka kolorowych plam + powoli obracająca się
 * poświata. Daje ruch i głębię, na której siada glassmorphism paneli.
 */
export function DashboardBackground() {
  const reduceMotion = useReducedMotion();

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* Powoli obracająca się poświata — subtelny, ciągły ruch */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-70"
        style={{
          background:
            'conic-gradient(from 0deg, rgba(99,102,241,0.18), rgba(139,92,246,0.16), rgba(56,189,248,0.16), rgba(244,114,182,0.14), rgba(99,102,241,0.18))',
          filter: 'blur(90px)',
        }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 70, repeat: Infinity, ease: 'linear' }}
      />

      {/* Dryfujące plamy aurora */}
      <motion.div
        className="absolute -right-28 -top-32 h-[34rem] w-[34rem] rounded-full bg-violet-400/35 blur-[130px]"
        animate={reduceMotion ? undefined : { x: [0, -40, 10, 0], y: [0, 30, 10, 0] }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -bottom-40 -left-24 h-[32rem] w-[32rem] rounded-full bg-sky-400/30 blur-[130px]"
        animate={reduceMotion ? undefined : { x: [0, 44, -10, 0], y: [0, -28, -8, 0] }}
        transition={{ duration: 32, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute right-1/4 top-1/3 h-80 w-80 rounded-full bg-fuchsia-300/25 blur-[120px]"
        animate={reduceMotion ? undefined : { x: [0, 26, -18, 0], y: [0, 22, -14, 0], scale: [1, 1.12, 1] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-indigo-400/25 blur-[120px]"
        animate={reduceMotion ? undefined : { x: [0, -24, 0], y: [0, 18, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Delikatny welon rozjaśniający górę — czytelność treści */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-white/20 dark:from-black/20 dark:to-black/30" />
    </div>
  );
}
