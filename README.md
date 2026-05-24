# Bias Buster

Bias Buster is an explainable inclusion-audit tool for text that represents people: job descriptions, marketing copy, education content, healthcare messaging, and general workplace communication.

It scans text for bias and exclusion risks, explains why each phrase may be harmful, gives an inclusion score, and generates rewrite variants that are easier to ship.

## What it does

- Audits text across Hiring, Marketing, Education, Healthcare, and General use cases
- Flags gender, age, disability, cultural, socioeconomic, tone, evidence, and accessibility risks
- Shows severity, category, matched phrase, explanation, and inclusive rewrite guidance
- Generates inclusive rewrite variants
- Saves audit and rewrite reports locally in the browser
- Lets reviewers enable or disable rule categories

## Tech stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- Local browser storage

## Run locally

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Product direction

The strongest next step is an AI-assisted review layer that keeps the current explainable rule system as a transparent baseline, then adds contextual rewrites, organization-specific style guides, PDF export, and team review workflows.
