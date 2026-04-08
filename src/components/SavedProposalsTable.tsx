import { FolderOpen, InboxIcon, Trash2 } from "lucide-react";
import { useProposal } from "@/context/ProposalContext";
import { formatBRL, isoToBR } from "@/utils/sanitize";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SavedProposal } from "@/types/proposal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface RowProps {
  proposal: SavedProposal;
  onLoad: () => void;
  onDelete: () => void;
}

function ProposalRow({ proposal: p, onLoad, onDelete }: RowProps) {
  return (
    <tr className="border-b border-border/60 transition-colors hover:bg-muted/35 last:border-0">
      <td className="px-4 py-4 text-sm font-semibold text-foreground">{p.meta.number}</td>
      <td className="px-4 py-4 text-sm text-muted-foreground">{p.proposal.title || "—"}</td>
      <td className="px-4 py-4 text-sm text-muted-foreground">{p.client.name || "—"}</td>
      <td className="px-4 py-4 text-right text-sm font-semibold text-foreground">{formatBRL(p.totals.total)}</td>
      <td className="px-4 py-4 text-sm text-muted-foreground">{isoToBR(p.meta.validityDate)}</td>
      <td className="px-4 py-4 text-sm text-muted-foreground">{formatDate(p.savedAt)}</td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onLoad}
            aria-label={`Carregar proposta ${p.meta.number}`}
            title="Carregar para edição"
          >
            <FolderOpen className="h-4 w-4" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onDelete}
            aria-label={`Excluir proposta ${p.meta.number}`}
            title="Excluir"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" aria-hidden />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export function SavedProposalsTable() {
  const { savedProposals, loadProposal, deleteSavedProposal } = useProposal();

  if (savedProposals.length === 0) {
    return (
      <Card className="overflow-hidden">
        <CardContent className="flex flex-col items-center gap-4 px-6 py-14 text-center">
          <div className="rounded-full bg-primary/10 p-4 text-primary">
            <InboxIcon className="h-10 w-10" aria-hidden />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-semibold text-foreground">Nenhuma proposta salva ainda</p>
            <p className="max-w-xl text-sm leading-6 text-muted-foreground/80">
              As propostas que você salvar ficarão disponíveis aqui para reabrir, editar e gerar novos PDFs com agilidade.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="border-b border-border/70 bg-muted/20 px-6 py-5">
        <p className="section-kicker">Histórico local</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">Propostas salvas</h3>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">
          Reabra propostas anteriores para editar, revisar valores ou gerar uma nova versão em PDF.
        </p>
      </CardContent>

      <div className="overflow-x-auto">
        <table className="w-full text-left" aria-label="Propostas salvas">
          <thead>
            <tr className="border-b border-border/70 bg-background/70">
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Nº</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Título</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cliente</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Total</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Validade</th>
              <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Salva em</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground">Ações</th>
            </tr>
          </thead>
          <tbody>
            {savedProposals.map((p) => (
              <ProposalRow
                key={p.id}
                proposal={p}
                onLoad={() => loadProposal(p.id)}
                onDelete={() => {
                  if (window.confirm(`Excluir a proposta ${p.meta.number}?`)) {
                    deleteSavedProposal(p.id);
                  }
                }}
              />
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
