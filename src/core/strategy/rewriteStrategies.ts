// src/core/strategy/rewriteStrategies.ts

export type Tone = "Direct" | "Premium" | "Aggressive" | "Soft";

export type Variant = {
  name: string;
  fullText: string;
};

export interface RewriteStrategy {
  id: Tone;
  label: string;
  generate(input: string): Variant[];
}

function normalize(input: string) {
  return input.trim().replace(/\s+/g, " ");
}

function addCta(text: string, cta: string) {
  if (/\b(book|schedule|try|run|start|join|download)\b/i.test(text)) return text;
  return `${text} ${cta}`;
}

const DirectStrategy: RewriteStrategy = {
  id: "Direct",
  label: "Direct",
  generate(input) {
    const base = normalize(input);
    return [
      { name: "Concise", fullText: addCta(base, "Run an audit now.") },
      { name: "Clear benefit", fullText: addCta(base, "Get clear fixes in seconds.") },
      { name: "CTA-forward", fullText: `Paste your copy → get findings → ship faster. Start now.` },
    ];
  },
};

const PremiumStrategy: RewriteStrategy = {
  id: "Premium",
  label: "Premium",
  generate(input) {
    const base = normalize(input);
    return [
      {
        name: "Refined",
        fullText:
          addCta(base, "Request a quick audit summary.") +
          " Designed for clarity and credibility.",
      },
      {
        name: "Executive",
        fullText:
          "A more disciplined message wins attention. " +
          addCta(base, "Generate a report and refine in one pass.") +
          " Built for decision-makers.",
      },
      {
        name: "Confident",
        fullText:
          addCta(base, "Generate a set of polished variants.") +
          " Keep the promise precise. Keep the tone credible.",
      },
    ];
  },
};

const AggressiveStrategy: RewriteStrategy = {
  id: "Aggressive",
  label: "Aggressive",
  generate(input) {
    const base = normalize(input);
    return [
      { name: "Punchy", fullText: addCta(base, "Stop guessing. Fix it now.") },
      { name: "Urgent", fullText: addCta(base, "Your copy is costing you — run the audit.") },
      { name: "Hard CTA", fullText: `Fix the weak lines. Replace the vague claims. Generate better copy now.` },
    ];
  },
};

const SoftStrategy: RewriteStrategy = {
  id: "Soft",
  label: "Soft",
  generate(input) {
    const base = normalize(input);
    return [
      { name: "Supportive", fullText: addCta(base, "Try a quick audit whenever you’re ready.") },
      { name: "Gentle clarity", fullText: addCta(base, "See what’s unclear and improve it step by step.") },
      { name: "Low pressure", fullText: `Want a clearer message? Paste your copy and get friendly suggestions.` },
    ];
  },
};

export const strategies: Record<Tone, RewriteStrategy> = {
  Direct: DirectStrategy,
  Premium: PremiumStrategy,
  Aggressive: AggressiveStrategy,
  Soft: SoftStrategy,
};

export function generateRewriteVariants(tone: Tone, input: string): Variant[] {
  const strat = strategies[tone] ?? strategies.Direct;
  return strat.generate(input);
}