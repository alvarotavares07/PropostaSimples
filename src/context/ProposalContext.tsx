import React, { createContext, useCallback, useContext, useReducer } from "react";
import type { ProposalState, ProposalItem, SavedProposal } from "@/types/proposal";
import * as storage from "@/services/storage";
import { addDaysToLocalISODate, generateProposalNumber, toLocalISODate } from "@/utils/sanitize";

// ─── Initial State ────────────────────────────────────────────────────────────

function today(): string {
  return toLocalISODate(new Date());
}

function defaultValidity(): string {
  return addDaysToLocalISODate(new Date(), 30);
}

export function createEmptyProposal(): ProposalState {
  const initialItem: ProposalItem = {
    id: crypto.randomUUID(),
    description: "",
    unit: "un",
    qty: 1,
    unitPrice: 0,
    discountPct: 0,
    lineTotal: 0,
  };

  return {
    meta: {
      number: "",
      issueDate: today(),
      validityDate: defaultValidity(),
      placeAndDate: "",
    },
    provider: {
      name: "",
      cpfCnpj: "",
      im: "",
      email: "",
      phone: "",
      address: { cep: "", street: "", number: "", complement: "", district: "", city: "", uf: "" },
    },
    client: {
      name: "",
      cpfCnpj: "",
      email: "",
      phone: "",
      address: { cep: "", street: "", number: "", complement: "", district: "", city: "", uf: "" },
    },
    proposal: {
      title: "",
      scope: "",
      executionTime: "",
      payment: "",
      warranty: "",
      notes: "",
      payLink: "",
      signatures: { clientName: "", providerName: "" },
    },
    items: [initialItem],
    totals: { subtotal: 0, discount: 0, total: 0 },
  };
}

// ─── Totals computation ───────────────────────────────────────────────────────

function computeLineTotal(item: Pick<ProposalItem, "qty" | "unitPrice" | "discountPct">): number {
  const gross = item.qty * item.unitPrice;
  return Math.round(gross * (1 - item.discountPct / 100) * 100) / 100;
}

function computeTotals(items: ProposalItem[]) {
  const subtotal = items.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
  const discount = items.reduce((acc, i) => acc + i.qty * i.unitPrice * (i.discountPct / 100), 0);
  const total = subtotal - discount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    discount: Math.round(discount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// ─── Reducer ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "SET_META"; payload: Partial<ProposalState["meta"]> }
  | { type: "SET_PROVIDER"; payload: Partial<ProposalState["provider"]> }
  | { type: "SET_CLIENT"; payload: Partial<ProposalState["client"]> }
  | { type: "SET_PROPOSAL"; payload: Partial<ProposalState["proposal"]> }
  | { type: "ADD_ITEM" }
  | { type: "UPDATE_ITEM"; id: string; payload: Partial<ProposalItem> }
  | { type: "REMOVE_ITEM"; id: string }
  | { type: "REORDER_ITEMS"; items: ProposalItem[] }
  | { type: "RESET" }
  | { type: "LOAD"; payload: ProposalState };

function reducer(state: ProposalState, action: Action): ProposalState {
  switch (action.type) {
    case "SET_META":
      return { ...state, meta: { ...state.meta, ...action.payload } };

    case "SET_PROVIDER":
      return { ...state, provider: { ...state.provider, ...action.payload } };

    case "SET_CLIENT":
      return { ...state, client: { ...state.client, ...action.payload } };

    case "SET_PROPOSAL":
      return { ...state, proposal: { ...state.proposal, ...action.payload } };

    case "ADD_ITEM": {
      const newItem: ProposalItem = {
        id: crypto.randomUUID(),
        description: "",
        unit: "un",
        qty: 1,
        unitPrice: 0,
        discountPct: 0,
        lineTotal: 0,
      };
      const items = [...state.items, newItem];
      return { ...state, items, totals: computeTotals(items) };
    }

    case "UPDATE_ITEM": {
      const items = state.items.map((item) => {
        if (item.id !== action.id) return item;
        const updated = { ...item, ...action.payload };
        updated.lineTotal = computeLineTotal(updated);
        return updated;
      });
      return { ...state, items, totals: computeTotals(items) };
    }

    case "REMOVE_ITEM": {
      const items = state.items.filter((i) => i.id !== action.id);
      return { ...state, items, totals: computeTotals(items) };
    }

    case "REORDER_ITEMS": {
      const items = action.items.map((i) => ({ ...i, lineTotal: computeLineTotal(i) }));
      return { ...state, items, totals: computeTotals(items) };
    }

    case "RESET":
      return createEmptyProposal();

    case "LOAD":
      return action.payload;

    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface ProposalContextValue {
  proposal: ProposalState;
  dispatch: React.Dispatch<Action>;
  // convenience actions
  resetProposal: () => void;
  saveProposal: () => SavedProposal;
  saveDraft: () => void;
  loadProposal: (id: string) => void;
  savedProposals: SavedProposal[];
  refreshSaved: () => void;
  deleteSavedProposal: (id: string) => void;
}

const ProposalContext = createContext<ProposalContextValue | null>(null);

export function ProposalProvider({ children }: { children: React.ReactNode }) {
  const [proposal, dispatch] = useReducer(
    reducer,
    undefined,
    () => storage.loadDraft() ?? createEmptyProposal(),
  );

  const [savedProposals, setSavedProposals] = React.useState<SavedProposal[]>(() =>
    storage.listProposals(),
  );

  const refreshSaved = useCallback(() => {
    setSavedProposals(storage.listProposals());
  }, []);

  const resetProposal = useCallback(() => {
    storage.clearDraft();
    storage.clearProposals();
    setSavedProposals([]);
    dispatch({ type: "RESET" });
  }, []);

  const saveDraftFn = useCallback(() => {
    storage.saveDraft(proposal);
  }, [proposal]);

  const saveProposalFn = useCallback((): SavedProposal => {
    const number = proposal.meta.number.trim() || generateProposalNumber();
    const normalizedProposal =
      number === proposal.meta.number
        ? proposal
        : { ...proposal, meta: { ...proposal.meta, number } };

    const saved = storage.saveProposal(normalizedProposal);
    if (number !== proposal.meta.number) {
      dispatch({ type: "SET_META", payload: { number } });
    }
    storage.clearDraft();
    refreshSaved();
    return saved;
  }, [proposal, refreshSaved]);

  const loadProposalFn = useCallback((id: string) => {
    const p = storage.loadProposal(id);
    if (p) {
      dispatch({ type: "LOAD", payload: p });
      storage.saveDraft(p);
    }
  }, []);

  const deleteSavedProposal = useCallback(
    (id: string) => {
      storage.deleteProposal(id);
      refreshSaved();
    },
    [refreshSaved],
  );

  // Auto-save draft on every change
  React.useEffect(() => {
    storage.saveDraft(proposal);
  }, [proposal]);

  const value: ProposalContextValue = {
    proposal,
    dispatch,
    resetProposal,
    saveProposal: saveProposalFn,
    saveDraft: saveDraftFn,
    loadProposal: loadProposalFn,
    savedProposals,
    refreshSaved,
    deleteSavedProposal,
  };

  return <ProposalContext.Provider value={value}>{children}</ProposalContext.Provider>;
}

export function useProposal(): ProposalContextValue {
  const ctx = useContext(ProposalContext);
  if (!ctx) throw new Error("useProposal must be used within <ProposalProvider>");
  return ctx;
}
