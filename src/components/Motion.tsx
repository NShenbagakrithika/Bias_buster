import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export function MotionCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileHover={reduce ? undefined : { y: -1 }}
      transition={{ duration: 0.16, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}

export function MotionPress({ children, className = "" }: { children: ReactNode; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      whileTap={reduce ? undefined : { scale: 0.98 }}
      transition={{ duration: 0.12, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}