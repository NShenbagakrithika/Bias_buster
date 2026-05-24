// src/core/singleton/RulesRegistry.ts

export type RuleToggles = Record<string, boolean>;

const RULES_KEY = "biasbuster.rules.v2";

/**
 * Singleton Pattern:
 * RulesRegistry provides ONE globally shared instance across pages.
 * Both Rules page and Audit page reference the same instance.
 */
export class RulesRegistry {
  private static instance: RulesRegistry | null = null;
  private toggles: RuleToggles = {};

  private constructor() {}

  static getInstance(): RulesRegistry {
    if (!RulesRegistry.instance) {
      RulesRegistry.instance = new RulesRegistry();
    }
    return RulesRegistry.instance;
  }

  load(defaults: RuleToggles) {
    try {
      const raw = localStorage.getItem(RULES_KEY);
      if (!raw) {
        this.toggles = { ...defaults };
        localStorage.setItem(RULES_KEY, JSON.stringify(this.toggles));
        return this.toggles;
      }

      const parsed = JSON.parse(raw) as RuleToggles;
      this.toggles = { ...defaults, ...parsed };
      // keep storage consistent
      localStorage.setItem(RULES_KEY, JSON.stringify(this.toggles));
      return this.toggles;
    } catch {
      this.toggles = { ...defaults };
      return this.toggles;
    }
  }

  getAll(): RuleToggles {
    // if not loaded yet, try a safe load with no defaults
    if (!Object.keys(this.toggles).length) this.load({});
    return { ...this.toggles };
  }

  isEnabled(ruleId: string): boolean {
    const all = this.getAll();
    // default true if unknown (safer UX)
    const v = all[ruleId];
    return typeof v === "boolean" ? v : true;
  }

  set(ruleId: string, next: boolean) {
    const all = this.getAll();
    this.toggles = { ...all, [ruleId]: next };
    try {
      localStorage.setItem(RULES_KEY, JSON.stringify(this.toggles));
    } catch {
      // ignore storage failures
    }
    return this.getAll();
  }
}
