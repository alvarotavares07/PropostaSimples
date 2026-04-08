import { describe, it, expect } from "vitest";
import { validateProposal } from "@/utils/validation";
import { createEmptyProposal } from "@/context/ProposalContext";
import type { ProposalState } from "@/types/proposal";

function makeValidProposal(): ProposalState {
  const base = createEmptyProposal();
  return {
    ...base,
    meta: {
      number: "PS-20250101-001",
      issueDate: "2025-01-01",
      validityDate: "2025-02-01",
      placeAndDate: "BH - MG, 01/01/2025",
    },
    provider: {
      name: "João Prestador MEI",
      cpfCnpj: "123.456.789-09",
      im: "123456",
      email: "joao@exemplo.com",
      phone: "(31) 99999-8888",
      address: {
        cep: "30130-010",
        street: "Rua da Bahia",
        number: "100",
        complement: "",
        district: "Centro",
        city: "Belo Horizonte",
        uf: "MG",
      },
    },
    client: {
      name: "Empresa Cliente Ltda",
      cpfCnpj: "11.222.333/0001-81",
      email: "contato@empresa.com",
      phone: "(31) 3333-4444",
      address: {
        cep: "30140-110",
        street: "Av. Afonso Pena",
        number: "1500",
        district: "Funcionários",
        city: "Belo Horizonte",
        uf: "MG",
      },
    },
    proposal: {
      title: "Desenvolvimento de Website",
      scope: "Criação de website institucional responsivo com até 5 páginas.",
      executionTime: "30 dias úteis",
      payment: "50% no início, 50% na entrega",
      warranty: "90 dias",
      notes: "",
      payLink: "",
      signatures: { providerName: "João Silva", clientName: "Maria Souza" },
    },
    items: [
      {
        id: "item-1",
        description: "Design e desenvolvimento",
        unit: "un",
        qty: 1,
        unitPrice: 5000,
        discountPct: 0,
        lineTotal: 5000,
      },
    ],
    totals: { subtotal: 5000, discount: 0, total: 5000 },
  };
}

describe("validateProposal", () => {
  it("returns valid for a complete proposal", () => {
    const result = validateProposal(makeValidProposal());
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("fails when provider name is missing", () => {
    const p = makeValidProposal();
    p.provider.name = "";
    const result = validateProposal(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === "provider.name")).toBe(true);
  });

  it("fails when client name is missing", () => {
    const p = makeValidProposal();
    p.client.name = "";
    const result = validateProposal(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === "client.name")).toBe(true);
  });

  it("fails when items array is empty", () => {
    const p = makeValidProposal();
    p.items = [];
    const result = validateProposal(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === "items")).toBe(true);
  });

  it("fails when item description is empty", () => {
    const p = makeValidProposal();
    p.items[0].description = "";
    const result = validateProposal(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field.startsWith("items.0"))).toBe(true);
  });

  it("fails when proposal title is missing", () => {
    const p = makeValidProposal();
    p.proposal.title = "";
    const result = validateProposal(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === "proposal.title")).toBe(true);
  });

  it("fails when scope is missing", () => {
    const p = makeValidProposal();
    p.proposal.scope = "";
    const result = validateProposal(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === "proposal.scope")).toBe(true);
  });

  it("fails when payLink is not https", () => {
    const p = makeValidProposal();
    p.proposal.payLink = "http://insecure.com";
    const result = validateProposal(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.field === "proposal.payLink")).toBe(true);
  });

  it("passes when payLink is https", () => {
    const p = makeValidProposal();
    p.proposal.payLink = "https://pagamento.com/link";
    const result = validateProposal(p);
    expect(result.isValid).toBe(true);
  });

  it("accumulates multiple errors", () => {
    const p = createEmptyProposal();
    const result = validateProposal(p);
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(3);
  });
});
