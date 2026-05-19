import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

export default function Page({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion();

  const ease: any = [0.16, 1, 0.3, 1];

  return (
    <motion.div
      initial={
        reduce
          ? { opacity: 1 }
          : { opacity: 0, y: 12, scale: 0.995, filter: "blur(4px)" }
      }
      animate={
        reduce
          ? { opacity: 1 }
          : { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
      }
      exit={
        reduce
          ? { opacity: 0 }
          : { opacity: 0, y: -12, scale: 0.995, filter: "blur(4px)" }
      }
      transition={{ duration: 0.28, ease }}
    >
      {children}
    </motion.div>
  );
}