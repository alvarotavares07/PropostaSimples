// ─── Sanitize & Format Utilities ─────────────────────────────────────────────
// Single source of truth — no duplication across sanitize.ts / sanitizeSpace.ts

// ─── Character-level normalization ───────────────────────────────────────────

/** Normalize unicode whitespace variants to plain ASCII space/newline */
export function normalizeWhitespace(s: string): string {
  if (!s) return "";
  return s
    .replace(/\u00A0/g, " ") // NBSP (common on mobile)
    .replace(/\u200B/g, "") // zero-width space
    .replace(/\r\n?/g, "\n"); // CRLF → LF
}

const ALNUM_SPACE_RE = /[A-Za-zÀ-ÿ0-9 .,'&\-/]/;

/** Single-line field: preserves accents & space, strips control chars, collapses runs */
export function normSingleLine(s: string, max = 120): string {
  if (!s) return "";
  let t = normalizeWhitespace(s).replace(/[\n\t]+/g, " ");
  t = [...t].filter((ch) => ALNUM_SPACE_RE.test(ch)).join("");
  t = t.replace(/ {2,}/g, " ");
  return t.slice(0, max);
}

/** Multiline field: preserves newlines & unicode, strips invisible control chars */
export function normMultiline(s: string, max = 2000): string {
  if (!s) return "";
  let t = normalizeWhitespace(s).replace(/[^\S\n]+/g, " ");
  // keep: letters, numbers, punctuation, general separators (space), newlines
  t = t.replace(/[^\p{L}\p{N}\p{P}\p{Z}\n]/gu, "");
  return t.slice(0, max).trimEnd();
}

// ─── Digit stripping ─────────────────────────────────────────────────────────

export function onlyDigits(s: string): string {
  if (!s) return "";
  return s.replace(/\D/g, "");
}

// ─── URL ─────────────────────────────────────────────────────────────────────

/** Only allows https:// URLs — never http or javascript: */
export function safeUrl(s: string): string {
  if (!s) return "";
  const t = s.trim();
  return t.startsWith("https://") ? t : "";
}

// ─── Masks ───────────────────────────────────────────────────────────────────

export function maskCPFCNPJ(value: string): string {
  const d = onlyDigits(value);
  if (d.length <= 11) {
    // CPF: 000.000.000-00
    return d
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }
  // CNPJ: 00.000.000/0000-00
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

export function maskPhone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export function maskCEP(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
}

export function maskUF(value: string): string {
  return value.replace(/[^A-Za-z]/g, "").toUpperCase().slice(0, 2);
}

// ─── Date utilities ──────────────────────────────────────────────────────────

/** Progressive mask: DD/MM/AAAA */
export function maskBRDate(raw: string): string {
  const d = onlyDigits(raw).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

export function isValidBRDate(br: string): boolean {
  const m = br.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const dd = +m[1],
    mm = +m[2],
    yy = +m[3];
  if (mm < 1 || mm > 12) return false;
  const leap = yy % 4 === 0 && (yy % 100 !== 0 || yy % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return dd >= 1 && dd <= days[mm - 1];
}

export function brToISO(br: string): string {
  const [d, m, y] = br.split("/");
  return `${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
}

export function isoToBR(iso?: string): string {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

export function daysUntil(isoDate: string): number {
  const [y, m, d] = isoDate.split("-").map(Number);
  const target = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

// ─── Currency ────────────────────────────────────────────────────────────────

export function formatBRL(n: number): string {
  return (n || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

/** Parse user-typed BRL string (handles both "1.234,56" and "1234.56") */
export function parseBRL(input: string): number {
  if (!input) return 0;
  let s = input.toString().replace(/[R$\s]/gi, "").trim();
  // pt-BR format: "1.234,56"
  if (s.includes(",") && !s.includes(".")) s = s.replace(/\./g, "").replace(",", ".");
  // mixed: "1.234,56" already handled; "1,234.56" (US) — strip commas
  if (s.includes(".") && s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  if (!isFinite(n) || n < 0) return 0;
  return Math.round(n * 100) / 100;
}

// ─── Proposal number generator ────────────────────────────────────────────────

export function generateProposalNumber(): string {
  const now = new Date();
  const yyyymmdd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, "0");
  return `PS-${yyyymmdd}-${seq}`;
}
