import type { InputHTMLAttributes } from "react";

export default function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={[
        "w-full rounded-xl border border-[var(--border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--text)]",
        "placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]",
        props.className ?? "",
      ].join(" ")}
    />
  );
}