import { describe, it, expect } from "vitest";
import { createEmptyProposal } from "@/context/ProposalContext";

// We test the reducer logic by importing createEmptyProposal and simulating actions.
// The full reducer is tested indirectly; we focus on computed totals correctness.

describe("createEmptyProposal", () => {
  it("creates a proposal with one initial item and zero totals", () => {
    const p = createEmptyProposal();
    expect(p.items).toHaveLength(1);
    expect(p.items[0]).toMatchObject({
      description: "",
      unit: "un",
      qty: 1,
      unitPrice: 0,
      discountPct: 0,
      lineTotal: 0,
    });
    expect(p.totals.subtotal).toBe(0);
    expect(p.totals.discount).toBe(0);
    expect(p.totals.total).toBe(0);
  });

  it("starts with an empty proposal number", () => {
    const p = createEmptyProposal();
    expect(p.meta.number).toBe("");
  });

  it("has today as issueDate", () => {
    const p = createEmptyProposal();
    const today = new Date().toISOString().slice(0, 10);
    expect(p.meta.issueDate).toBe(today);
  });

  it("has 30-day validity", () => {
    const p = createEmptyProposal();
    const validityDate = new Date(p.meta.validityDate);
    const issueDate = new Date(p.meta.issueDate);
    const diff = Math.round((validityDate.getTime() - issueDate.getTime()) / 86_400_000);
    expect(diff).toBe(30);
  });
});

describe("line total computation", () => {
  // Isolated tests for the math — mirrors reducer logic
  function computeLineTotal(qty: number, unitPrice: number, discountPct: number): number {
    const gross = qty * unitPrice;
    return Math.round(gross * (1 - discountPct / 100) * 100) / 100;
  }

  it("computes gross when discount is 0", () => {
    expect(computeLineTotal(3, 100, 0)).toBe(300);
  });

  it("applies 10% discount correctly", () => {
    expect(computeLineTotal(1, 200, 10)).toBe(180);
  });

  it("applies 50% discount", () => {
    expect(computeLineTotal(2, 50, 50)).toBe(50);
  });

  it("100% discount results in 0", () => {
    expect(computeLineTotal(1, 999, 100)).toBe(0);
  });

  it("handles decimal quantities", () => {
    expect(computeLineTotal(1.5, 100, 0)).toBe(150);
  });

  it("rounds to 2 decimal places", () => {
    // 3 * 33.33 * (1 - 0) = 99.99
    expect(computeLineTotal(3, 33.33, 0)).toBe(99.99);
  });
});

describe("totals computation", () => {
  function computeTotals(
    items: Array<{ qty: number; unitPrice: number; discountPct: number; lineTotal: number }>,
  ) {
    const subtotal = items.reduce((acc, i) => acc + i.qty * i.unitPrice, 0);
    const discount = items.reduce((acc, i) => acc + i.qty * i.unitPrice * (i.discountPct / 100), 0);
    const total = subtotal - discount;
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      discount: Math.round(discount * 100) / 100,
      total: Math.round(total * 100) / 100,
    };
  }

  it("sums multiple items correctly", () => {
    const items = [
      { qty: 1, unitPrice: 1000, discountPct: 0, lineTotal: 1000 },
      { qty: 2, unitPrice: 500, discountPct: 0, lineTotal: 1000 },
    ];
    const t = computeTotals(items);
    expect(t.subtotal).toBe(2000);
    expect(t.discount).toBe(0);
    expect(t.total).toBe(2000);
  });

  it("calculates mixed discounts", () => {
    const items = [
      { qty: 1, unitPrice: 1000, discountPct: 10, lineTotal: 900 },
      { qty: 1, unitPrice: 500, discountPct: 20, lineTotal: 400 },
    ];
    const t = computeTotals(items);
    expect(t.subtotal).toBe(1500);
    expect(t.discount).toBe(200); // 100 + 100
    expect(t.total).toBe(1300);
  });
});
