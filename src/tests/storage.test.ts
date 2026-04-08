import { describe, it, expect, beforeEach, vi } from "vitest";
import { createEmptyProposal } from "@/context/ProposalContext";

// ─── localStorage mock ───────────────────────────────────────────────────────

const store: Record<string, string> = {};

const localStorageMock = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]); }),
  get length() { return Object.keys(store).length; },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
};

vi.stubGlobal("localStorage", localStorageMock);
vi.stubGlobal("crypto", { randomUUID: () => "test-uuid-" + Math.random().toString(36).slice(2) });

// ─── Import after mocks ───────────────────────────────────────────────────────

const { saveDraft, loadDraft, clearDraft, saveProposal, listProposals, deleteProposal, loadProposal } =
  await import("@/services/storage");

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("storage service", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  describe("draft", () => {
    it("saves and loads draft", () => {
      const proposal = createEmptyProposal();
      proposal.provider.name = "Test Provider";
      saveDraft(proposal);
      const loaded = loadDraft();
      expect(loaded?.provider.name).toBe("Test Provider");
    });

    it("returns null when no draft exists", () => {
      expect(loadDraft()).toBeNull();
    });

    it("clears draft", () => {
      saveDraft(createEmptyProposal());
      clearDraft();
      expect(loadDraft()).toBeNull();
    });
  });

  describe("proposals", () => {
    it("starts with empty list", () => {
      expect(listProposals()).toEqual([]);
    });

    it("saves a proposal and lists it", () => {
      const p = createEmptyProposal();
      p.meta.number = "PS-20250101-001";
      saveProposal(p);
      const list = listProposals();
      expect(list).toHaveLength(1);
      expect(list[0].meta.number).toBe("PS-20250101-001");
      expect(list[0].id).toBeTruthy();
      expect(list[0].savedAt).toBeTruthy();
    });

    it("accumulates multiple proposals", () => {
      saveProposal(createEmptyProposal());
      saveProposal(createEmptyProposal());
      expect(listProposals()).toHaveLength(2);
    });

    it("loads a specific proposal by id", () => {
      const saved = saveProposal(createEmptyProposal());
      const loaded = loadProposal(saved.id);
      expect(loaded?.id).toBe(saved.id);
    });

    it("returns null for unknown id", () => {
      expect(loadProposal("non-existent-id")).toBeNull();
    });

    it("deletes a proposal", () => {
      const saved = saveProposal(createEmptyProposal());
      deleteProposal(saved.id);
      expect(listProposals()).toHaveLength(0);
    });

    it("deletes only the target proposal", () => {
      const s1 = saveProposal(createEmptyProposal());
      saveProposal(createEmptyProposal());
      deleteProposal(s1.id);
      const list = listProposals();
      expect(list).toHaveLength(1);
      expect(list[0].id).not.toBe(s1.id);
    });
  });
});
