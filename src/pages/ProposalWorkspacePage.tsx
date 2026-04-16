import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { toast } from "sonner";
import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Download,
  Eye,
  FileText,
  Loader2,
  RotateCcw,
  Save,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { ProposalProvider, useProposal } from "@/context/ProposalContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { ProposalForm } from "@/components/forms/ProposalForm";
import { ItemsTable } from "@/components/forms/ItemsTable";
import { ProposalPreview } from "@/components/ProposalPreview";
import { SavedProposalsTable } from "@/components/SavedProposalsTable";
import { CertificateLinksSection } from "@/components/CertificateLinksSection";
import { ProposalPDF } from "@/components/pdf/ProposalPDF";
import { daysUntil, generateProposalNumber } from "@/utils/sanitize";
import { validateProposal } from "@/utils/validation";

function HeroStat({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Sparkles;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.07))] p-4 backdrop-blur-md">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-white/10 bg-white/10 p-2 text-white">
          <Icon className="h-4 w-4" aria-hidden />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-sm leading-6 text-white/70">{description}</p>
        </div>
      </div>
    </div>
  );
}

function WorkflowStep({
  number,
  title,
  description,
}: {
  number: number;
  title: string;
  description: string;
}) {
  return (
    <li className="border-white/12 flex items-start gap-3 rounded-2xl border bg-[linear-gradient(180deg,rgba(255,255,255,0.18),rgba(255,255,255,0.08))] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-md">
      <div className="bg-white/12 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl font-semibold text-white">
        {number}
      </div>
      <div>
        <p className="text-sm font-semibold text-white">{title}</p>
        <p className="mt-1 text-sm leading-6 text-white/70">{description}</p>
      </div>
    </li>
  );
}

function ProposalWorkspaceContent() {
  const { proposal, dispatch, resetProposal, saveProposal, saveDraft } = useProposal();
  const [generating, setGenerating] = useState(false);

  const daysLeft = proposal.meta.validityDate ? daysUntil(proposal.meta.validityDate) : null;
  const validation = validateProposal(proposal);

  function handleSaveDraft() {
    try {
      saveDraft();
      toast.success("Rascunho salvo", {
        description: "Seus dados foram preservados localmente.",
      });
    } catch {
      toast.error("Erro ao salvar rascunho");
    }
  }

  function handleSaveProposal() {
    if (!validation.isValid) {
      toast.warning("Proposta salva com pendências", {
        description: `${validation.errors.length} campo(s) precisam de atenção.`,
      });
    }
    try {
      saveProposal();
      toast.success("Proposta salva com sucesso!");
    } catch {
      toast.error("Erro ao salvar proposta");
    }
  }

  async function handleGeneratePDF() {
    if (!validation.isValid) {
      toast.warning("PDF gerado com pendências", {
        description: "Alguns campos estão incompletos.",
      });
    }
    setGenerating(true);
    try {
      const number = proposal.meta.number.trim() || generateProposalNumber();
      const proposalForPdf =
        number === proposal.meta.number
          ? proposal
          : { ...proposal, meta: { ...proposal.meta, number } };

      if (number !== proposal.meta.number) {
        dispatch({ type: "SET_META", payload: { number } });
      }

      const blob = await pdf(<ProposalPDF proposal={proposalForPdf} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Proposta_${number}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("PDF gerado com sucesso!");
    } catch (err) {
      console.error(err);
      toast.error("Erro ao gerar PDF", {
        description: err instanceof Error ? err.message : "Erro desconhecido",
      });
    } finally {
      setGenerating(false);
    }
  }

  function handleReset() {
    if (
      window.confirm(
        "Limpar todos os dados do formulário e remover as propostas salvas deste navegador?",
      )
    ) {
      resetProposal();
      toast.info("Dados locais removidos deste navegador.");
    }
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="mx-auto max-w-[1680px] px-4 py-6 md:px-6 md:py-8">
        <header className="bg-card/92 relative mb-8 overflow-hidden rounded-[2rem] border border-border/70 shadow-elegant backdrop-blur-xl">
          <div
            className="absolute inset-0 bg-[linear-gradient(135deg,#1f4b7a_0%,#315c87_56%,#3e678f_100%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.12),transparent_34%)]"
            aria-hidden
          />
          <div
            className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(0,0,0,0.08))]"
            aria-hidden
          />
          <div
            className="bg-white/8 absolute right-[-12%] top-[-24%] h-72 w-72 rounded-full blur-3xl"
            aria-hidden
          />
          <div
            className="bg-[#9db7cf]/12 absolute bottom-[-30%] left-[-8%] h-60 w-60 rounded-full blur-3xl"
            aria-hidden
          />

          <div className="relative px-6 py-6 md:px-8 md:py-8 xl:px-10">
            <div className="mb-8 flex items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="border-white/12 bg-white/8 text-white/92 hover:bg-white/8">
                  Produto para MEI
                </Badge>
                <Badge className="border-white/12 bg-white/8 text-white/82 hover:bg-white/8">
                  Dados salvos no navegador
                </Badge>
              </div>
              <ThemeToggle />
            </div>

            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_420px] xl:items-start">
              <div className="space-y-6">
                <div className="max-w-3xl space-y-4">
                  <p className="text-white/62 text-sm font-semibold uppercase tracking-[0.22em]">
                    Propostas comerciais com mais clareza e presença
                  </p>
                  <h1 className="font-display text-4xl font-bold tracking-tight text-white md:text-5xl">
                    Crie propostas profissionais com rapidez, organização e confiança.
                  </h1>
                  <p className="text-white/74 max-w-2xl text-base leading-7 md:text-lg">
                    Preencha seus dados, monte os itens, revise o documento em tempo real e gere um
                    PDF com aparência sólida para apresentar ao cliente.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                  <HeroStat
                    icon={ShieldCheck}
                    title="Fluxo confiável"
                    description="Estrutura clara para preencher, revisar e entregar a proposta com segurança."
                  />
                  <HeroStat
                    icon={Eye}
                    title="Prévia instantânea"
                    description="Visualize o documento enquanto preenche e reduza retrabalho antes do envio."
                  />
                  <HeroStat
                    icon={FileText}
                    title="PDF pronto"
                    description="Gere uma versão final com aparência mais formal para apresentação ao cliente."
                  />
                </div>
              </div>

              <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.08))] p-5 backdrop-blur-md">
                <p className="text-white/62 text-sm font-semibold uppercase tracking-[0.18em]">
                  Como funciona
                </p>
                <ol className="mt-4 space-y-3">
                  <WorkflowStep
                    number={1}
                    title="Preencha os dados essenciais"
                    description="Prestador, cliente e contexto da proposta em uma estrutura objetiva."
                  />
                  <WorkflowStep
                    number={2}
                    title="Organize os itens e condições"
                    description="Detalhe valores, escopo, prazos e observações com mais clareza."
                  />
                  <WorkflowStep
                    number={3}
                    title="Revise, salve e exporte"
                    description="Use a prévia lateral para validar o documento antes de gerar o PDF."
                  />
                </ol>
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.15fr)_440px]">
          <main className="space-y-6" aria-label="Formulário da proposta">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="surface-panel">
                <CardContent className="p-5">
                  <p className="section-kicker">Validação</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {validation.isValid ? "Completa" : `${validation.errors.length} pendência(s)`}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    {validation.isValid
                      ? "Sua proposta está pronta para ser salva e exportada."
                      : "Ainda existem campos importantes que merecem revisão antes do envio."}
                  </p>
                  {!validation.isValid && (
                    <ul className="mt-3 space-y-1.5 text-sm text-muted-foreground">
                      {validation.errors.slice(0, 3).map((error) => (
                        <li key={error.field} className="flex gap-2">
                          <span
                            className="mt-[0.45rem] h-1.5 w-1.5 rounded-full bg-primary/55"
                            aria-hidden
                          />
                          <span>{error.message}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className="surface-panel">
                <CardContent className="p-5">
                  <p className="section-kicker">Validade</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">
                    {daysLeft === null ? "—" : `${daysLeft} dia(s)`}
                  </p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Controle o prazo de aceitação para manter a proposta atualizada.
                  </p>
                </CardContent>
              </Card>

              <Card className="surface-panel">
                <CardContent className="p-5">
                  <p className="section-kicker">Persistência</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">Local</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    Seus dados ficam no navegador e podem ser retomados sem depender de servidor.
                  </p>
                </CardContent>
              </Card>
            </div>

            <ProposalForm />
            <ItemsTable />

            <Card className="overflow-hidden">
              <CardContent className="border-b border-border/70 bg-muted/20 px-6 py-5">
                <p className="section-kicker">Fechamento</p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">Salvar e exportar</h2>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Finalize a proposta com segurança, preserve o rascunho e gere a versão em PDF
                  quando estiver satisfeito com a revisão.
                </p>
              </CardContent>

              <CardContent className="space-y-5 pt-6">
                {!validation.isValid && (
                  <div
                    role="alert"
                    className="flex items-start gap-3 rounded-2xl border border-amber-200/90 bg-[linear-gradient(180deg,#fffaf0,#fff6e5)] px-4 py-3 text-sm text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/30 dark:text-amber-200"
                  >
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <div>
                      <p className="font-semibold">Existem campos que ainda precisam de atenção.</p>
                      <p className="mt-1 leading-6">
                        Você ainda pode salvar a proposta, mas o documento ficará incompleto em
                        pontos importantes.
                      </p>
                    </div>
                  </div>
                )}

                {daysLeft !== null && daysLeft >= 0 && daysLeft <= 15 && (
                  <div
                    role="status"
                    className="flex items-start gap-3 rounded-2xl border border-[#e7d0a9] bg-[linear-gradient(180deg,#fffaf2,#fff4e2)] px-4 py-3 text-sm text-[#8a5c16] dark:border-orange-900/60 dark:bg-orange-950/30 dark:text-orange-200"
                  >
                    <Clock3 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                    <div>
                      <p className="font-semibold">
                        {daysLeft === 0
                          ? "A proposta vence hoje."
                          : `A proposta vence em ${daysLeft} dia(s).`}
                      </p>
                      <p className="mt-1 leading-6">
                        Revise os dados antes de compartilhar para evitar enviar uma versão próxima
                        do vencimento.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_auto_auto]">
                  <Button variant="outline" onClick={handleSaveDraft} className="w-full gap-2">
                    <FileText className="h-4 w-4" aria-hidden />
                    Salvar rascunho
                  </Button>

                  <Button onClick={handleSaveProposal} className="w-full gap-2">
                    <Save className="h-4 w-4" aria-hidden />
                    Salvar proposta
                  </Button>

                  <Button
                    variant="secondary"
                    onClick={handleGeneratePDF}
                    disabled={generating}
                    className="w-full gap-2"
                  >
                    {generating ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Download className="h-4 w-4" aria-hidden />
                    )}
                    {generating ? "Gerando..." : "Gerar PDF"}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleReset}
                    className="w-full gap-2 text-destructive hover:text-destructive"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden />
                    Limpar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>

          <aside
            className="space-y-6 xl:sticky xl:top-6 xl:self-start"
            aria-label="Prévia da proposta"
          >
            <Card className="overflow-hidden">
              <CardContent className="border-b border-border/70 bg-muted/20 px-6 py-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="section-kicker">Documento</p>
                    <div className="mt-1 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" aria-hidden />
                      <h2 className="text-lg font-semibold text-foreground">
                        Prévia em tempo real
                      </h2>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      Use esta área para revisar a aparência final do documento antes de salvar ou
                      exportar.
                    </p>
                  </div>
                  {validation.isValid ? (
                    <Badge variant="success">
                      <CheckCircle2 className="mr-1 h-3.5 w-3.5" aria-hidden />
                      Completa
                    </Badge>
                  ) : (
                    <Badge variant="warning">Em revisão</Badge>
                  )}
                </div>
              </CardContent>

              <CardContent className="space-y-4 pt-6">
                <div className="rounded-[1.5rem] border border-border/70 bg-[linear-gradient(180deg,rgba(31,75,122,0.05),rgba(255,255,255,0.92))] p-3">
                  <div className="mb-3 flex items-center justify-between rounded-2xl border border-border/70 bg-background/80 px-4 py-2.5 text-xs text-muted-foreground">
                    <span>Visualização do documento</span>
                    <span className="font-medium text-foreground">
                      {proposal.meta.number || "Sem número"}
                    </span>
                  </div>
                  <div className="max-h-[58vh] overflow-y-auto rounded-[1.2rem] border border-[#cfd9e4] bg-white shadow-[0_28px_60px_-38px_rgba(15,23,42,0.35)] sm:max-h-[64vh] xl:max-h-[78vh]">
                    <ProposalPreview />
                  </div>
                </div>

                <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
                  <p className="section-kicker">Boas práticas</p>
                  <ul className="mt-2 space-y-2 text-sm leading-6 text-muted-foreground">
                    <li>Revise título, escopo e valores antes de gerar o PDF.</li>
                    <li>Use a validade para deixar claro até quando a proposta se mantém ativa.</li>
                    <li>Preencha as assinaturas se quiser um fechamento mais formal.</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>

        <section className="mt-10" aria-labelledby="saved-heading">
          <div className="mb-4">
            <p className="section-kicker">Continuidade</p>
            <h2 id="saved-heading" className="mt-1 text-2xl font-semibold text-foreground">
              Propostas salvas
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Mantenha um histórico de documentos para reaproveitar informações e acelerar novas
              negociações.
            </p>
          </div>
          <SavedProposalsTable />
        </section>

        <CertificateLinksSection />

        <footer className="mt-12 border-t border-border/70 py-6 text-center text-sm text-muted-foreground">
          <p>PropostaSimples · uma forma mais organizada de apresentar propostas comerciais.</p>
          <p className="mt-1">
            Os dados permanecem apenas no seu navegador. Nenhuma informação é enviada para
            servidores.
          </p>
        </footer>
      </div>
    </div>
  );
}

export default function ProposalWorkspacePage() {
  return (
    <ProposalProvider>
      <ProposalWorkspaceContent />
    </ProposalProvider>
  );
}
