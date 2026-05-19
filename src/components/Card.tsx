import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const ease: any = [0.16, 1, 0.3, 1];

  return (
    <motion.section
      initial={reduce ? undefined : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      whileHover={reduce ? undefined : { y: -3, scale: 1.01 }}
      whileTap={reduce ? undefined : { scale: 0.995 }}
      transition={{ duration: 0.22, ease }}
      className={
        "group relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 " +
        "shadow-sm transition-all duration-300 " +
        "hover:shadow-lg hover:border-[color-mix(in_srgb,var(--primary)_35%,var(--border))]"
      }
    >
      {/* subtle glow layer */}
      <motion.div
        initial={false}
        animate={reduce ? undefined : { opacity: 0 }}
        whileHover={reduce ? undefined : { opacity: 0.06 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-none absolute inset-0 bg-[var(--primary)]"
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 4 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease }}
            className="text-sm font-semibold tracking-tight text-[var(--text)]"
          >
            {title}
          </motion.div>

          {subtitle ? (
            <motion.div
              initial={reduce ? undefined : { opacity: 0 }}
              animate={reduce ? undefined : { opacity: 1 }}
              transition={{ duration: 0.25, delay: 0.05 }}
              className="mt-1 text-sm leading-6 text-[var(--muted)]"
            >
              {subtitle}
            </motion.div>
          ) : null}
        </div>

        {right ? (
          <motion.div
            whileHover={reduce ? undefined : { scale: 1.05 }}
            className="shrink-0"
          >
            {right}
          </motion.div>
        ) : null}
      </div>

      <motion.div
        initial={reduce ? undefined : { opacity: 0 }}
        animate={reduce ? undefined : { opacity: 1 }}
        transition={{ duration: 0.25, delay: 0.1 }}
        className="relative mt-5"
      >
        {children}
      </motion.div>
    </motion.section>
  );
}