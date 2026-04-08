// ─── Domain Types ─────────────────────────────────────────────────────────────

export interface ProposalMeta {
  number: string; // PS-YYYYMMDD-NNN
  issueDate: string; // ISO yyyy-mm-dd
  validityDate: string; // ISO yyyy-mm-dd
  placeAndDate: string; // "São Paulo - SP, 21/09/2025"
}

export interface Address {
  cep: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  uf: string;
}

export interface Provider {
  name: string;
  cpfCnpj: string;
  im: string; // Inscrição Municipal
  email: string;
  phone: string;
  address: Address;
}

export interface Client {
  name: string;
  cpfCnpj: string;
  email?: string;
  phone?: string;
  address: Address;
}

export interface ProposalItem {
  id: string;
  description: string;
  unit?: string;
  qty: number;
  unitPrice: number;
  discountPct: number; // 0–100
  lineTotal: number; // computed: qty * unitPrice * (1 - discountPct/100)
}

export interface ProposalTotals {
  subtotal: number;
  discount: number;
  total: number;
}

export interface ProposalDetails {
  title: string;
  scope: string; // multiline
  executionTime: string;
  payment: string;
  warranty?: string;
  notes?: string;
  payLink?: string; // must be https://
  signatures: {
    clientName?: string;
    providerName?: string;
  };
}

export interface ProposalState {
  meta: ProposalMeta;
  provider: Provider;
  client: Client;
  proposal: ProposalDetails;
  items: ProposalItem[];
  totals: ProposalTotals;
}

export interface SavedProposal extends ProposalState {
  id: string;
  savedAt: string; // ISO datetime
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
}
