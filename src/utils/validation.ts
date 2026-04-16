import type { ProposalState, ValidationResult } from "@/types/proposal";
import { onlyDigits, safeUrl } from "./sanitize";

/** Lightweight runtime validation for user feedback — NOT for form schema */
export function validateProposal(p: ProposalState): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  const req = (val: string | undefined, field: string, label: string) => {
    if (!val?.trim()) errors.push({ field, message: `${label} é obrigatório` });
  };

  const email = (val: string | undefined, field: string, label: string, required = false) => {
    const trimmed = val?.trim() ?? "";
    if (!trimmed) {
      if (required) errors.push({ field, message: `${label} é obrigatório` });
      return;
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(trimmed)) {
      errors.push({ field, message: `${label} inválido` });
    }
  };

  const cpfCnpj = (val: string | undefined, field: string, label: string) => {
    const digits = onlyDigits(val ?? "");
    if (!digits) {
      errors.push({ field, message: `${label} é obrigatório` });
      return;
    }
    if (digits.length === 11) {
      if (!isValidCPF(digits)) {
        errors.push({ field, message: `${label} inválido` });
      }
      return;
    }
    if (digits.length === 14) {
      if (!isValidCNPJ(digits)) {
        errors.push({ field, message: `${label} inválido` });
      }
      return;
    }
    errors.push({ field, message: `${label} deve ter 11 ou 14 dígitos` });
  };

  // Meta
  req(p.meta.issueDate, "meta.issueDate", "Data de emissão");
  req(p.meta.validityDate, "meta.validityDate", "Validade");
  if (p.meta.issueDate && p.meta.validityDate && p.meta.validityDate < p.meta.issueDate) {
    errors.push({
      field: "meta.validityDate",
      message: "A validade não pode ser anterior à data de emissão",
    });
  }

  // Provider
  req(p.provider.name, "provider.name", "Nome do prestador");
  email(p.provider.email, "provider.email", "E-mail do prestador", true);
  cpfCnpj(p.provider.cpfCnpj, "provider.cpfCnpj", "CPF/CNPJ do prestador");

  // Client
  req(p.client.name, "client.name", "Nome do cliente");
  cpfCnpj(p.client.cpfCnpj, "client.cpfCnpj", "CPF/CNPJ do cliente");
  email(p.client.email, "client.email", "E-mail do cliente");

  // Proposal
  req(p.proposal.title, "proposal.title", "Título da proposta");
  req(p.proposal.scope, "proposal.scope", "Escopo");
  req(p.proposal.executionTime, "proposal.executionTime", "Prazo de execução");
  req(p.proposal.payment, "proposal.payment", "Condições de pagamento");

  // Items
  if (p.items.length === 0) {
    errors.push({ field: "items", message: "Adicione pelo menos um item" });
  } else {
    p.items.forEach((item, i) => {
      if (!item.description.trim()) {
        errors.push({
          field: `items.${i}.description`,
          message: `Item ${i + 1}: descrição obrigatória`,
        });
      }
      if (item.qty <= 0) {
        errors.push({ field: `items.${i}.qty`, message: `Item ${i + 1}: quantidade inválida` });
      }
    });
  }

  // PayLink safety check
  if (p.proposal.payLink) {
    const link = p.proposal.payLink.trim();
    if (link && !safeUrl(link)) {
      errors.push({ field: "proposal.payLink", message: "Informe uma URL https:// válida" });
    }
  }

  return { isValid: errors.length === 0, errors };
}

/** Check CPF validity */
export function isValidCPF(cpf: string): boolean {
  const d = onlyDigits(cpf);
  if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += +d[i] * (10 - i);
  let r = (sum * 10) % 11;
  if (r >= 10) r = 0;
  if (r !== +d[9]) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += +d[i] * (11 - i);
  r = (sum * 10) % 11;
  if (r >= 10) r = 0;
  return r === +d[10];
}

export function isValidCNPJ(cnpj: string): boolean {
  const d = onlyDigits(cnpj);
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;

  const calcDigit = (base: string, factors: number[]) => {
    const sum = factors.reduce((acc, factor, index) => acc + Number(base[index]) * factor, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const digit1 = calcDigit(d, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const digit2 = calcDigit(d, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);

  return digit1 === Number(d[12]) && digit2 === Number(d[13]);
}
