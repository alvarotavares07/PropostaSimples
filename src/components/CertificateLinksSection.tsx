import { ExternalLink, FileBadge2, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface LinkItem {
  label: string;
  href: string;
}

interface LinkGroup {
  title: string;
  items: LinkItem[];
}

const FEDERAL_CND_URL = "https://www.gov.br/pt-br/servicos/emitir-certidao-de-regularidade-fiscal";

const linkGroups: LinkGroup[] = [
  {
    title: "Receita Federal / PGFN",
    items: [
      {
        label: "CNPJ - Emissão de Comprovante de Inscrição e de Situação Cadastral",
        href: "https://solucoes.receita.fazenda.gov.br/servicos/cnpjreva/cnpjreva_solicitacao.asp",
      },
      {
        label: "Certidão Conjunta (CND) - Tributos Federais e Dívida Ativa",
        href: FEDERAL_CND_URL,
      },
      {
        label: "e-CAC - Área do Contribuinte",
        href: "https://www.gov.br/receitafederal/pt-br/canais_atendimento/atendimento-virtual",
      },
    ],
  },
  {
    title: "FGTS / CAIXA",
    items: [
      {
        label: "CRF - Certificado de Regularidade do FGTS",
        href: "https://www.fgts.gov.br/Paginas/empregador/certificado-de-regularidade-do-fgts-crf.aspx",
      },
    ],
  },
  {
    title: "Previdenciária / Trabalhista",
    items: [
      {
        label: "Consulta de Regularidade Previdenciária (CND INSS)",
        href: FEDERAL_CND_URL,
      },
    ],
  },
  {
    title: "Estadual / ICMS",
    items: [
      {
        label: "SINTEGRA - Inscrição Estadual / SEFAZ por UF",
        href: "http://www.sintegra.gov.br/insc_est.html",
      },
    ],
  },
  {
    title: "Assinatura digital",
    items: [
      {
        label: "gov.br - Assinatura eletrônica",
        href: "https://www.gov.br/pt-br/servicos/assinatura-eletronica",
      },
    ],
  },
  {
    title: "Outros",
    items: [
      {
        label: "Junta Comercial - Consulta por estado",
        href: "https://www.gov.br/empresas-e-negocios/pt-br/drei/juntas-comerciais",
      },
    ],
  },
];

function ExternalResourceLink({ href, label }: LinkItem) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group flex min-h-14 items-start gap-3 rounded-2xl border border-border/70 bg-background/80 px-4 py-3 text-sm text-foreground transition-all duration-200",
        "hover:-translate-y-0.5 hover:border-primary/25 hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      )}
      aria-label={`${label} (abre em nova aba)`}
    >
      <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-primary" aria-hidden />
      <span className="leading-6">{label}</span>
    </a>
  );
}

export function CertificateLinksSection() {
  return (
    <section className="mt-10" aria-labelledby="cert-links-heading">
      <Card className="overflow-hidden">
        <CardContent className="border-b border-border/70 bg-gradient-to-r from-primary/10 via-card to-card px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-2xl bg-primary/10 p-3 text-primary">
              <FileBadge2 className="h-5 w-5" aria-hidden />
            </div>
            <div className="space-y-1">
              <p className="section-kicker">Apoio operacional</p>
              <h2 id="cert-links-heading" className="font-display text-2xl font-bold tracking-tight text-foreground">
                Links úteis para emissão de certidões
              </h2>
              <p className="max-w-3xl text-sm leading-6 text-muted-foreground">
                Acesse portais oficiais para emitir comprovantes, certidões e consultas úteis ao dia a dia do MEI. Todos os links abrem em nova aba.
              </p>
            </div>
          </div>
        </CardContent>

        <CardContent className="space-y-6 pt-6">
          <div className="rounded-2xl border border-border/70 bg-muted/20 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <div>
                <p className="font-semibold text-foreground">Curadoria com foco em confiança</p>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Esta área centraliza atalhos úteis para reduzir atrito operacional e deixar a rotina comercial mais ágil sem sair do produto.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            {linkGroups.map((group) => (
              <div key={group.title} className="space-y-3">
                <div>
                  <h3 className="border-b border-border/70 pb-2 text-base font-semibold text-foreground">
                    {group.title}
                  </h3>
                </div>
                <div className="space-y-3">
                  {group.items.map((item) => (
                    <ExternalResourceLink key={item.href} {...item} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
