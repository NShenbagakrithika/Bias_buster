// src/core/factory/auditPipelineFactory.ts

import type { AuditRule } from "../chain/auditChain";
import {
  accessibilityRule,
  ageBiasRule,
  culturalBiasRule,
  disabilityBiasRule,
  evidenceRule,
  genderBiasRule,
  socioeconomicBiasRule,
  toneBiasRule,
} from "../chain/auditChain";
import { RulesRegistry } from "../singleton/RulesRegistry";

export type ContentType = "Hiring" | "Marketing" | "Education" | "Healthcare" | "General";

function hiringPipeline(): AuditRule[] {
  return [
    genderBiasRule,
    ageBiasRule,
    disabilityBiasRule,
    culturalBiasRule,
    socioeconomicBiasRule,
    toneBiasRule,
    accessibilityRule,
  ];
}

function marketingPipeline(): AuditRule[] {
  return [
    culturalBiasRule,
    disabilityBiasRule,
    socioeconomicBiasRule,
    toneBiasRule,
    evidenceRule,
    accessibilityRule,
  ];
}

function educationPipeline(): AuditRule[] {
  return [
    genderBiasRule,
    ageBiasRule,
    disabilityBiasRule,
    culturalBiasRule,
    socioeconomicBiasRule,
    accessibilityRule,
  ];
}

function healthcarePipeline(): AuditRule[] {
  return [
    disabilityBiasRule,
    culturalBiasRule,
    socioeconomicBiasRule,
    evidenceRule,
    accessibilityRule,
  ];
}

function generalPipeline(): AuditRule[] {
  return [
    genderBiasRule,
    ageBiasRule,
    disabilityBiasRule,
    culturalBiasRule,
    socioeconomicBiasRule,
    toneBiasRule,
    evidenceRule,
    accessibilityRule,
  ];
}

export function createAuditPipeline(contentType: ContentType): AuditRule[] {
  switch (contentType) {
    case "Hiring":
      return hiringPipeline();
    case "Marketing":
      return marketingPipeline();
    case "Education":
      return educationPipeline();
    case "Healthcare":
      return healthcarePipeline();
    default:
      return generalPipeline();
  }
}

export function createAuditPipelineFromRegistry(contentType: ContentType): AuditRule[] {
  const chain = createAuditPipeline(contentType);
  const registry = RulesRegistry.getInstance();
  return chain.filter((r) => registry.isEnabled(r.id));
}
