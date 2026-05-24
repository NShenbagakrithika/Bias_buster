import { historyStore, type HistoryItem } from "../observer/HistoryStore";
import { RulesRegistry } from "../singleton/RulesRegistry";
import { runAuditChain, summarizeFindings, type Finding } from "../chain/auditChain";
import {
  createAuditPipelineFromRegistry,
  type ContentType,
} from "../factory/auditPipelineFactory";
import { generateRewriteVariants, type Tone, type Variant } from "../strategy/rewriteStrategies";

/**
 * Facade Pattern:
 * WorkspaceFacade exposes a simple API for the Workspace page (and other pages if needed),
 * hiding the complexity of multiple subsystems:
 * - Observer (historyStore)
 * - Singleton (RulesRegistry)
 * - Factory (createAuditPipelineFromRegistry)
 * - Chain of Responsibility (runAuditChain)
 * - Strategy (generateRewriteVariants)
 */
export class WorkspaceFacade {
  private static instance: WorkspaceFacade | null = null;

  private constructor() {}

  static getInstance() {
    if (!WorkspaceFacade.instance) {
      WorkspaceFacade.instance = new WorkspaceFacade();
    }
    return WorkspaceFacade.instance;
  }

  // ---- Usage / Reports (Observer) ----
  getUsageLimit() {
    return 20;
  }

  getAllReports(): HistoryItem[] {
    return historyStore.getAll();
  }

  getRecentReports(max = 5): HistoryItem[] {
    return historyStore.getAll().slice(0, max);
  }

  subscribeReports(onChange: (items: HistoryItem[]) => void) {
    return historyStore.subscribe(onChange);
  }

  clearReports() {
    historyStore.clear();
  }

  // ---- Rules (Singleton) ----
  isRuleEnabled(ruleId: string) {
    return RulesRegistry.getInstance().isEnabled(ruleId);
  }

  setRuleEnabled(ruleId: string, enabled: boolean) {
    return RulesRegistry.getInstance().set(ruleId, enabled);
  }

  // ---- Audit (Factory + Chain) ----
  runAudit(params: { input: string; contentType: ContentType; mode: string }): Finding[] {
    const chain = createAuditPipelineFromRegistry(params.contentType);
    return runAuditChain(chain, {
      input: params.input,
      contentType: params.contentType,
      mode: params.mode,
    });
  }

  saveAuditToReports(params: {
    input: string;
    contentType: ContentType;
    mode: string;
    findings?: Finding[];
  }) {
    const findings = params.findings ?? this.runAudit(params);
    historyStore.add({
      kind: "audit",
      input: params.input,
      meta: { contentType: params.contentType, mode: params.mode },
      output: { findings, summary: summarizeFindings(findings) },
    });
  }

  // ---- Rewrite (Strategy) ----
  generateRewrites(tone: Tone, input: string): Variant[] {
    return generateRewriteVariants(tone, input);
  }

  saveRewriteToReports(params: { input: string; tone: Tone }) {
    const variants = this.generateRewrites(params.tone, params.input);
    historyStore.add({
      kind: "rewrite",
      input: params.input,
      meta: { tone: params.tone },
      output: { variants },
    });
  }
}

// Export singleton instance for convenience
export const workspaceFacade = WorkspaceFacade.getInstance();
