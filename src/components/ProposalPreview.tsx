import { useProposal } from "@/context/ProposalContext";
import { formatBRL, isoToBR } from "@/utils/sanitize";

export function ProposalPreview() {
  const { proposal } = useProposal();
  const { meta, provider, client, proposal: details, items, totals } = proposal;

  return (
    <article
      className="bg-white font-sans text-[11px] leading-relaxed text-[#17202a]"
      aria-label="Prévia da proposta"
      style={{ minWidth: 320 }}
    >
      {/* Header */}
      <header className="bg-[#1f4b7a] px-8 py-6 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold uppercase tracking-wider">
              {details.title || "Proposta Comercial"}
            </h1>
            <p className="mt-1 text-[#d8e4ef] text-xs">
              {provider.name || "Prestador de Serviços"}
            </p>
          </div>
          <div className="shrink-0 text-right text-xs text-[#d8e4ef]">
            <p className="font-semibold text-white">Nº {meta.number || "—"}</p>
            <p>Emissão: {isoToBR(meta.issueDate) || "—"}</p>
            <p>Validade: {isoToBR(meta.validityDate) || "—"}</p>
          </div>
        </div>
      </header>

      <div className="px-8 py-6 space-y-6">
        {/* Parties */}
        <div className="grid grid-cols-2 gap-6">
          {/* Provider */}
          <section>
            <h2 className="mb-2 border-b border-[#1f4b7a]/20 pb-1 text-[9px] font-bold uppercase tracking-widest text-[#1f4b7a]">
              Prestador
            </h2>
            <div className="space-y-0.5 text-[10px]">
              <p className="font-semibold">{provider.name || "—"}</p>
              {provider.cpfCnpj && <p>CPF/CNPJ: {provider.cpfCnpj}</p>}
              {provider.im && <p>IM: {provider.im}</p>}
              {provider.email && <p>E-mail: {provider.email}</p>}
              {provider.phone && <p>Tel: {provider.phone}</p>}
              {provider.address.street && (
                <p className="text-gray-600">
                  {provider.address.street}, {provider.address.number}
                  {provider.address.complement && `, ${provider.address.complement}`} —{" "}
                  {provider.address.district}, {provider.address.city}/{provider.address.uf}{" "}
                  {provider.address.cep}
                </p>
              )}
            </div>
          </section>

          {/* Client */}
          <section>
            <h2 className="mb-2 border-b border-[#1f4b7a]/20 pb-1 text-[9px] font-bold uppercase tracking-widest text-[#1f4b7a]">
              Cliente
            </h2>
            <div className="space-y-0.5 text-[10px]">
              <p className="font-semibold">{client.name || "—"}</p>
              {client.cpfCnpj && <p>CPF/CNPJ: {client.cpfCnpj}</p>}
              {client.email && <p>E-mail: {client.email}</p>}
              {client.phone && <p>Tel: {client.phone}</p>}
              {client.address.street && (
                <p className="text-gray-600">
                  {client.address.street}, {client.address.number}
                  {client.address.complement && `, ${client.address.complement}`} —{" "}
                  {client.address.district}, {client.address.city}/{client.address.uf}{" "}
                  {client.address.cep}
                </p>
              )}
            </div>
          </section>
        </div>

        {/* Scope */}
        {details.scope && (
          <section>
            <h2 className="mb-2 border-b border-[#1f4b7a]/20 pb-1 text-[9px] font-bold uppercase tracking-widest text-[#1f4b7a]">
              Escopo dos Serviços
            </h2>
            <p className="text-[10px] whitespace-pre-wrap leading-relaxed">{details.scope}</p>
          </section>
        )}

        {/* Items */}
        {items.length > 0 && (
          <section>
            <h2 className="mb-2 border-b border-[#1f4b7a]/20 pb-1 text-[9px] font-bold uppercase tracking-widest text-[#1f4b7a]">
              Itens
            </h2>
            <table className="w-full text-[10px]">
              <thead>
                <tr className="bg-[#1f4b7a]/10">
                  <th className="py-1.5 px-2 text-left font-semibold">Descrição</th>
                  <th className="py-1.5 px-2 text-center font-semibold">Qtd.</th>
                  <th className="py-1.5 px-2 text-center font-semibold">Un.</th>
                  <th className="py-1.5 px-2 text-right font-semibold">Preço Un.</th>
                  <th className="py-1.5 px-2 text-right font-semibold">Desc.</th>
                  <th className="py-1.5 px-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={item.id} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="py-1.5 px-2">{item.description}</td>
                    <td className="py-1.5 px-2 text-center">{item.qty}</td>
                    <td className="py-1.5 px-2 text-center">{item.unit || "un"}</td>
                    <td className="py-1.5 px-2 text-right">{formatBRL(item.unitPrice)}</td>
                    <td className="py-1.5 px-2 text-right">
                      {item.discountPct > 0 ? `${item.discountPct}%` : "—"}
                    </td>
                    <td className="py-1.5 px-2 text-right font-semibold">{formatBRL(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals */}
            <div className="mt-2 ml-auto w-48 space-y-1 text-[10px]">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatBRL(totals.subtotal)}</span>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Descontos</span>
                  <span>- {formatBRL(totals.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-[#1f4b7a]/20 pt-1 font-bold text-[#1f4b7a]">
                <span>Total</span>
                <span>{formatBRL(totals.total)}</span>
              </div>
            </div>
          </section>
        )}

        {/* Conditions */}
        {(details.executionTime || details.payment || details.warranty) && (
          <section>
            <h2 className="mb-2 border-b border-[#1f4b7a]/20 pb-1 text-[9px] font-bold uppercase tracking-widest text-[#1f4b7a]">
              Condições Comerciais
            </h2>
            <div className="grid grid-cols-2 gap-4 text-[10px]">
              {details.executionTime && (
                <div>
                  <p className="font-semibold text-gray-700">Prazo de execução</p>
                  <p>{details.executionTime}</p>
                </div>
              )}
              {details.payment && (
                <div>
                  <p className="font-semibold text-gray-700">Pagamento</p>
                  <p>{details.payment}</p>
                </div>
              )}
              {details.warranty && (
                <div>
                  <p className="font-semibold text-gray-700">Garantia</p>
                  <p>{details.warranty}</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Notes */}
        {details.notes && (
          <section>
            <h2 className="mb-2 border-b border-[#1f4b7a]/20 pb-1 text-[9px] font-bold uppercase tracking-widest text-[#1f4b7a]">
              Observações
            </h2>
            <p className="text-[10px] whitespace-pre-wrap">{details.notes}</p>
          </section>
        )}

        {/* Pay link */}
        {details.payLink && (
          <section>
            <h2 className="mb-1 border-b border-[#1f4b7a]/20 pb-1 text-[9px] font-bold uppercase tracking-widest text-[#1f4b7a]">
              Link de Pagamento
            </h2>
            <p className="break-all text-[10px] text-[#245c8e]">{details.payLink}</p>
          </section>
        )}

        {/* Place & date */}
        {meta.placeAndDate && (
          <p className="text-right text-[10px] text-gray-600">{meta.placeAndDate}</p>
        )}

        {/* Signatures */}
        {(details.signatures.providerName || details.signatures.clientName) && (
          <section className="mt-6 grid grid-cols-2 gap-8">
            {(["providerName", "clientName"] as const).map((key) => {
              const name = details.signatures[key];
              if (!name) return null;
              return (
                <div key={key} className="text-center text-[10px]">
                  <div className="mb-1 border-t border-gray-400 pt-1">
                    <p className="font-semibold">{name}</p>
                    <p className="text-gray-500">{key === "providerName" ? "Prestador" : "Cliente"}</p>
                  </div>
                </div>
              );
            })}
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-[#1f4b7a]/5 px-8 py-3 text-center text-[8px] text-gray-500">
        Proposta gerada pelo PropostaSimples · Dados armazenados localmente
      </footer>
    </article>
  );
}
