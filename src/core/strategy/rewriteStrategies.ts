// src/core/strategy/rewriteStrategies.ts

export type Tone = "Inclusive" | "Professional" | "Warm" | "Concise";

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

function softenRiskyTerms(text: string) {
  return text
    .replace(/\brockstar|ninja|guru\b/gi, "skilled teammate")
    .replace(/\bchairman\b/gi, "chair")
    .replace(/\bmanpower\b/gi, "team capacity")
    .replace(/\byoung|digital native|fresh blood\b/gi, "adaptable")
    .replace(/\bcrazy|insane|lame\b/gi, "ineffective")
    .replace(/\bculture fit\b/gi, "values-aligned collaboration")
    .replace(/\bnative speaker\b/gi, "clear communicator")
    .replace(/\bcrush|dominate|destroy\b/gi, "improve")
    .replace(/\bguaranteed|100%\b/gi, "designed to help");
}

const InclusiveStrategy: RewriteStrategy = {
  id: "Inclusive",
  label: "Inclusive",
  generate(input) {
    const base = softenRiskyTerms(normalize(input));
    return [
      { name: "Inclusive rewrite", fullText: base },
      {
        name: "Criteria-first",
        fullText: `${base} Focus on relevant skills, clear expectations, and equivalent experience.`,
      },
      {
        name: "Accessible version",
        fullText: `${base} Use clear action text, avoid assumptions, and make the next step explicit.`,
      },
    ];
  },
};

const ProfessionalStrategy: RewriteStrategy = {
  id: "Professional",
  label: "Professional",
  generate(input) {
    const base = softenRiskyTerms(normalize(input));
    return [
      { name: "Polished", fullText: base },
      {
        name: "Evidence-led",
        fullText: `${base} Add a concrete proof point or qualification where the claim may need support.`,
      },
      {
        name: "Decision-ready",
        fullText: `${base} The language is direct, specific, and suitable for external review.`,
      },
    ];
  },
};

const WarmStrategy: RewriteStrategy = {
  id: "Warm",
  label: "Warm",
  generate(input) {
    const base = softenRiskyTerms(normalize(input));
    return [
      { name: "Welcoming", fullText: base },
      {
        name: "Human-centered",
        fullText: `${base} We welcome different paths, backgrounds, and ways of working.`,
      },
      {
        name: "Low-friction",
        fullText: `${base} Share what is relevant, ask for what you need, and make the next step clear.`,
      },
    ];
  },
};

const ConciseStrategy: RewriteStrategy = {
  id: "Concise",
  label: "Concise",
  generate(input) {
    const base = softenRiskyTerms(normalize(input));
    return [
      { name: "Short", fullText: base },
      {
        name: "Plain language",
        fullText: base.replace(/\butilize\b/gi, "use").replace(/\bfacilitate\b/gi, "help"),
      },
      {
        name: "Action-focused",
        fullText: `${base} Next step: review the criteria and update unclear wording.`,
      },
    ];
  },
};

export const strategies: Record<Tone, RewriteStrategy> = {
  Inclusive: InclusiveStrategy,
  Professional: ProfessionalStrategy,
  Warm: WarmStrategy,
  Concise: ConciseStrategy,
};

export function generateRewriteVariants(tone: Tone, input: string): Variant[] {
  const strat = strategies[tone] ?? strategies.Inclusive;
  return strat.generate(input);
}
