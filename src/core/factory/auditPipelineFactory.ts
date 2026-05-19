// src/core/factory/auditPipelineFactory.ts

import type { AuditRule } from "../chain/auditChain";
import {
  clarityRule,
  specificityRule,
  proofRule,
  ctaRule,
  complianceRule,
} from "../chain/auditChain";
import { RulesRegistry } from "../singleton/RulesRegistry";

/**
 * Factory Pattern:
 * Creates different pipelines (chains) depending on the selected Content Type.
 * The caller doesn't manually assemble rules — it asks the factory.
 */

export type ContentType = "Ad" | "Landing Page" | "Email" | "Generic";

function basePipeline(): AuditRule[] {
  return [clarityRule, proofRule, ctaRule, complianceRule];
}

function adPipeline(): AuditRule[] {
  // Ads usually need proof + clarity + CTA, keep it tight
  return [clarityRule, proofRule, ctaRule, complianceRule];
}

function landingPipeline(): AuditRule[] {
  // Landing pages often need more specificity
  return [clarityRule, specificityRule, proofRule, ctaRule, complianceRule];
}

function emailPipeline(): AuditRule[] {
  // Emails: clarity + CTA + compliance, proof optional but useful
  return [clarityRule, ctaRule, proofRule, complianceRule];
}

export function createAuditPipeline(contentType: ContentType): AuditRule[] {
  switch (contentType) {
    case "Ad":
      return adPipeline();
    case "Landing Page":
      return landingPipeline();
    case "Email":
      return emailPipeline();
    default:
      return basePipeline();
  }
}

/**
 * Convenience helper: apply RulesRegistry (Singleton) toggles so the chain
 * respects enabled/disabled rules globally.
 */
export function createAuditPipelineFromRegistry(contentType: ContentType): AuditRule[] {
  const chain = createAuditPipeline(contentType);
  const registry = RulesRegistry.getInstance();
  return chain.filter((r) => registry.isEnabled(r.id));
}