// src/core/observer/HistoryStore.ts

export type HistoryKind = "audit" | "rewrite";

export type HistoryItem = {
  id: string;
  kind: HistoryKind;
  input: string;
  createdAt: number; // epoch ms
  meta?: Record<string, string>;
  output?: unknown;
};

type Listener = (items: HistoryItem[]) => void;

const HISTORY_KEY = "biasbuster.history.v2";

/**
 * Observer Pattern:
 * HistoryStore allows subscribers to listen for updates (subscribe/notify).
 * Pages can update react state when notified — that's the observer behavior.
 */
export class HistoryStore {
  private listeners = new Set<Listener>();

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    // immediately emit current data so UI paints instantly
    fn(this.getAll());
    return () => this.listeners.delete(fn);
  }

  private notify() {
    const items = this.getAll();
    this.listeners.forEach((fn) => fn(items));
  }

  getAll(): HistoryItem[] {
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as HistoryItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  add(item: Omit<HistoryItem, "id" | "createdAt">) {
    const next: HistoryItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: Date.now(),
    };

    const current = this.getAll();
    const updated = [next, ...current].slice(0, 100); // cap history
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    this.notify();
    return next;
  }

  clear() {
    localStorage.removeItem(HISTORY_KEY);
    this.notify();
  }
}

// Single shared store instance (simple + practical)
export const historyStore = new HistoryStore();
