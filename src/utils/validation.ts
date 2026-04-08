import type { ProposalState, ValidationResult } from "@/types/proposal";
import { onlyDigits } from "./sanitize";

/** Lightweight runtime validation for user feedback — NOT for form schema */
export function validateProposal(p: ProposalState): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  const req = (val: string | undefined, field: string, label: string) => {
    if (!val?.trim()) errors.push({ field, message: `${label} é obrigatório` });
  };

  // Meta
  req(p.meta.issueDate, "meta.issueDate", "Data de emissão");
  req(p.meta.validityDate, "meta.validityDate", "Validade");

  // Provider
  req(p.provider.name, "provider.name", "Nome do prestador");
  req(p.provider.email, "provider.email", "E-mail do prestador");
  req(p.provider.cpfCnpj, "provider.cpfCnpj", "CPF/CNPJ do prestador");

  // Client
  req(p.client.name, "client.name", "Nome do cliente");
  req(p.client.cpfCnpj, "client.cpfCnpj", "CPF/CNPJ do cliente");

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
    if (link && !link.startsWith("https://")) {
      errors.push({ field: "proposal.payLink", message: "Link deve começar com https://" });
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
