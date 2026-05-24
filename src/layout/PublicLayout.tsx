import { Outlet, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import ThemeToggle from "../components/ThemeToggle";

export default function PublicLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      {/* Minimal top bar for landing */}
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-semibold tracking-tight text-[var(--text)]"
          >
            Bias Buster
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="secondary" onClick={() => navigate("/rewrite")}>
              Rewrite Studio
            </Button>
            <Button onClick={() => navigate("/analyze")}>Start</Button>
          </div>
        </div>
      </header>

      {/* Full-bleed landing content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
}
