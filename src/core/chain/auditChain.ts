// src/core/chain/auditChain.ts

export type Severity = "High" | "Medium" | "Low";

export type BiasCategory =
  | "Gender"
  | "Age"
  | "Disability"
  | "Culture"
  | "Socioeconomic"
  | "Tone"
  | "Evidence"
  | "Accessibility";

export type Finding = {
  id: string;
  title: string;
  category: BiasCategory;
  detail: string;
  suggestion: string;
  inclusiveRewrite: string;
  severity: Severity;
  matchedText?: string;
};

export type AuditContext = {
  input: string;
  contentType: string;
  mode: string;
};

export type AuditSummary = {
  score: number;
  level: "Low risk" | "Moderate risk" | "High risk";
  headline: string;
  categories: Record<BiasCategory, number>;
};

export interface AuditRule {
  id: string;
  run(ctx: AuditContext): Finding[];
}

export function runAuditChain(chain: AuditRule[], ctx: AuditContext): Finding[] {
  const findings: Finding[] = [];

  for (const rule of chain) {
    const next = rule.run(ctx);
    if (next.length) findings.push(...next);
  }

  return findings;
}

export function summarizeFindings(findings: Finding[]): AuditSummary {
  const weights: Record<Severity, number> = { High: 28, Medium: 16, Low: 8 };
  const penalty = findings.reduce((sum, finding) => sum + weights[finding.severity], 0);
  const score = Math.max(0, Math.min(100, 100 - penalty));
  const level = score >= 78 ? "Low risk" : score >= 50 ? "Moderate risk" : "High risk";

  const categories = findings.reduce((acc, finding) => {
    acc[finding.category] = (acc[finding.category] ?? 0) + 1;
    return acc;
  }, {} as Record<BiasCategory, number>);

  return {
    score,
    level,
    categories,
    headline:
      findings.length === 0
        ? "No obvious inclusion risks found."
        : `${findings.length} inclusion ${findings.length === 1 ? "risk" : "risks"} found.`,
  };
}

function matchFirst(text: string, pattern: RegExp) {
  return text.match(pattern)?.[0];
}

const genderedTerms =
  /\b(rockstar|ninja|guru|chairman|manpower|salesman|guys|maternity leave only|he\/she|he or she)\b/i;
const ageTerms =
  /\b(young|digital native|recent graduate|energetic graduate|native speaker|mature candidate|overqualified|fresh blood)\b/i;
const disabilityTerms =
  /\b(crazy|insane|lame|blind spot|tone deaf|sanity check|able-bodied|walk-in only)\b/i;
const cultureTerms =
  /\b(native english|native speaker|culture fit|strong english accent|articulate for|clean-cut|professional hair)\b/i;
const socioeconomicTerms =
  /\b(elite school|top-tier university|ivy league|must own|reliable car required|no gaps|polished background)\b/i;
const aggressiveTerms =
  /\b(crush|dominate|destroy|killer|war room|aggressive|relentless|whatever it takes)\b/i;
const absoluteClaims =
  /\b(guaranteed|100%|no risk|instantly|always|never|best|#1|world-class|revolutionary)\b/i;
const accessibilityTerms =
  /\b(click here|see below|obviously|just|simple|easy for everyone|normal users)\b/i;

export const genderBiasRule: AuditRule = {
  id: "gender",
  run: (ctx) => {
    const matchedText = matchFirst(ctx.input, genderedTerms);
    if (!matchedText) return [];

    return [
      {
        id: "gender",
        title: "Gender-coded language",
        category: "Gender",
        severity: "High",
        matchedText,
        detail:
          "This wording can signal a narrow gender expectation or make the audience feel implicitly excluded.",
        suggestion:
          "Use role-neutral language and describe the actual behavior, skill, or responsibility you need.",
        inclusiveRewrite:
          "Replace terms like rockstar, ninja, chairman, or manpower with precise alternatives such as specialist, lead, chair, team, or workforce.",
      },
    ];
  },
};

export const ageBiasRule: AuditRule = {
  id: "age",
  run: (ctx) => {
    const matchedText = matchFirst(ctx.input, ageTerms);
    if (!matchedText) return [];

    return [
      {
        id: "age",
        title: "Age-coded requirement",
        category: "Age",
        severity: "High",
        matchedText,
        detail:
          "This phrase can imply preference for a certain age group instead of focusing on the capability required.",
        suggestion:
          "Describe the experience, adaptability, or tool fluency directly without age signals.",
        inclusiveRewrite:
          "Replace age-coded language with measurable requirements, such as experience with the tool, ability to learn quickly, or comfort working in a fast-moving team.",
      },
    ];
  },
};

export const disabilityBiasRule: AuditRule = {
  id: "disability",
  run: (ctx) => {
    const matchedText = matchFirst(ctx.input, disabilityTerms);
    if (!matchedText) return [];

    return [
      {
        id: "disability",
        title: "Ableist or stigmatizing phrase",
        category: "Disability",
        severity: "High",
        matchedText,
        detail:
          "This wording can casually associate disability or mental health language with incompetence or negativity.",
        suggestion:
          "Use plain, specific language for the issue instead of metaphors tied to disability or mental health.",
        inclusiveRewrite:
          "Replace phrases like crazy, insane, lame, sanity check, or blind spot with specific alternatives such as surprising, unreasonable, ineffective, review, or missed risk.",
      },
    ];
  },
};

export const culturalBiasRule: AuditRule = {
  id: "culture",
  run: (ctx) => {
    const matchedText = matchFirst(ctx.input, cultureTerms);
    if (!matchedText) return [];

    return [
      {
        id: "culture",
        title: "Cultural or language gatekeeping",
        category: "Culture",
        severity: "Medium",
        matchedText,
        detail:
          "This wording may favor a narrow cultural background or communication style unrelated to the real outcome.",
        suggestion:
          "Name the communication requirement directly and avoid identity-coded shortcuts.",
        inclusiveRewrite:
          "Replace culture fit or native speaker requirements with clear criteria, such as communicates clearly with customers in English or collaborates well across teams.",
      },
    ];
  },
};

export const socioeconomicBiasRule: AuditRule = {
  id: "socioeconomic",
  run: (ctx) => {
    const matchedText = matchFirst(ctx.input, socioeconomicTerms);
    if (!matchedText) return [];

    return [
      {
        id: "socioeconomic",
        title: "Socioeconomic filter",
        category: "Socioeconomic",
        severity: "Medium",
        matchedText,
        detail:
          "This phrase can screen for access, background, or privilege instead of ability to perform the work.",
        suggestion:
          "Focus on demonstrated skills, outcomes, or constraints that are truly required.",
        inclusiveRewrite:
          "Replace pedigree-based requirements with evidence-based criteria, such as portfolio, work samples, certifications, or equivalent practical experience.",
      },
    ];
  },
};

export const toneBiasRule: AuditRule = {
  id: "tone",
  run: (ctx) => {
    const matchedText = matchFirst(ctx.input, aggressiveTerms);
    if (!matchedText) return [];

    return [
      {
        id: "tone",
        title: "Aggressive tone signal",
        category: "Tone",
        severity: ctx.mode === "Hiring" ? "Medium" : "Low",
        matchedText,
        detail:
          "Combative language can repel qualified people who do not identify with high-pressure or exclusionary workplace cues.",
        suggestion:
          "Use confident but specific language that describes pace, ownership, and standards without intimidation.",
        inclusiveRewrite:
          "Replace crush, dominate, or killer with outcome-focused terms such as improve, lead, solve, grow, or deliver.",
      },
    ];
  },
};

export const evidenceRule: AuditRule = {
  id: "evidence",
  run: (ctx) => {
    const matchedText = matchFirst(ctx.input, absoluteClaims);
    if (!matchedText) return [];

    return [
      {
        id: "evidence",
        title: "Unsupported absolute claim",
        category: "Evidence",
        severity: "Medium",
        matchedText,
        detail:
          "Absolute claims can create trust and compliance risk unless they are backed by clear evidence.",
        suggestion:
          "Add a proof point, narrow the claim, or use supportable language.",
        inclusiveRewrite:
          "Replace guaranteed or best with evidence-based wording such as designed to help, based on customer results, or improved by a measured percentage.",
      },
    ];
  },
};

export const accessibilityRule: AuditRule = {
  id: "accessibility",
  run: (ctx) => {
    const matchedText = matchFirst(ctx.input, accessibilityTerms);
    if (!matchedText) return [];

    return [
      {
        id: "accessibility",
        title: "Accessibility clarity risk",
        category: "Accessibility",
        severity: "Low",
        matchedText,
        detail:
          "This phrase can be unclear for screen-reader users, new users, or people who do not share the same context.",
        suggestion:
          "Make the action or expectation explicit and avoid assuming what is obvious or easy.",
        inclusiveRewrite:
          "Replace click here or see below with descriptive action text, such as download the report, review the pricing table, or open the application form.",
      },
    ];
  },
};
