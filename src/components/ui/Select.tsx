import { motion, type HTMLMotionProps, useReducedMotion } from "framer-motion";

type SelectProps = Omit<HTMLMotionProps<"select">, "children"> & {
  children: React.ReactNode;
};

export default function Select({ className = "", children, ...rest }: SelectProps) {
  const reduce = useReducedMotion();
  const ease: any = [0.16, 1, 0.3, 1];

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -1 }}
      whileTap={reduce ? undefined : { scale: 0.995 }}
      transition={{ duration: 0.14, ease }}
      className="relative"
    >
      <motion.select
        {...rest}
        className={[
          "w-full appearance-none rounded-lg border border-[var(--border)] bg-[var(--card)] px-3 py-2 pr-8 text-sm text-[var(--text)]",
          "transition-all duration-200",
          "hover:border-[color-mix(in_srgb,var(--primary)_30%,var(--border))]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]",
          className,
        ].join(" ")}
      >
        {children}
      </motion.select>

      {/* Custom dropdown arrow */}
      <motion.span
        initial={false}
        animate={reduce ? undefined : { opacity: 0.8 }}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[var(--muted)]"
      >
        ▾
      </motion.span>
    </motion.div>
  );
}