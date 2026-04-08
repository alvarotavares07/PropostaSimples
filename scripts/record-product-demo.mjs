import { mkdir, rename } from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const BASE_URL = process.env.DEMO_BASE_URL ?? "http://127.0.0.1:4173/proposta-simples/";
const outputDir = path.resolve("artifacts");
const videoDir = path.join(outputDir, "raw-video");
const finalVideoPath = path.join(outputDir, "linkedin-demo.webm");

const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fillField(locator, value, pauseMs = 220) {
  await locator.click();
  await locator.fill(value);
  await pause(pauseMs);
}

async function main() {
  await mkdir(videoDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 960 },
    recordVideo: {
      dir: videoDir,
      size: { width: 1440, height: 960 },
    },
    acceptDownloads: true,
  });

  const page = await context.newPage();

  try {
    await page.goto(BASE_URL, { waitUntil: "networkidle" });
    await page.evaluate(() => localStorage.clear());
    await page.reload({ waitUntil: "networkidle" });

    await pause(1500);

    await fillField(page.getByLabel(/nome \/ razão social/i).first(), "Alvaro Studio Digital");
    await fillField(page.getByLabel(/cpf \/ cnpj/i).first(), "12345678901");
    await fillField(page.getByLabel(/e-mail/i).first(), "contato@alvarostudio.com");
    await fillField(page.getByLabel(/telefone/i).first(), "31999998888");

    await fillField(page.getByLabel(/nome \/ razão social/i).nth(1), "Clinica Aurora");
    await fillField(page.getByLabel(/cpf \/ cnpj/i).nth(1), "98765432100");

    await fillField(page.getByLabel(/título da proposta/i), "Proposta para landing page e identidade visual");
    await fillField(
      page.getByLabel(/escopo dos serviços/i),
      "Criação de landing page responsiva, identidade visual da campanha e estrutura inicial para captação de leads.",
      500,
    );
    await fillField(page.getByLabel(/prazo de execução/i), "15 dias úteis");
    await fillField(page.getByLabel(/condições de pagamento/i), "50% no início e 50% na entrega");

    await fillField(page.getByLabel(/descrição do item 1/i), "Criação da landing page");
    await fillField(page.getByLabel(/quantidade do item 1/i), "1");
    await fillField(page.getByLabel(/preço unitário do item 1/i), "1800");

    await pause(1200);

    const previewCard = page.getByRole("complementary", { name: /prévia da proposta/i });
    await previewCard.scrollIntoViewIfNeeded();
    await pause(1800);

    await page.getByRole("button", { name: /salvar proposta/i }).click();
    await pause(1600);

    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: /gerar pdf/i }).click();
    const download = await downloadPromise;
    await download.delete();
    await pause(1800);

    await page.locator("#saved-heading").scrollIntoViewIfNeeded();
    await pause(1800);
    const savedTable = page.getByRole("table", { name: /propostas salvas/i });
    await savedTable.scrollIntoViewIfNeeded();
    await pause(2500);
  } finally {
    const recordedPathPromise = page.video()?.path();
    await context.close();
    await browser.close();

    if (recordedPathPromise) {
      const recordedPath = await recordedPathPromise;
      await mkdir(outputDir, { recursive: true });
      await rename(recordedPath, finalVideoPath);
      console.log(finalVideoPath);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
