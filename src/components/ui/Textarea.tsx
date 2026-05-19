import { motion, type HTMLMotionProps, useReducedMotion } from "framer-motion";

type TextareaProps = Omit<HTMLMotionProps<"textarea">, "children"> & {
  className?: string;
};

export default function Textarea({ className = "", ...rest }: TextareaProps) {
  const reduce = useReducedMotion();
  const ease: any = [0.16, 1, 0.3, 1];

  return (
    <motion.div
      whileHover={reduce ? undefined : { y: -1 }}
      whileTap={reduce ? undefined : { scale: 0.997 }}
      transition={{ duration: 0.15, ease }}
      className="relative"
    >
      <motion.textarea
        {...rest}
        className={[
          "w-full rounded-lg border border-[var(--border)] bg-[var(--card)] p-3 text-sm leading-6 text-[var(--text)]",
          "transition-all duration-200",
          "placeholder:text-[var(--muted)]",
          "hover:border-[color-mix(in_srgb,var(--primary)_25%,var(--border))]",
          "focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)]",
          "resize-y",
          className,
        ].join(" ")}
      />
    </motion.div>
  );
}