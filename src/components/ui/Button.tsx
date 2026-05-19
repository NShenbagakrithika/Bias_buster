import { motion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";

type ButtonProps = Omit<HTMLMotionProps<"button">, "children" | "disabled"> & {
  variant?: Variant;
  isLoading?: boolean;
  disabled?: boolean;
  children?: ReactNode;
};

export default function Button({
  variant = "primary",
  className = "",
  isLoading = false,
  children,
  disabled,
  type,
  ...rest
}: ButtonProps) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium tracking-tight transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed";

  const styles: Record<Variant, string> = {
    primary: "bg-[var(--primary)] text-white shadow-sm hover:shadow-md",
    secondary:
      "border border-[var(--border)] bg-[var(--card)] text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--primary)_6%,var(--card))]",
    ghost:
      "text-[var(--text)] hover:bg-[color-mix(in_srgb,var(--primary)_8%,transparent)]",
  };

  const isDisabled = Boolean(disabled || isLoading);

  return (
    <motion.button
      type={type ?? "button"}
      disabled={isDisabled}
      whileHover={!isDisabled ? { y: -1 } : undefined}
      whileTap={!isDisabled ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] as any }}
      className={`${base} ${styles[variant]} ${className}`}
      {...rest}
    >
      {isLoading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden
        />
      )}
      <span className="truncate">{children}</span>
    </motion.button>
  );
}