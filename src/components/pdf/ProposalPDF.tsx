import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ProposalState } from "@/types/proposal";
import { formatBRL, isoToBR } from "@/utils/sanitize";

const BLUE = "#1f4b7a";
const BLUE_SOFT = "#edf3f8";
const BLUE_LINE = "#d7e1ea";
const TEXT = "#17202a";
const MUTED = "#607284";
const BORDER = "#d6dde5";
const SUCCESS = "#1f8a5b";

const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: TEXT,
    paddingBottom: 44,
    backgroundColor: "#ffffff",
  },
  topBand: {
    height: 10,
    backgroundColor: BLUE,
  },
  header: {
    paddingHorizontal: 36,
    paddingTop: 22,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: BLUE_LINE,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 18,
  },
  brandBlock: {
    flex: 1,
  },
  overline: {
    fontSize: 7.2,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: MUTED,
    marginBottom: 6,
  },
  headerTitle: {
    color: BLUE,
    fontSize: 17,
    fontFamily: "Helvetica-Bold",
    lineHeight: 1.2,
  },
  headerSubtitle: {
    marginTop: 5,
    fontSize: 8.2,
    color: MUTED,
    lineHeight: 1.4,
  },
  metaCard: {
    width: 170,
    borderWidth: 1,
    borderColor: BLUE_LINE,
    backgroundColor: BLUE_SOFT,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 9,
  },
  metaLabel: {
    fontSize: 6.8,
    textTransform: "uppercase",
    letterSpacing: 0.9,
    color: MUTED,
    marginBottom: 2,
  },
  metaValue: {
    fontSize: 8.2,
    color: TEXT,
    fontFamily: "Helvetica-Bold",
    marginBottom: 5,
  },
  body: {
    paddingHorizontal: 36,
    paddingTop: 18,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 7.2,
    color: BLUE,
    fontFamily: "Helvetica-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: BLUE_LINE,
    marginBottom: 7,
  },
  sectionHeader: {
    marginBottom: 4,
  },
  row2: {
    flexDirection: "row",
    gap: 16,
  },
  col: {
    flex: 1,
  },
  infoCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  partyName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.2,
    color: TEXT,
    marginBottom: 3,
  },
  partyDetail: {
    fontSize: 8,
    color: MUTED,
    marginBottom: 2,
    lineHeight: 1.4,
  },
  scopeText: {
    fontSize: 8.4,
    lineHeight: 1.6,
    color: TEXT,
  },
  table: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: BLUE_SOFT,
    paddingHorizontal: 6,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: BLUE_LINE,
  },
  tableHeaderCell: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.4,
    color: BLUE,
  },
  tableRow: {
    flexDirection: "row",
    paddingHorizontal: 6,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#eef2f6",
  },
  tableRowAlt: {
    backgroundColor: "#fbfcfd",
  },
  cellDesc: {
    flex: 3.2,
  },
  cellCenter: {
    flex: 0.9,
    textAlign: "center",
  },
  cellRight: {
    flex: 1.1,
    textAlign: "right",
  },
  tableCell: {
    fontSize: 8,
    color: TEXT,
  },
  tableCellMuted: {
    fontSize: 8,
    color: MUTED,
  },
  totalWrapper: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalCard: {
    width: 188,
    borderWidth: 1,
    borderColor: BLUE_LINE,
    borderRadius: 8,
    backgroundColor: BLUE_SOFT,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  totalLabel: {
    fontSize: 8,
    color: MUTED,
  },
  totalValue: {
    fontSize: 8,
    color: TEXT,
  },
  totalValueSuccess: {
    fontSize: 8,
    color: SUCCESS,
  },
  totalFinalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: BLUE_LINE,
    marginTop: 4,
    paddingTop: 6,
  },
  totalFinalLabel: {
    fontSize: 9,
    color: BLUE,
    fontFamily: "Helvetica-Bold",
  },
  totalFinalValue: {
    fontSize: 10,
    color: BLUE,
    fontFamily: "Helvetica-Bold",
  },
  conditionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  conditionCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 10,
    backgroundColor: "#ffffff",
  },
  conditionLabel: {
    fontSize: 7.2,
    color: MUTED,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  conditionValue: {
    fontSize: 8.1,
    lineHeight: 1.45,
    color: TEXT,
  },
  notesCard: {
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    padding: 10,
  },
  noteText: {
    fontSize: 8.1,
    lineHeight: 1.6,
    color: TEXT,
  },
  payLink: {
    fontSize: 8,
    lineHeight: 1.5,
    color: BLUE,
  },
  placeAndDate: {
    marginTop: 8,
    fontSize: 8,
    color: MUTED,
    textAlign: "right",
  },
  signatures: {
    flexDirection: "row",
    gap: 22,
    marginTop: 38,
  },
  signatureCol: {
    flex: 1,
  },
  signatureLine: {
    borderTopWidth: 1,
    borderTopColor: "#9fb0bf",
    paddingTop: 6,
    alignItems: "center",
  },
  signatureName: {
    fontSize: 8.2,
    color: TEXT,
    fontFamily: "Helvetica-Bold",
  },
  signatureRole: {
    fontSize: 7.4,
    color: MUTED,
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    left: 36,
    right: 36,
    bottom: 16,
    borderTopWidth: 1,
    borderTopColor: BLUE_LINE,
    paddingTop: 6,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  footerText: {
    fontSize: 6.5,
    color: "#8a99a8",
  },
  pageNumber: {
    fontSize: 6.5,
    color: "#8a99a8",
  },
});

interface Props {
  proposal: ProposalState;
}

export function ProposalPDF({ proposal }: Props) {
  const { meta, provider, client, proposal: details, items, totals } = proposal;

  function partyAddress(addr: typeof provider.address) {
    const parts = [addr.street, addr.number, addr.complement, addr.district].filter(Boolean);
    const city = [addr.city, addr.uf].filter(Boolean).join("/");
    return [parts.join(", "), city, addr.cep].filter(Boolean).join(" — ");
  }

  function SectionHeading({ title }: { title: string }) {
    return (
      <View style={s.sectionHeader}>
        <Text style={s.sectionTitle}>{title}</Text>
        <View style={s.sectionDivider} />
      </View>
    );
  }

  return (
    <Document title={`Proposta ${meta.number}`} author={provider.name} subject={details.title}>
      <Page size="A4" style={s.page}>
        <View style={s.topBand} fixed />

        <View style={s.header}>
          <View style={s.headerRow}>
            <View style={s.brandBlock}>
              <Text style={s.overline}>Proposta comercial</Text>
              <Text style={s.headerTitle}>{details.title || "Proposta Comercial"}</Text>
              <Text style={s.headerSubtitle}>{provider.name || "Prestador de Serviços"}</Text>
            </View>

            <View style={s.metaCard}>
              <Text style={s.metaLabel}>Número</Text>
              <Text style={s.metaValue}>{meta.number || "—"}</Text>

              <Text style={s.metaLabel}>Emissão</Text>
              <Text style={s.metaValue}>{isoToBR(meta.issueDate) || "—"}</Text>

              <Text style={s.metaLabel}>Validade</Text>
              <Text style={[s.metaValue, { marginBottom: 0 }]}>
                {isoToBR(meta.validityDate) || "—"}
              </Text>
            </View>
          </View>
        </View>

        <View style={s.body}>
          <View style={s.section}>
            <SectionHeading title="Partes envolvidas" />
            <View style={s.row2}>
              <View style={[s.col, s.infoCard]}>
                <Text style={s.partyName}>{provider.name || "—"}</Text>
                {provider.cpfCnpj ? (
                  <Text style={s.partyDetail}>CPF/CNPJ: {provider.cpfCnpj}</Text>
                ) : null}
                {provider.im ? <Text style={s.partyDetail}>IM: {provider.im}</Text> : null}
                {provider.email ? (
                  <Text style={s.partyDetail}>E-mail: {provider.email}</Text>
                ) : null}
                {provider.phone ? (
                  <Text style={s.partyDetail}>Telefone: {provider.phone}</Text>
                ) : null}
                {provider.address.street ? (
                  <Text style={s.partyDetail}>{partyAddress(provider.address)}</Text>
                ) : null}
              </View>

              <View style={[s.col, s.infoCard]}>
                <Text style={s.partyName}>{client.name || "—"}</Text>
                {client.cpfCnpj ? (
                  <Text style={s.partyDetail}>CPF/CNPJ: {client.cpfCnpj}</Text>
                ) : null}
                {client.email ? <Text style={s.partyDetail}>E-mail: {client.email}</Text> : null}
                {client.phone ? <Text style={s.partyDetail}>Telefone: {client.phone}</Text> : null}
                {client.address.street ? (
                  <Text style={s.partyDetail}>{partyAddress(client.address)}</Text>
                ) : null}
              </View>
            </View>
          </View>

          {details.scope ? (
            <View style={s.section}>
              <SectionHeading title="Escopo dos serviços" />
              <Text style={s.scopeText}>{details.scope}</Text>
            </View>
          ) : null}

          {items.length > 0 ? (
            <View style={s.section}>
              <SectionHeading title="Itens da proposta" />

              <View style={s.table}>
                <View style={s.tableHeader}>
                  <Text style={[s.tableHeaderCell, s.cellDesc]}>Descrição</Text>
                  <Text style={[s.tableHeaderCell, s.cellCenter]}>Qtd.</Text>
                  <Text style={[s.tableHeaderCell, s.cellCenter]}>Un.</Text>
                  <Text style={[s.tableHeaderCell, s.cellRight]}>Preço Un.</Text>
                  <Text style={[s.tableHeaderCell, s.cellRight]}>Desc.</Text>
                  <Text style={[s.tableHeaderCell, s.cellRight]}>Total</Text>
                </View>

                {items.map((item, i) => (
                  <View key={item.id} style={[s.tableRow, i % 2 !== 0 ? s.tableRowAlt : {}]}>
                    <Text style={[s.tableCell, s.cellDesc]}>{item.description}</Text>
                    <Text style={[s.tableCellMuted, s.cellCenter]}>{item.qty}</Text>
                    <Text style={[s.tableCellMuted, s.cellCenter]}>{item.unit || "un"}</Text>
                    <Text style={[s.tableCellMuted, s.cellRight]}>{formatBRL(item.unitPrice)}</Text>
                    <Text style={[s.tableCellMuted, s.cellRight]}>
                      {item.discountPct > 0 ? `${item.discountPct}%` : "—"}
                    </Text>
                    <Text style={[s.tableCell, s.cellRight, { fontFamily: "Helvetica-Bold" }]}>
                      {formatBRL(item.lineTotal)}
                    </Text>
                  </View>
                ))}
              </View>

              <View style={s.totalWrapper}>
                <View style={s.totalCard}>
                  <View style={s.totalRow}>
                    <Text style={s.totalLabel}>Subtotal</Text>
                    <Text style={s.totalValue}>{formatBRL(totals.subtotal)}</Text>
                  </View>
                  {totals.discount > 0 ? (
                    <View style={s.totalRow}>
                      <Text style={s.totalLabel}>Descontos</Text>
                      <Text style={s.totalValueSuccess}>- {formatBRL(totals.discount)}</Text>
                    </View>
                  ) : null}
                  <View style={s.totalFinalRow}>
                    <Text style={s.totalFinalLabel}>Total</Text>
                    <Text style={s.totalFinalValue}>{formatBRL(totals.total)}</Text>
                  </View>
                </View>
              </View>
            </View>
          ) : null}

          {details.executionTime || details.payment || details.warranty ? (
            <View style={s.section}>
              <SectionHeading title="Condições comerciais" />
              <View style={s.conditionGrid}>
                {details.executionTime ? (
                  <View style={s.conditionCard}>
                    <Text style={s.conditionLabel}>Prazo de execução</Text>
                    <Text style={s.conditionValue}>{details.executionTime}</Text>
                  </View>
                ) : null}

                {details.payment ? (
                  <View style={s.conditionCard}>
                    <Text style={s.conditionLabel}>Condições de pagamento</Text>
                    <Text style={s.conditionValue}>{details.payment}</Text>
                  </View>
                ) : null}

                {details.warranty ? (
                  <View style={s.conditionCard}>
                    <Text style={s.conditionLabel}>Garantia</Text>
                    <Text style={s.conditionValue}>{details.warranty}</Text>
                  </View>
                ) : null}
              </View>
            </View>
          ) : null}

          {details.notes ? (
            <View style={s.section}>
              <SectionHeading title="Observações" />
              <View style={s.notesCard}>
                <Text style={s.noteText}>{details.notes}</Text>
              </View>
            </View>
          ) : null}

          {details.payLink ? (
            <View style={s.section}>
              <SectionHeading title="Link de pagamento" />
              <View style={s.notesCard}>
                <Text style={s.payLink}>{details.payLink}</Text>
              </View>
            </View>
          ) : null}

          {meta.placeAndDate ? <Text style={s.placeAndDate}>{meta.placeAndDate}</Text> : null}

          {details.signatures.providerName || details.signatures.clientName ? (
            <View style={s.signatures}>
              {(["providerName", "clientName"] as const).map((key) => {
                const name = details.signatures[key];
                if (!name) return <View key={key} style={s.signatureCol} />;
                return (
                  <View key={key} style={s.signatureCol}>
                    <View style={s.signatureLine}>
                      <Text style={s.signatureName}>{name}</Text>
                      <Text style={s.signatureRole}>
                        {key === "providerName" ? "Prestador" : "Cliente"}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ) : null}
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>PropostaSimples · Proposta nº {meta.number}</Text>
          <Text
            style={s.pageNumber}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
