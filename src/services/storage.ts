import type { ProposalState, SavedProposal } from "@/types/proposal";

const STORAGE_VERSION = "1";
const KEYS = {
  draft: `ps_draft_v${STORAGE_VERSION}`,
  proposals: `ps_proposals_v${STORAGE_VERSION}`,
} as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    // QuotaExceededError or SecurityError
    console.warn("[storage] Failed to persist:", e);
    return false;
  }
}

// ─── Draft ───────────────────────────────────────────────────────────────────

export function saveDraft(state: ProposalState): boolean {
  return safeSet(KEYS.draft, state);
}

export function loadDraft(): ProposalState | null {
  return safeGet<ProposalState>(KEYS.draft);
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(KEYS.draft);
  } catch {
    // ignore
  }
}

// ─── Saved Proposals ─────────────────────────────────────────────────────────

export function listProposals(): SavedProposal[] {
  return safeGet<SavedProposal[]>(KEYS.proposals) ?? [];
}

export function saveProposal(state: ProposalState): SavedProposal {
  const proposals = listProposals();
  const entry: SavedProposal = {
    ...state,
    id: crypto.randomUUID(),
    savedAt: new Date().toISOString(),
  };
  proposals.push(entry);
  safeSet(KEYS.proposals, proposals);
  return entry;
}

export function deleteProposal(id: string): void {
  const proposals = listProposals().filter((p) => p.id !== id);
  safeSet(KEYS.proposals, proposals);
}

export function loadProposal(id: string): SavedProposal | null {
  return listProposals().find((p) => p.id === id) ?? null;
}
