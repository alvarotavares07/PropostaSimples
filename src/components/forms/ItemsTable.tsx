import { type ReactNode, useState } from "react";
import { Lightbulb, Package, Plus, Trash2 } from "lucide-react";
import { useProposal } from "@/context/ProposalContext";
import { formatBRL } from "@/utils/sanitize";
import { validateProposal } from "@/utils/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import type { ProposalItem } from "@/types/proposal";

const fieldErrorClass =
  "border-destructive/65 bg-destructive/5 hover:border-destructive/70 focus-visible:border-destructive/70 focus-visible:ring-destructive/20";

function ItemRow({
  item,
  index,
  errorMap,
}: {
  item: ProposalItem;
  index: number;
  errorMap: Map<string, string>;
}) {
  const { dispatch } = useProposal();
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  function update(payload: Partial<ProposalItem>) {
    dispatch({ type: "UPDATE_ITEM", id: item.id, payload });
  }

  function markTouched(field: string) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  }

  function getError(field: string): string | undefined {
    const key = `items.${index}.${field}`;
    const error = errorMap.get(key);
    if (!error) return undefined;
    return touched[field] ? error : undefined;
  }

  const descriptionError = getError("description");
  const qtyError = getError("qty");

  return (
    <li className="rounded-2xl border border-border/70 bg-background/80 p-4 shadow-[inset_0_1px_0_hsl(0_0%_100%/0.35)]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="section-kicker">Item {index + 1}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Comece pela descrição principal. Depois ajuste unidade, quantidade e valor.
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => dispatch({ type: "REMOVE_ITEM", id: item.id })}
          aria-label={`Remover item ${index + 1}: ${item.description || "sem descrição"}`}
          className="relative z-10 h-10 w-10 shrink-0 self-end text-destructive hover:bg-destructive/10 hover:text-destructive sm:self-start"
        >
          <Trash2 className="h-4 w-4" aria-hidden />
        </Button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_90px_110px_130px_110px_120px]">
        <FieldLabel id={`item-desc-${item.id}`} label="Descrição" required error={descriptionError}>
          <Input
            id={`item-desc-${item.id}`}
            value={item.description}
            onChange={(e) => update({ description: e.target.value })}
            onBlur={() => markTouched("description")}
            placeholder="Ex.: Criação de identidade visual"
            maxLength={200}
            aria-label={`Descrição do item ${index + 1}`}
            aria-invalid={Boolean(descriptionError)}
            aria-describedby={descriptionError ? `item-desc-${item.id}-error` : undefined}
            className={descriptionError ? fieldErrorClass : ""}
          />
        </FieldLabel>

        <FieldLabel id={`item-unit-${item.id}`} label="Unidade">
          <Input
            id={`item-unit-${item.id}`}
            value={item.unit ?? ""}
            onChange={(e) => update({ unit: e.target.value.slice(0, 10) })}
            placeholder="un"
            maxLength={10}
            aria-label={`Unidade do item ${index + 1}`}
          />
        </FieldLabel>

        <FieldLabel id={`item-qty-${item.id}`} label="Qtd." required error={qtyError}>
          <Input
            id={`item-qty-${item.id}`}
            type="number"
            min={0.01}
            step={0.01}
            value={item.qty}
            onChange={(e) => update({ qty: Math.max(0, parseFloat(e.target.value) || 0) })}
            onBlur={() => markTouched("qty")}
            aria-label={`Quantidade do item ${index + 1}`}
            aria-invalid={Boolean(qtyError)}
            aria-describedby={qtyError ? `item-qty-${item.id}-error` : undefined}
            className={qtyError ? fieldErrorClass : ""}
          />
        </FieldLabel>

        <FieldLabel id={`item-price-${item.id}`} label="Preço unit.">
          <Input
            id={`item-price-${item.id}`}
            type="number"
            min={0}
            step={0.01}
            value={item.unitPrice}
            onChange={(e) => update({ unitPrice: Math.max(0, parseFloat(e.target.value) || 0) })}
            aria-label={`Preço unitário do item ${index + 1}`}
          />
        </FieldLabel>

        <FieldLabel id={`item-disc-${item.id}`} label="Desc. %">
          <Input
            id={`item-disc-${item.id}`}
            type="number"
            min={0}
            max={100}
            step={0.1}
            value={item.discountPct}
            onChange={(e) =>
              update({ discountPct: Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)) })
            }
            aria-label={`Desconto do item ${index + 1}`}
          />
        </FieldLabel>

        <div>
          <p className="mb-1 text-xs text-muted-foreground">Total</p>
          <p
            className="flex h-11 items-center rounded-xl border border-dashed border-border/80 bg-muted/25 px-3 font-semibold text-foreground"
            aria-label={`Total do item ${index + 1}: ${formatBRL(item.lineTotal)}`}
          >
            {formatBRL(item.lineTotal)}
          </p>
        </div>
      </div>
    </li>
  );
}

function FieldLabel({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-xs text-muted-foreground">
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden>
            {" "}
            *
          </span>
        ) : null}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-2 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function ItemsTable() {
  const { proposal, dispatch } = useProposal();
  const { items, totals } = proposal;
  const validation = validateProposal(proposal);
  const errorMap = new Map(validation.errors.map((error) => [error.field, error.message]));
  const itemsMissingMainInfo = items.some((item) => !item.description.trim() || item.qty <= 0);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="border-b border-border/70 bg-muted/20 pb-5">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-primary/10 p-2.5 text-primary">
            <Package className="h-4 w-4" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="section-kicker">Composição comercial</p>
            <CardTitle className="text-lg">Itens da proposta</CardTitle>
            <p className="text-sm leading-6 text-muted-foreground">
              Estruture os itens com clareza para facilitar a leitura do cliente e reforçar a
              percepção de organização.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {items.length > 0 ? (
          <div className="flex items-start gap-3 rounded-2xl border border-primary/10 bg-primary/[0.045] px-4 py-3 text-sm text-muted-foreground">
            <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
              <Lightbulb className="h-4 w-4" aria-hidden />
            </div>
            <div>
              <p className="font-semibold text-foreground">Dica rápida para preencher sem travar</p>
              <p className="mt-1 leading-6">
                Comece pela descrição do serviço principal. Os totais serão calculados
                automaticamente enquanto você informa quantidade, valor unitário e desconto.
              </p>
            </div>
          </div>
        ) : null}

        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/15 px-6 py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 text-primary">
              <Package className="h-8 w-8" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">Nenhum item adicionado</p>
              <p className="max-w-md text-sm leading-6 text-muted-foreground">
                Adicione o primeiro serviço ou produto. Os totais serão calculados automaticamente
                conforme você preencher.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: "ADD_ITEM" })}
              className="gap-2"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Adicionar primeiro item
            </Button>
          </div>
        ) : (
          <ul className="space-y-4" aria-label="Lista de itens">
            {items.map((item, i) => (
              <ItemRow key={item.id} item={item} index={i} errorMap={errorMap} />
            ))}
          </ul>
        )}

        {items.length > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">
              {itemsMissingMainInfo
                ? "Preencha descrição e quantidade dos itens para concluir essa etapa."
                : "Itens principais preenchidos. Você já pode revisar o total ao lado."}
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => dispatch({ type: "ADD_ITEM" })}
              className="gap-2 sm:self-end"
            >
              <Plus className="h-4 w-4" aria-hidden />
              Adicionar item
            </Button>
          </div>
        )}

        {items.length > 0 && (
          <>
            <Separator />
            <div
              className="grid gap-4 rounded-2xl border border-border/70 bg-muted/20 p-4 md:grid-cols-[1fr_auto]"
              aria-label="Resumo de valores"
            >
              <div className="space-y-1">
                <p className="section-kicker">Resumo financeiro</p>
                <p className="text-sm leading-6 text-muted-foreground">
                  Os valores abaixo são atualizados em tempo real a partir dos itens informados.
                </p>
              </div>

              <div className="min-w-[220px] space-y-2 rounded-2xl bg-background/80 p-4 text-sm shadow-[inset_0_1px_0_hsl(0_0%_100%/0.35)]">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatBRL(totals.subtotal)}</span>
                </div>
                {totals.discount > 0 && (
                  <div className="flex justify-between text-green-600 dark:text-green-400">
                    <span>Descontos</span>
                    <span>- {formatBRL(totals.discount)}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-base font-bold text-foreground">
                  <span>Total</span>
                  <span>{formatBRL(totals.total)}</span>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
