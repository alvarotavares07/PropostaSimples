import { z } from "zod";
import { onlyDigits, safeUrl } from "@/utils/sanitize";

// ─── Primitives ───────────────────────────────────────────────────────────────

const requiredStr = (label: string) => z.string().min(1, `${label} é obrigatório`).max(200);

const optionalStr = (max = 200) => z.string().max(max).optional();

// ─── CPF / CNPJ ──────────────────────────────────────────────────────────────

function validCPF(digits: string): boolean {
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +digits[i] * (10 - i);
  let r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  if (r !== +digits[9]) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += +digits[i] * (11 - i);
  r = (sum * 10) % 11;
  if (r === 10 || r === 11) r = 0;
  return r === +digits[10];
}

function validCNPJ(digits: string): boolean {
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;
  const calc = (d: string, weights: number[]) => {
    const sum = weights.reduce((acc, w, i) => acc + +d[i] * w, 0);
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  const d1 = calc(digits, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (d1 !== +digits[12]) return false;
  const d2 = calc(digits, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return d2 === +digits[13];
}

const cpfCnpjSchema = z
  .string()
  .min(1, "CPF/CNPJ é obrigatório")
  .refine((v) => {
    const d = onlyDigits(v);
    return d.length === 11 || d.length === 14;
  }, "CPF deve ter 11 dígitos ou CNPJ 14 dígitos")
  .refine((v) => {
    const d = onlyDigits(v);
    return d.length === 11 ? validCPF(d) : validCNPJ(d);
  }, "CPF ou CNPJ inválido");

// ─── Address ─────────────────────────────────────────────────────────────────

const addressSchema = z.object({
  cep: z
    .string()
    .min(1, "CEP é obrigatório")
    .refine((v) => onlyDigits(v).length === 8, "CEP deve ter 8 dígitos"),
  street: requiredStr("Logradouro"),
  number: z.string().min(1, "Número é obrigatório").max(10),
  complement: z.string().max(60).optional(),
  district: requiredStr("Bairro"),
  city: requiredStr("Cidade"),
  uf: z
    .string()
    .length(2, "UF deve ter 2 letras")
    .regex(/^[A-Z]{2}$/, "UF inválida"),
});

// ─── Provider ────────────────────────────────────────────────────────────────

export const providerSchema = z.object({
  name: requiredStr("Nome do prestador"),
  cpfCnpj: cpfCnpjSchema,
  im: z.string().max(20).optional().or(z.literal("")),
  email: z.string().email("E-mail inválido"),
  phone: z
    .string()
    .min(1, "Telefone é obrigatório")
    .refine((v) => {
      const d = onlyDigits(v);
      return d.length >= 10 && d.length <= 11;
    }, "Telefone inválido"),
  address: addressSchema,
});

// ─── Client ──────────────────────────────────────────────────────────────────

export const clientSchema = z.object({
  name: requiredStr("Nome do cliente"),
  cpfCnpj: cpfCnpjSchema,
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  phone: z
    .string()
    .optional()
    .refine((v) => {
      if (!v) return true;
      const d = onlyDigits(v);
      return d.length >= 10 && d.length <= 11;
    }, "Telefone inválido"),
  address: addressSchema,
});

// ─── Item ────────────────────────────────────────────────────────────────────

export const itemSchema = z.object({
  id: z.string(),
  description: requiredStr("Descrição"),
  unit: optionalStr(20),
  qty: z.number().positive("Quantidade deve ser maior que zero"),
  unitPrice: z.number().min(0, "Preço não pode ser negativo"),
  discountPct: z.number().min(0).max(100, "Desconto máximo é 100%"),
  lineTotal: z.number().min(0),
});

// ─── Proposal Details ────────────────────────────────────────────────────────

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida");

export const metaSchema = z.object({
  number: requiredStr("Número da proposta"),
  issueDate: isoDate,
  validityDate: isoDate,
  placeAndDate: requiredStr("Local e data"),
});

export const proposalDetailsSchema = z.object({
  title: requiredStr("Título da proposta"),
  scope: z.string().min(10, "Descreva o escopo (mín. 10 caracteres)").max(2000),
  executionTime: requiredStr("Prazo de execução"),
  payment: requiredStr("Condições de pagamento"),
  warranty: optionalStr(500),
  notes: optionalStr(2000),
  payLink: z
    .string()
    .optional()
    .refine((v) => !v || safeUrl(v) !== "", "Link deve começar com https://"),
  signatures: z.object({
    clientName: optionalStr(120),
    providerName: optionalStr(120),
  }),
});

// ─── Full Proposal ────────────────────────────────────────────────────────────

export const proposalSchema = z.object({
  meta: metaSchema,
  provider: providerSchema,
  client: clientSchema,
  proposal: proposalDetailsSchema,
  items: z.array(itemSchema).min(1, "Adicione pelo menos um item"),
  totals: z.object({
    subtotal: z.number().min(0),
    discount: z.number().min(0),
    total: z.number().min(0),
  }),
});

export type ProposalFormValues = z.infer<typeof proposalSchema>;
