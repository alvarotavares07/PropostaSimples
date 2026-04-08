import { type ReactNode, useState } from "react";
import { useProposal } from "@/context/ProposalContext";
import { useMaskedInput } from "@/hooks/useMaskedInput";
import {
  brToISO,
  generateProposalNumber,
  isoToBR,
  isValidBRDate,
  maskBRDate,
} from "@/utils/sanitize";
import { validateProposal } from "@/utils/validation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Building2,
  CheckCircle2,
  CircleDashed,
  FileText as FileIcon,
  RefreshCw,
  Sparkles,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

const fieldErrorClass =
  "border-destructive/65 bg-destructive/5 hover:border-destructive/70 focus-visible:border-destructive/70 focus-visible:ring-destructive/20";

interface FieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  hint?: string;
}

function Field({ id, label, required, error, children, hint }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id} className="text-sm font-medium text-foreground">
        {label}
        {required && (
          <span className="ml-1 text-destructive" aria-hidden>
            *
          </span>
        )}
      </Label>
      {children}
      {hint && (
        <p id={`${id}-hint`} className="text-xs leading-5 text-muted-foreground">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

interface SectionHeaderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

function SectionHeader({ icon: Icon, title, description, badge }: SectionHeaderProps) {
  return (
    <CardHeader className="border-b border-border/70 bg-muted/20 pb-5">
      <div className="flex items-start gap-4">
        <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="section-kicker">Seção</p>
            {badge ? <Badge variant="secondary">{badge}</Badge> : null}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </CardHeader>
  );
}

interface AddressProps {
  prefix: "provider.address" | "client.address";
  value: {
    cep: string;
    street: string;
    number: string;
    complement?: string;
    district: string;
    city: string;
    uf: string;
  };
  onChange: (field: string, val: string) => void;
}

function AddressFields({ prefix, value, onChange }: AddressProps) {
  const cepMask = useMaskedInput({ mask: "cep", onChange: (v) => onChange("cep", v) });
  const ufMask = useMaskedInput({ mask: "uf", onChange: (v) => onChange("uf", v) });

  return (
    <div className="grid gap-5 sm:grid-cols-2">
      <Field id={`${prefix}.cep`} label="CEP" required>
        <Input
          id={`${prefix}.cep`}
          value={value.cep}
          onChange={cepMask}
          placeholder="00000-000"
          inputMode="numeric"
          maxLength={9}
          autoComplete="postal-code"
        />
      </Field>

      <div className="sm:col-span-2">
        <Field id={`${prefix}.street`} label="Logradouro" required>
          <Input
            id={`${prefix}.street`}
            value={value.street}
            onChange={(e) => onChange("street", e.target.value)}
            placeholder="Rua, avenida, praça..."
            maxLength={120}
            autoComplete="address-line1"
          />
        </Field>
      </div>

      <Field id={`${prefix}.number`} label="Número" required>
        <Input
          id={`${prefix}.number`}
          value={value.number}
          onChange={(e) => onChange("number", e.target.value.slice(0, 10))}
          placeholder="123"
          maxLength={10}
          autoComplete="address-line2"
        />
      </Field>

      <Field id={`${prefix}.complement`} label="Complemento">
        <Input
          id={`${prefix}.complement`}
          value={value.complement ?? ""}
          onChange={(e) => onChange("complement", e.target.value)}
          placeholder="Sala, bloco, conjunto..."
          maxLength={60}
        />
      </Field>

      <Field id={`${prefix}.district`} label="Bairro" required>
        <Input
          id={`${prefix}.district`}
          value={value.district}
          onChange={(e) => onChange("district", e.target.value)}
          placeholder="Bairro"
          maxLength={80}
        />
      </Field>

      <Field id={`${prefix}.city`} label="Cidade" required>
        <Input
          id={`${prefix}.city`}
          value={value.city}
          onChange={(e) => onChange("city", e.target.value)}
          placeholder="Cidade"
          maxLength={80}
          autoComplete="address-level2"
        />
      </Field>

      <Field id={`${prefix}.uf`} label="UF" required>
        <Input
          id={`${prefix}.uf`}
          value={value.uf}
          onChange={ufMask}
          placeholder="MG"
          maxLength={2}
          autoComplete="address-level1"
          className="uppercase"
        />
      </Field>
    </div>
  );
}

function SectionProgress({
  title,
  status,
  description,
}: {
  title: string;
  status: "done" | "pending";
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-background/75 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.4)]">
      <div className="flex items-start gap-3">
        <div
          className={
            status === "done"
              ? "bg-emerald-500/12 rounded-xl p-2 text-emerald-600 dark:text-emerald-400"
              : "rounded-xl bg-primary/10 p-2 text-primary"
          }
        >
          {status === "done" ? (
            <CheckCircle2 className="h-4 w-4" aria-hidden />
          ) : (
            <CircleDashed className="h-4 w-4" aria-hidden />
          )}
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
      </div>
    </div>
  );
}

export function ProposalForm() {
  const { proposal, dispatch } = useProposal();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validation = validateProposal(proposal);
  const errorMap = new Map(validation.errors.map((error) => [error.field, error.message]));

  const providerCpfMask = useMaskedInput({
    mask: "cpfcnpj",
    onChange: (v) => dispatch({ type: "SET_PROVIDER", payload: { cpfCnpj: v } }),
  });
  const providerPhoneMask = useMaskedInput({
    mask: "phone",
    onChange: (v) => dispatch({ type: "SET_PROVIDER", payload: { phone: v } }),
  });
  const clientCpfMask = useMaskedInput({
    mask: "cpfcnpj",
    onChange: (v) => dispatch({ type: "SET_CLIENT", payload: { cpfCnpj: v } }),
  });
  const clientPhoneMask = useMaskedInput({
    mask: "phone",
    onChange: (v) => dispatch({ type: "SET_CLIENT", payload: { phone: v } }),
  });

  const providerReady = Boolean(
    proposal.provider.name.trim() &&
    proposal.provider.cpfCnpj.trim() &&
    proposal.provider.email.trim(),
  );
  const clientReady = Boolean(proposal.client.name.trim() && proposal.client.cpfCnpj.trim());
  const commercialReady = Boolean(
    proposal.proposal.title.trim() &&
    proposal.proposal.scope.trim() &&
    proposal.proposal.executionTime.trim() &&
    proposal.proposal.payment.trim(),
  );
  const proposalSummaryReady = providerReady && clientReady && commercialReady;

  function dateDisplayValue(iso: string): string {
    return isoToBR(iso);
  }

  function markTouched(field: string) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  }

  function getFieldError(field: string, value?: string): string | undefined {
    const error = errorMap.get(field);
    if (!error) return undefined;
    if (touched[field]) return error;
    if (field === "proposal.payLink" && value?.trim()) return error;
    return undefined;
  }

  function inputStateClass(error?: string) {
    return error ? fieldErrorClass : "";
  }

  function describedBy(id: string, error?: string, hint?: string) {
    return (
      [hint ? `${id}-hint` : "", error ? `${id}-error` : ""].filter(Boolean).join(" ") || undefined
    );
  }

  function handleDateChange(field: "issueDate" | "validityDate", raw: string) {
    const masked = maskBRDate(raw);
    if (isValidBRDate(masked)) {
      dispatch({ type: "SET_META", payload: { [field]: brToISO(masked) } });
      return;
    }
    dispatch({ type: "SET_META", payload: { [field]: "" } });
  }

  function useProviderNameForSignature() {
    dispatch({
      type: "SET_PROPOSAL",
      payload: {
        signatures: {
          ...proposal.proposal.signatures,
          providerName: proposal.provider.name,
        },
      },
    });
  }

  function useClientNameForSignature() {
    dispatch({
      type: "SET_PROPOSAL",
      payload: {
        signatures: {
          ...proposal.proposal.signatures,
          clientName: proposal.client.name,
        },
      },
    });
  }

  function fillPlaceAndDate() {
    const city = proposal.provider.address.city.trim();
    const uf = proposal.provider.address.uf.trim();
    if (!city || !uf || !proposal.meta.issueDate) return;
    dispatch({
      type: "SET_META",
      payload: {
        placeAndDate: `${city} - ${uf}, ${isoToBR(proposal.meta.issueDate)}`,
      },
    });
  }

  const payLinkError = getFieldError("proposal.payLink", proposal.proposal.payLink ?? "");
  const canSuggestPlaceAndDate = Boolean(
    proposal.provider.address.city.trim() &&
    proposal.provider.address.uf.trim() &&
    proposal.meta.issueDate,
  );

  return (
    <div className="animate-fade-in space-y-6">
      <Card className="surface-panel overflow-hidden">
        <CardContent className="space-y-5 p-5 md:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-primary/10 p-2 text-primary">
                  <Sparkles className="h-4 w-4" aria-hidden />
                </div>
                <p className="section-kicker">Preenchimento guiado</p>
              </div>
              <h2 className="text-xl font-semibold text-foreground">
                Monte sua proposta com mais clareza
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Comece pelos dados de quem está prestando o serviço, depois preencha o cliente e
                finalize com os detalhes comerciais. As datas já começam prontas e o número pode ser
                gerado depois, se você preferir.
              </p>
            </div>

            <div className="rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm shadow-[inset_0_1px_0_hsl(0_0%_100%/0.4)] lg:min-w-[260px]">
              <p className="section-kicker">Situação atual</p>
              <p className="mt-2 text-xl font-semibold text-foreground">
                {validation.isValid
                  ? "Tudo pronto"
                  : `${validation.errors.length} ponto(s) para revisar`}
              </p>
              <p className="mt-1 leading-6 text-muted-foreground">
                Os campos essenciais aparecem destacados conforme você vai preenchendo.
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <SectionProgress
              title="Quem está vendendo"
              status={providerReady ? "done" : "pending"}
              description="Nome, documento e contato principal do prestador."
            />
            <SectionProgress
              title="Quem vai contratar"
              status={clientReady ? "done" : "pending"}
              description="Identificação do cliente para personalizar o documento."
            />
            <SectionProgress
              title="Como a proposta será entregue"
              status={proposalSummaryReady ? "done" : "pending"}
              description="Título, escopo, prazo e condições comerciais."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <SectionHeader
          icon={FileIcon}
          title="Identificação da proposta"
          description="Defina o contexto inicial do documento. Se preferir, você pode deixar o número em branco e gerar depois, no momento de salvar ou exportar."
          badge="Passo 1"
        />
        <CardContent className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="meta.number"
              label="Número da proposta"
              hint="Opcional neste momento. Se deixar em branco, o sistema gera ao salvar ou exportar."
            >
              <div className="flex gap-2">
                <Input
                  id="meta.number"
                  value={proposal.meta.number}
                  onChange={(e) =>
                    dispatch({ type: "SET_META", payload: { number: e.target.value } })
                  }
                  onBlur={() => markTouched("meta.number")}
                  placeholder="Ex.: PS-20260408-001"
                  maxLength={30}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() =>
                    dispatch({ type: "SET_META", payload: { number: generateProposalNumber() } })
                  }
                  aria-label="Gerar número automático"
                  title="Gerar número automático"
                >
                  <RefreshCw className="h-4 w-4" aria-hidden />
                </Button>
              </div>
            </Field>

            <Field
              id="meta.placeAndDate"
              label="Local e data"
              hint="Opcional. Útil para deixar o documento mais formal."
            >
              <div className="space-y-2">
                <Input
                  id="meta.placeAndDate"
                  value={proposal.meta.placeAndDate}
                  onChange={(e) =>
                    dispatch({ type: "SET_META", payload: { placeAndDate: e.target.value } })
                  }
                  placeholder="Belo Horizonte - MG, 01/01/2025"
                  maxLength={80}
                />
                {canSuggestPlaceAndDate ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={fillPlaceAndDate}
                    className="h-auto justify-start px-0 text-primary hover:bg-transparent hover:text-primary"
                  >
                    Usar cidade do prestador com a data de emissão
                  </Button>
                ) : null}
              </div>
            </Field>

            <Field
              id="meta.issueDate"
              label="Data de emissão"
              required
              error={getFieldError("meta.issueDate", proposal.meta.issueDate)}
            >
              <Input
                id="meta.issueDate"
                value={dateDisplayValue(proposal.meta.issueDate)}
                onChange={(e) => handleDateChange("issueDate", e.target.value)}
                onBlur={() => markTouched("meta.issueDate")}
                placeholder="DD/MM/AAAA"
                inputMode="numeric"
                maxLength={10}
                aria-invalid={Boolean(getFieldError("meta.issueDate", proposal.meta.issueDate))}
                aria-describedby={describedBy(
                  "meta.issueDate",
                  getFieldError("meta.issueDate", proposal.meta.issueDate),
                )}
                className={inputStateClass(
                  getFieldError("meta.issueDate", proposal.meta.issueDate),
                )}
              />
            </Field>

            <Field
              id="meta.validityDate"
              label="Validade até"
              required
              hint="Recomendado para deixar claro até quando os valores e condições permanecem vigentes."
              error={getFieldError("meta.validityDate", proposal.meta.validityDate)}
            >
              <Input
                id="meta.validityDate"
                value={dateDisplayValue(proposal.meta.validityDate)}
                onChange={(e) => handleDateChange("validityDate", e.target.value)}
                onBlur={() => markTouched("meta.validityDate")}
                placeholder="DD/MM/AAAA"
                inputMode="numeric"
                maxLength={10}
                aria-invalid={Boolean(
                  getFieldError("meta.validityDate", proposal.meta.validityDate),
                )}
                aria-describedby={describedBy(
                  "meta.validityDate",
                  getFieldError("meta.validityDate", proposal.meta.validityDate),
                  "Recomendado para deixar claro até quando os valores e condições permanecem vigentes.",
                )}
                className={inputStateClass(
                  getFieldError("meta.validityDate", proposal.meta.validityDate),
                )}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/25 px-4 py-3 text-sm leading-6 text-muted-foreground">
            Uma numeração consistente facilita consultas futuras e passa mais organização ao cliente
            desde o primeiro contato.
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <SectionHeader
          icon={Building2}
          title="Dados do prestador"
          description="Essas informações identificam sua empresa na proposta e reforçam a credibilidade comercial do documento."
          badge="Passo 2"
        />
        <CardContent className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                id="provider.name"
                label="Nome / Razão Social"
                required
                error={getFieldError("provider.name", proposal.provider.name)}
              >
                <Input
                  id="provider.name"
                  value={proposal.provider.name}
                  onChange={(e) =>
                    dispatch({ type: "SET_PROVIDER", payload: { name: e.target.value } })
                  }
                  onBlur={() => markTouched("provider.name")}
                  placeholder="Seu nome ou sua empresa"
                  maxLength={120}
                  autoComplete="name"
                  aria-invalid={Boolean(getFieldError("provider.name", proposal.provider.name))}
                  aria-describedby={describedBy(
                    "provider.name",
                    getFieldError("provider.name", proposal.provider.name),
                  )}
                  className={inputStateClass(
                    getFieldError("provider.name", proposal.provider.name),
                  )}
                />
              </Field>
            </div>

            <Field
              id="provider.cpfCnpj"
              label="CPF / CNPJ"
              required
              error={getFieldError("provider.cpfCnpj", proposal.provider.cpfCnpj)}
            >
              <Input
                id="provider.cpfCnpj"
                value={proposal.provider.cpfCnpj}
                onChange={providerCpfMask}
                onBlur={() => markTouched("provider.cpfCnpj")}
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={18}
                aria-invalid={Boolean(getFieldError("provider.cpfCnpj", proposal.provider.cpfCnpj))}
                aria-describedby={describedBy(
                  "provider.cpfCnpj",
                  getFieldError("provider.cpfCnpj", proposal.provider.cpfCnpj),
                )}
                className={inputStateClass(
                  getFieldError("provider.cpfCnpj", proposal.provider.cpfCnpj),
                )}
              />
            </Field>

            <Field id="provider.im" label="Inscrição Municipal">
              <Input
                id="provider.im"
                value={proposal.provider.im}
                onChange={(e) =>
                  dispatch({ type: "SET_PROVIDER", payload: { im: e.target.value.slice(0, 20) } })
                }
                placeholder="000000"
                inputMode="numeric"
                maxLength={20}
              />
            </Field>

            <Field
              id="provider.email"
              label="E-mail"
              required
              error={getFieldError("provider.email", proposal.provider.email)}
            >
              <Input
                id="provider.email"
                type="email"
                value={proposal.provider.email}
                onChange={(e) =>
                  dispatch({ type: "SET_PROVIDER", payload: { email: e.target.value } })
                }
                onBlur={() => markTouched("provider.email")}
                placeholder="seu@email.com"
                autoComplete="email"
                maxLength={120}
                aria-invalid={Boolean(getFieldError("provider.email", proposal.provider.email))}
                aria-describedby={describedBy(
                  "provider.email",
                  getFieldError("provider.email", proposal.provider.email),
                )}
                className={inputStateClass(
                  getFieldError("provider.email", proposal.provider.email),
                )}
              />
            </Field>

            <Field
              id="provider.phone"
              label="Telefone"
              hint="Ajuda o cliente a confirmar detalhes com rapidez."
            >
              <Input
                id="provider.phone"
                type="tel"
                value={proposal.provider.phone}
                onChange={providerPhoneMask}
                placeholder="(00) 00000-0000"
                inputMode="tel"
                maxLength={15}
                autoComplete="tel"
                aria-describedby={describedBy(
                  "provider.phone",
                  undefined,
                  "Ajuda o cliente a confirmar detalhes com rapidez.",
                )}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 md:p-5">
            <p className="section-kicker">Endereço do prestador</p>
            <p className="mb-4 mt-1 text-sm leading-6 text-muted-foreground">
              Um endereço completo ajuda a formalizar melhor o documento e reforça a percepção de
              negócio estruturado.
            </p>
            <AddressFields
              prefix="provider.address"
              value={proposal.provider.address}
              onChange={(field, val) =>
                dispatch({
                  type: "SET_PROVIDER",
                  payload: { address: { ...proposal.provider.address, [field]: val } },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <SectionHeader
          icon={User}
          title="Dados do cliente"
          description="Preencha os dados da pessoa ou empresa contratante para personalizar a proposta e reduzir retrabalho nas negociações."
          badge="Passo 3"
        />
        <CardContent className="space-y-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Field
                id="client.name"
                label="Nome / Razão Social"
                required
                error={getFieldError("client.name", proposal.client.name)}
              >
                <Input
                  id="client.name"
                  value={proposal.client.name}
                  onChange={(e) =>
                    dispatch({ type: "SET_CLIENT", payload: { name: e.target.value } })
                  }
                  onBlur={() => markTouched("client.name")}
                  placeholder="Nome do cliente"
                  maxLength={120}
                  aria-invalid={Boolean(getFieldError("client.name", proposal.client.name))}
                  aria-describedby={describedBy(
                    "client.name",
                    getFieldError("client.name", proposal.client.name),
                  )}
                  className={inputStateClass(getFieldError("client.name", proposal.client.name))}
                />
              </Field>
            </div>

            <Field
              id="client.cpfCnpj"
              label="CPF / CNPJ"
              required
              error={getFieldError("client.cpfCnpj", proposal.client.cpfCnpj)}
            >
              <Input
                id="client.cpfCnpj"
                value={proposal.client.cpfCnpj}
                onChange={clientCpfMask}
                onBlur={() => markTouched("client.cpfCnpj")}
                placeholder="000.000.000-00"
                inputMode="numeric"
                maxLength={18}
                aria-invalid={Boolean(getFieldError("client.cpfCnpj", proposal.client.cpfCnpj))}
                aria-describedby={describedBy(
                  "client.cpfCnpj",
                  getFieldError("client.cpfCnpj", proposal.client.cpfCnpj),
                )}
                className={inputStateClass(
                  getFieldError("client.cpfCnpj", proposal.client.cpfCnpj),
                )}
              />
            </Field>

            <Field id="client.email" label="E-mail">
              <Input
                id="client.email"
                type="email"
                value={proposal.client.email ?? ""}
                onChange={(e) =>
                  dispatch({ type: "SET_CLIENT", payload: { email: e.target.value } })
                }
                placeholder="cliente@email.com"
                autoComplete="email"
                maxLength={120}
              />
            </Field>

            <Field id="client.phone" label="Telefone">
              <Input
                id="client.phone"
                type="tel"
                value={proposal.client.phone ?? ""}
                onChange={clientPhoneMask}
                placeholder="(00) 00000-0000"
                inputMode="tel"
                maxLength={15}
              />
            </Field>
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 md:p-5">
            <p className="section-kicker">Endereço do cliente</p>
            <p className="mb-4 mt-1 text-sm leading-6 text-muted-foreground">
              Esses dados deixam a proposta mais completa para aprovação e ajudam no registro formal
              do acordo.
            </p>
            <AddressFields
              prefix="client.address"
              value={proposal.client.address}
              onChange={(field, val) =>
                dispatch({
                  type: "SET_CLIENT",
                  payload: { address: { ...proposal.client.address, [field]: val } },
                })
              }
            />
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        <SectionHeader
          icon={FileIcon}
          title="Detalhes da proposta"
          description="Explique o serviço com clareza, destaque prazos e condições e deixe o documento pronto para ser enviado sem ajustes extras."
          badge="Passo 4"
        />
        <CardContent className="space-y-6">
          <Field
            id="proposal.title"
            label="Título da proposta"
            required
            error={getFieldError("proposal.title", proposal.proposal.title)}
          >
            <Input
              id="proposal.title"
              value={proposal.proposal.title}
              onChange={(e) =>
                dispatch({ type: "SET_PROPOSAL", payload: { title: e.target.value } })
              }
              onBlur={() => markTouched("proposal.title")}
              placeholder="Ex.: Desenvolvimento de website institucional"
              maxLength={120}
              aria-invalid={Boolean(getFieldError("proposal.title", proposal.proposal.title))}
              aria-describedby={describedBy(
                "proposal.title",
                getFieldError("proposal.title", proposal.proposal.title),
              )}
              className={inputStateClass(getFieldError("proposal.title", proposal.proposal.title))}
            />
          </Field>

          <Field
            id="proposal.scope"
            label="Escopo dos serviços"
            required
            error={getFieldError("proposal.scope", proposal.proposal.scope)}
          >
            <Textarea
              id="proposal.scope"
              value={proposal.proposal.scope}
              onChange={(e) =>
                dispatch({ type: "SET_PROPOSAL", payload: { scope: e.target.value } })
              }
              onBlur={() => markTouched("proposal.scope")}
              placeholder="Descreva detalhadamente os serviços que serão prestados..."
              rows={6}
              maxLength={2000}
              className={`resize-y ${inputStateClass(getFieldError("proposal.scope", proposal.proposal.scope))}`}
              aria-invalid={Boolean(getFieldError("proposal.scope", proposal.proposal.scope))}
              aria-describedby={describedBy(
                "proposal.scope",
                getFieldError("proposal.scope", proposal.proposal.scope),
              )}
            />
            <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>Descreva entregáveis, limites, premissas e o que está incluso.</span>
              <span>{proposal.proposal.scope.length}/2000</span>
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              id="proposal.executionTime"
              label="Prazo de execução"
              required
              error={getFieldError("proposal.executionTime", proposal.proposal.executionTime)}
            >
              <Input
                id="proposal.executionTime"
                value={proposal.proposal.executionTime}
                onChange={(e) =>
                  dispatch({ type: "SET_PROPOSAL", payload: { executionTime: e.target.value } })
                }
                onBlur={() => markTouched("proposal.executionTime")}
                placeholder="Ex.: 30 dias úteis"
                maxLength={80}
                aria-invalid={Boolean(
                  getFieldError("proposal.executionTime", proposal.proposal.executionTime),
                )}
                aria-describedby={describedBy(
                  "proposal.executionTime",
                  getFieldError("proposal.executionTime", proposal.proposal.executionTime),
                )}
                className={inputStateClass(
                  getFieldError("proposal.executionTime", proposal.proposal.executionTime),
                )}
              />
            </Field>

            <Field
              id="proposal.payment"
              label="Condições de pagamento"
              required
              error={getFieldError("proposal.payment", proposal.proposal.payment)}
            >
              <Input
                id="proposal.payment"
                value={proposal.proposal.payment}
                onChange={(e) =>
                  dispatch({ type: "SET_PROPOSAL", payload: { payment: e.target.value } })
                }
                onBlur={() => markTouched("proposal.payment")}
                placeholder="Ex.: 50% no início, 50% na entrega"
                maxLength={120}
                aria-invalid={Boolean(getFieldError("proposal.payment", proposal.proposal.payment))}
                aria-describedby={describedBy(
                  "proposal.payment",
                  getFieldError("proposal.payment", proposal.proposal.payment),
                )}
                className={inputStateClass(
                  getFieldError("proposal.payment", proposal.proposal.payment),
                )}
              />
            </Field>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-5">
              <Field id="proposal.warranty" label="Garantia">
                <Input
                  id="proposal.warranty"
                  value={proposal.proposal.warranty ?? ""}
                  onChange={(e) =>
                    dispatch({ type: "SET_PROPOSAL", payload: { warranty: e.target.value } })
                  }
                  placeholder="Ex.: 90 dias de garantia"
                  maxLength={200}
                />
              </Field>

              <Field
                id="proposal.payLink"
                label="Link de pagamento"
                hint="Use este campo apenas se você já tiver um link pronto para enviar ao cliente."
                error={payLinkError}
              >
                <Input
                  id="proposal.payLink"
                  type="url"
                  value={proposal.proposal.payLink ?? ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val || val.startsWith("https://") || val === "https:/") {
                      dispatch({ type: "SET_PROPOSAL", payload: { payLink: val } });
                    }
                  }}
                  onBlur={() => markTouched("proposal.payLink")}
                  placeholder="https://..."
                  maxLength={300}
                  aria-invalid={Boolean(payLinkError)}
                  aria-describedby={describedBy(
                    "proposal.payLink",
                    payLinkError,
                    "Use este campo apenas se você já tiver um link pronto para enviar ao cliente.",
                  )}
                  className={inputStateClass(payLinkError)}
                />
              </Field>

              <Field id="proposal.notes" label="Observações gerais">
                <Textarea
                  id="proposal.notes"
                  value={proposal.proposal.notes ?? ""}
                  onChange={(e) =>
                    dispatch({ type: "SET_PROPOSAL", payload: { notes: e.target.value } })
                  }
                  placeholder="Informações adicionais, condições especiais, observações de escopo..."
                  rows={4}
                  maxLength={2000}
                  className="resize-y"
                />
              </Field>
            </div>

            <div className="rounded-2xl border border-border/70 bg-muted/20 p-4 md:p-5">
              <p className="section-kicker">Assinaturas</p>
              <p className="mb-4 mt-1 text-sm leading-6 text-muted-foreground">
                Se você quiser, pode reaproveitar automaticamente os nomes já informados acima e
                deixar o fechamento mais formal.
              </p>

              <div className="mb-4 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={useProviderNameForSignature}
                  disabled={!proposal.provider.name.trim()}
                >
                  Usar nome do prestador
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={useClientNameForSignature}
                  disabled={!proposal.client.name.trim()}
                >
                  Usar nome do cliente
                </Button>
              </div>

              <div className="space-y-4">
                <Field
                  id="proposal.signatures.providerName"
                  label="Nome do prestador para assinatura"
                >
                  <Input
                    id="proposal.signatures.providerName"
                    value={proposal.proposal.signatures.providerName ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_PROPOSAL",
                        payload: {
                          signatures: {
                            ...proposal.proposal.signatures,
                            providerName: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Nome completo"
                    maxLength={120}
                  />
                </Field>

                <Field id="proposal.signatures.clientName" label="Nome do cliente para assinatura">
                  <Input
                    id="proposal.signatures.clientName"
                    value={proposal.proposal.signatures.clientName ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_PROPOSAL",
                        payload: {
                          signatures: {
                            ...proposal.proposal.signatures,
                            clientName: e.target.value,
                          },
                        },
                      })
                    }
                    placeholder="Nome completo"
                    maxLength={120}
                  />
                </Field>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
