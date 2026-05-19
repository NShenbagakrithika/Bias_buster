// src/core/chain/auditChain.ts

export type Severity = "High" | "Medium" | "Low";

export type Finding = {
  id: string;
  title: string;
  detail: string;
  suggestion?: string;
  severity: Severity;
};

export type AuditContext = {
  input: string;
  contentType: string;
  mode: string;
};

export interface AuditRule {
  /** Unique stable id, used by RulesRegistry toggles */
  id: string;
  run(ctx: AuditContext): Finding[];
}

/**
 * Chain of Responsibility:
 * A request (ctx) flows through an ordered chain of handlers (rules),
 * each handler may add findings, then the request proceeds to the next handler.
 */
export function runAuditChain(chain: AuditRule[], ctx: AuditContext): Finding[] {
  const findings: Finding[] = [];

  for (const rule of chain) {
    const next = rule.run(ctx);
    if (next.length) findings.push(...next);
  }

  return findings;
}

// ----------------------------
// Concrete rules (handlers)
// ----------------------------

const vagueWords = /\b(best|world[- ]class|revolutionary|game[- ]changer|skyrocket|instantly|guaranteed|no\s*risk|100%)\b/i;
const weakCTA = /\b(get started|start today|learn more|click here)\b/i;
const numbersHint = /\b(\d+%|\d+\s*(days?|weeks?|months?)|\d+\s*(steps?|mins?|minutes?))\b/i;

export const clarityRule: AuditRule = {
  id: "clarity",
  run: (ctx) => {
    const text = ctx.input.trim();
    if (!text) return [];

    if (vagueWords.test(text) && !numbersHint.test(text)) {
      return [
        {
          id: "clarity",
          title: "Clarity",
          severity: "Medium",
          detail:
            "The promise feels broad or vague, so the reader may not instantly understand the outcome.",
          suggestion:
            "Make the outcome specific (number/time/steps) and tighten the first sentence so the core idea lands fast.",
        },
      ];
    }
    return [];
  },
};

export const specificityRule: AuditRule = {
  id: "specificity",
  run: (ctx) => {
    const text = ctx.input.trim();
    if (!text) return [];

    // crude heuristic: very short or very generic
    const tooGeneric = text.length < 80 && !numbersHint.test(text);
    if (tooGeneric) {
      return [
        {
          id: "specificity",
          title: "Specificity",
          severity: "Medium",
          detail:
            "The message is short and may feel generic; it doesn’t communicate concrete value fast enough.",
          suggestion:
            "Add scope + constraint (who it’s for / what it replaces / what changes) and include a measurable outcome.",
        },
      ];
    }
    return [];
  },
};

export const proofRule: AuditRule = {
  id: "proof",
  run: (ctx) => {
    const text = ctx.input.trim();
    if (!text) return [];

    if (/\b(best|#1|leading|guaranteed|instant|skyrocket)\b/i.test(text)) {
      return [
        {
          id: "proof",
          title: "Proof",
          severity: "High",
          detail: "There’s a strong claim without a supporting proof point.",
          suggestion:
            "Either add a proof line (metric/case/benchmark) or soften the claim to stay credible and compliant.",
        },
      ];
    }
    return [];
  },
};

export const ctaRule: AuditRule = {
  id: "cta",
  run: (ctx) => {
    const text = ctx.input.trim();
    if (!text) return [];

    if (weakCTA.test(text) && !/\b(book|schedule|try|run|audit|download)\b/i.test(text)) {
      return [
        {
          id: "cta",
          title: "CTA",
          severity: "Low",
          detail: "The next step is present but could be more explicit and lower-friction.",
          suggestion:
            "Replace with a concrete action: “Run a 30-second audit”, “Get 3 rewrite options”, “See a sample report”.",
        },
      ];
    }
    return [];
  },
};

export const complianceRule: AuditRule = {
  id: "compliance",
  run: (ctx) => {
    const text = ctx.input.trim();
    if (!text) return [];

    if (/\b(guarantee|100%|no\s*risk|instantly)\b/i.test(text)) {
      return [
        {
          id: "compliance",
          title: "Compliance",
          severity: "High",
          detail: "Wording suggests an absolute guarantee or unrealistic certainty.",
          suggestion:
            "Replace absolutes with supportable language: “designed to”, “helps”, “can improve”, and add context or proof.",
        },
      ];
    }
    return [];
  },
};