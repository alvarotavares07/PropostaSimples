import { expect, test } from "@playwright/test";

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:4173";

test.describe("PropostaSimples — fluxo principal", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE);
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test("exibe o hero principal da aplicação", async ({ page }) => {
    await expect(
      page.getByRole("heading", {
        name: /Crie propostas profissionais com rapidez, organização e confiança/i,
      }),
    ).toBeVisible();
  });

  test("formulário tem campos acessíveis por label", async ({ page }) => {
    await expect(page.getByLabel(/número da proposta/i)).toBeVisible();
    await expect(page.getByLabel(/nome \/ razão social/i).first()).toBeVisible();
    await expect(page.getByLabel(/título da proposta/i)).toBeVisible();
    await expect(page.getByLabel(/descrição do item 1/i)).toBeVisible();
  });

  test("preenche dados básicos e preview atualiza", async ({ page }) => {
    await page.getByLabel(/nome \/ razão social/i).first().fill("João MEI Serviços");
    await page.getByLabel(/título da proposta/i).fill("Desenvolvimento de Sistema");

    const preview = page.locator('article[aria-label="Prévia da proposta"]');
    await expect(preview.getByText("João MEI Serviços").first()).toBeVisible();
    await expect(preview.getByText("Desenvolvimento de Sistema")).toBeVisible();
  });

  test("calcula total do item inicial", async ({ page }) => {
    await page.getByLabel(/descrição do item 1/i).fill("Serviço de consultoria");
    await page.getByLabel(/quantidade do item 1/i).fill("2");
    await page.getByLabel(/preço unitário do item 1/i).fill("500");

    await expect(page.getByLabel(/total do item 1: r\$/i)).toContainText("1.000,00");
  });

  test("remove o item inicial e volta ao estado vazio", async ({ page }) => {
    await page.getByLabel(/descrição do item 1/i).fill("Item para remover");
    await page.getByRole("button", { name: /remover item 1/i }).click();

    await expect(page.getByText("Item para remover")).not.toBeVisible();
    await expect(page.getByText(/nenhum item adicionado/i)).toBeVisible();
  });

  test("salva rascunho e persiste após reload", async ({ page }) => {
    await page.getByLabel(/nome \/ razão social/i).first().fill("Prestador Teste");
    await page.reload();
    await expect(page.getByLabel(/nome \/ razão social/i).first()).toHaveValue("Prestador Teste");
  });

  test("máscara de CPF/CNPJ funciona", async ({ page }) => {
    const cpfInput = page.getByLabel(/cpf \/ cnpj/i).first();
    await cpfInput.fill("12345678901");
    await expect(cpfInput).toHaveValue("123.456.789-01");
  });

  test("máscara de telefone funciona", async ({ page }) => {
    const phoneInput = page.getByLabel(/telefone/i).first();
    await phoneInput.fill("31999998888");
    await expect(phoneInput).toHaveValue("(31) 99999-8888");
  });

  test("máscara de CEP funciona", async ({ page }) => {
    const cepInput = page.getByLabel(/cep/i).first();
    await cepInput.fill("30130010");
    await expect(cepInput).toHaveValue("30130-010");
  });

  test("proposta salva aparece na tabela de propostas", async ({ page }) => {
    await page.getByLabel(/número da proposta/i).fill("PS-TESTE-001");
    await page.getByLabel(/nome \/ razão social/i).first().fill("Prestador");
    await page.getByLabel(/cpf \/ cnpj/i).first().fill("12345678901");
    await page.getByLabel(/e-mail/i).first().fill("prestador@teste.com");
    await page.getByLabel(/nome \/ razão social/i).nth(1).fill("Cliente");
    await page.getByLabel(/cpf \/ cnpj/i).nth(1).fill("12345678901");
    await page.getByLabel(/título da proposta/i).fill("Proposta Teste");
    await page.getByLabel(/escopo dos serviços/i).fill("Escopo de teste completo aqui.");
    await page.getByLabel(/prazo de execução/i).fill("30 dias");
    await page.getByLabel(/condições de pagamento/i).fill("À vista");
    await page.getByLabel(/descrição do item 1/i).fill("Item");
    await page.getByLabel(/quantidade do item 1/i).fill("1");
    await page.getByLabel(/preço unitário do item 1/i).fill("100");

    await page.getByRole("button", { name: /salvar proposta/i }).click();

    const savedTable = page.getByRole("table", { name: /propostas salvas/i });
    await expect(savedTable.getByRole("cell", { name: "PS-TESTE-001", exact: true })).toBeVisible();
  });

  test("link de pagamento rejeita http", async ({ page }) => {
    const payLinkInput = page.getByLabel(/link de pagamento/i);
    await payLinkInput.fill("http://insecure.com");
    await expect(payLinkInput).not.toHaveValue("http://insecure.com");
  });

  test("botão limpar pede confirmação", async ({ page }) => {
    page.on("dialog", (dialog) => dialog.dismiss());

    await page.getByLabel(/nome \/ razão social/i).first().fill("Não deve sumir");
    await page.getByRole("button", { name: /limpar/i }).click();

    await expect(page.getByLabel(/nome \/ razão social/i).first()).toHaveValue("Não deve sumir");
  });

  test("limpar remove também as propostas salvas do navegador", async ({ page }) => {
    page.on("dialog", (dialog) => dialog.accept());

    await page.getByLabel(/número da proposta/i).fill("PS-PRIV-001");
    await page.getByLabel(/nome \/ razão social/i).first().fill("Prestador");
    await page.getByLabel(/cpf \/ cnpj/i).first().fill("12345678901");
    await page.getByLabel(/e-mail/i).first().fill("prestador@teste.com");
    await page.getByLabel(/nome \/ razão social/i).nth(1).fill("Cliente");
    await page.getByLabel(/cpf \/ cnpj/i).nth(1).fill("12345678901");
    await page.getByLabel(/título da proposta/i).fill("Proposta Privada");
    await page.getByLabel(/escopo dos serviços/i).fill("Escopo completo.");
    await page.getByLabel(/prazo de execução/i).fill("30 dias");
    await page.getByLabel(/condições de pagamento/i).fill("À vista");
    await page.getByLabel(/descrição do item 1/i).fill("Item");
    await page.getByLabel(/quantidade do item 1/i).fill("1");
    await page.getByLabel(/preço unitário do item 1/i).fill("100");

    await page.getByRole("button", { name: /salvar proposta/i }).click();
    await expect(page.getByRole("cell", { name: "PS-PRIV-001", exact: true })).toBeVisible();

    await page.getByRole("button", { name: /limpar/i }).click();
    await page.reload();

    await expect(page.getByText(/nenhuma proposta salva ainda/i)).toBeVisible();
    await expect(page.getByRole("cell", { name: "PS-PRIV-001", exact: true })).toHaveCount(0);
  });

  test("404 page renderiza corretamente", async ({ page }) => {
    await page.goto(`${BASE}/pagina-inexistente`);
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
    await expect(page.getByRole("link", { name: /voltar ao início/i })).toBeVisible();
  });
});
