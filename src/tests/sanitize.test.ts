import { describe, it, expect } from "vitest";
import {
  onlyDigits,
  maskCPFCNPJ,
  maskPhone,
  maskCEP,
  maskBRDate,
  isValidBRDate,
  brToISO,
  isoToBR,
  formatBRL,
  parseBRL,
  safeUrl,
  normSingleLine,
  normMultiline,
  generateProposalNumber,
  daysUntil,
} from "@/utils/sanitize";

describe("onlyDigits", () => {
  it("strips non-digits", () => expect(onlyDigits("123.456/0001-99")).toBe("123456000199"));
  it("handles empty string", () => expect(onlyDigits("")).toBe(""));
  it("handles already-digit string", () => expect(onlyDigits("12345")).toBe("12345"));
});

describe("maskCPFCNPJ", () => {
  it("masks CPF correctly", () => {
    expect(maskCPFCNPJ("12345678901")).toBe("123.456.789-01");
  });
  it("masks CNPJ correctly", () => {
    expect(maskCPFCNPJ("12345678000199")).toBe("12.345.678/0001-99");
  });
  it("handles partial input", () => {
    expect(maskCPFCNPJ("123")).toBe("123");
    expect(maskCPFCNPJ("12345")).toBe("123.45");
  });
});

describe("maskPhone", () => {
  it("formats mobile number (11 digits)", () => {
    expect(maskPhone("11987654321")).toBe("(11) 98765-4321");
  });
  it("formats landline (10 digits)", () => {
    expect(maskPhone("1133334444")).toBe("(11) 3333-4444");
  });
  it("handles partial input", () => {
    expect(maskPhone("11")).toBe("11");
    expect(maskPhone("1198")).toBe("(11) 98");
  });
});

describe("maskCEP", () => {
  it("formats CEP", () => expect(maskCEP("30130010")).toBe("30130-010"));
  it("handles partial", () => expect(maskCEP("30130")).toBe("30130"));
});

describe("maskBRDate", () => {
  it("formats date progressively", () => {
    expect(maskBRDate("01")).toBe("01");
    expect(maskBRDate("0101")).toBe("01/01");
    expect(maskBRDate("01012025")).toBe("01/01/2025");
  });
  it("handles non-digits", () => {
    expect(maskBRDate("01/01/2025")).toBe("01/01/2025");
  });
});

describe("isValidBRDate", () => {
  it("validates a real date", () => expect(isValidBRDate("15/06/2025")).toBe(true));
  it("rejects invalid month", () => expect(isValidBRDate("01/13/2025")).toBe(false));
  it("rejects invalid day", () => expect(isValidBRDate("32/01/2025")).toBe(false));
  it("validates leap year", () => expect(isValidBRDate("29/02/2024")).toBe(true));
  it("rejects non-leap year Feb 29", () => expect(isValidBRDate("29/02/2025")).toBe(false));
});

describe("brToISO / isoToBR", () => {
  it("converts BR to ISO", () => expect(brToISO("15/06/2025")).toBe("2025-06-15"));
  it("converts ISO to BR", () => expect(isoToBR("2025-06-15")).toBe("15/06/2025"));
  it("isoToBR handles empty", () => expect(isoToBR("")).toBe(""));
  it("isoToBR handles undefined", () => expect(isoToBR(undefined)).toBe(""));
});

describe("formatBRL", () => {
  it("formats currency in pt-BR", () => {
    expect(formatBRL(1234.56)).toContain("1.234,56");
    expect(formatBRL(0)).toContain("0,00");
  });
});

describe("parseBRL", () => {
  it("parses pt-BR format", () => expect(parseBRL("1.234,56")).toBe(1234.56));
  it("parses plain number", () => expect(parseBRL("1234.56")).toBe(1234.56));
  it("strips R$ symbol", () => expect(parseBRL("R$ 100,00")).toBe(100));
  it("handles empty", () => expect(parseBRL("")).toBe(0));
  it("rejects negative", () => expect(parseBRL("-50")).toBe(0));
});

describe("safeUrl", () => {
  it("allows https", () => expect(safeUrl("https://pagamento.com")).toBe("https://pagamento.com"));
  it("rejects http", () => expect(safeUrl("http://evil.com")).toBe(""));
  it("rejects javascript:", () => expect(safeUrl("javascript:alert(1)")).toBe(""));
  it("handles empty", () => expect(safeUrl("")).toBe(""));
});

describe("normSingleLine", () => {
  it("collapses multiple spaces", () => expect(normSingleLine("a  b  c")).toBe("a b c"));
  it("removes newlines", () => expect(normSingleLine("a\nb")).toBe("a b"));
  it("respects max length", () => expect(normSingleLine("abc", 2)).toBe("ab"));
  it("removes non-allowed chars", () => expect(normSingleLine("abc<>{}")).toBe("abc"));
});

describe("normMultiline", () => {
  it("preserves newlines", () => expect(normMultiline("a\nb")).toContain("\n"));
  it("normalizes CRLF", () => expect(normMultiline("a\r\nb")).toContain("\n"));
  it("respects max length", () => expect(normMultiline("abcdef", 3)).toBe("abc"));
});

describe("generateProposalNumber", () => {
  it("starts with PS-", () => expect(generateProposalNumber()).toMatch(/^PS-\d{8}-\d{3}$/));
  it("generates unique values", () => {
    const nums = new Set(Array.from({ length: 10 }, generateProposalNumber));
    expect(nums.size).toBeGreaterThan(1);
  });
});

describe("daysUntil", () => {
  it("returns 0 for today", () => {
    const today = new Date().toISOString().slice(0, 10);
    expect(daysUntil(today)).toBe(0);
  });
  it("returns positive for future date", () => {
    const future = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
    expect(daysUntil(future)).toBe(7);
  });
  it("returns negative for past date", () => {
    const past = new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10);
    expect(daysUntil(past)).toBe(-7);
  });
});
