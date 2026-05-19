import { useEffect, useMemo, useState } from "react";

function getInitialTheme(): "light" | "dark" {
  const saved = localStorage.getItem("theme");
  if (saved === "light" || saved === "dark") return saved;
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    setTheme(getInitialTheme());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const label = useMemo(() => (theme === "dark" ? "Dark" : "Light"), [theme]);

  return (
    <button
      type="button"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      className="rounded-xl border border-[var(--border)] bg-[var(--card)] px-3 py-2 text-xs font-semibold text-[var(--text)] transition hover:bg-[color-mix(in_srgb,var(--primary)_6%,var(--card))]"
      aria-label="Toggle theme"
      title="Toggle theme"
    >
      {label}
    </button>
  );
}