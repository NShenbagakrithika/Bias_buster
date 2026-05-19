import { Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import AppLayout from "./layout/AppLayout";

import Home from "./pages/Home";
import Analyze from "./pages/Analyze";
import RewriteStudio from "./pages/RewriteStudio";
import Rules from "./pages/Rules";
import History from "./pages/History";
import Workspace from "./pages/Workspace";

import Button from "./components/ui/Button";
import ThemeToggle from "./components/ThemeToggle";

function PublicLayout() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--bg)]/85 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate("/")}
            className="text-sm font-semibold tracking-tight text-[var(--text)]"
          >
            ScriptEngine
          </button>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="secondary" onClick={() => navigate("/rewrite")}>
              Rewrite Studio
            </Button>
            <Button onClick={() => navigate("/workspace")}>Open Workspace</Button>
          </div>
        </div>
      </header>

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Landing page (no app shell) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
      </Route>

      {/* App pages (with sidebar + app header) */}
      <Route element={<AppLayout />}>
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/rewrite" element={<RewriteStudio />} />
        <Route path="/rules" element={<Rules />} />
        <Route path="/history" element={<History />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}