# PropostaSimples

Aplicação web para criar propostas comerciais com aparência profissional, prévia em tempo real e exportação em PDF, pensada para MEIs e pequenos prestadores de serviço.

O projeto foi construído para funcionar 100% no navegador, sem backend. Os dados ficam no dispositivo do usuário, e o fluxo prioriza rapidez, clareza operacional e uma entrega visualmente sólida.

## O que a aplicação faz

- cadastra dados do prestador e do cliente
- organiza itens da proposta com quantidade, valor unitário e desconto
- calcula subtotal, descontos e total automaticamente
- mostra uma prévia do documento em tempo real
- gera PDF diretamente no navegador
- salva rascunhos localmente para continuidade do preenchimento
- mantém histórico local de propostas salvas
- permite limpar os dados locais do navegador quando necessário
- oferece links úteis para emissão de certidões e consultas operacionais

## Principais características

- interface responsiva para desktop e mobile
- foco em usabilidade para usuários não técnicos
- persistência local sem dependência de servidor
- validações de campos essenciais
- testes automatizados unitários e end-to-end
- deploy simples com Vite e GitHub Pages

## Stack

- `React 18`
- `TypeScript`
- `Vite`
- `Tailwind CSS`
- `Radix UI`
- `@react-pdf/renderer`
- `Vitest`
- `Playwright`
- `ESLint`
- `Prettier`

## Estrutura do projeto

```text
src/
  components/
    forms/
    pdf/
    shared/
    ui/
  context/
  hooks/
  lib/
  pages/
  schemas/
  services/
  tests/
  types/
  utils/
e2e/
.github/
scripts/
```

## Requisitos

- `Node.js >= 20`
- `npm >= 10`

## Rodando localmente

```bash
npm install
npm run dev
```

Aplicação local:

```bash
http://localhost:5173
```

## Scripts disponíveis

### Desenvolvimento

```bash
npm run dev
npm run build
npm run preview
npm run typecheck
```

### Qualidade

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

### Testes

```bash
npm test
npm run test:coverage
npm run test:e2e
npm run test:e2e:ui
```

### Demo automatizada

```bash
npm run record:demo
```

O vídeo é salvo em:

```bash
artifacts/linkedin-demo.webm
```

## Privacidade e armazenamento

O projeto não envia dados para servidor. As informações da proposta ficam apenas no navegador do usuário por meio de `localStorage`.

Pontos importantes:

- rascunhos ficam salvos localmente no navegador
- propostas salvas também ficam apenas no navegador
- o botão `Limpar` remove os dados locais do formulário e o histórico salvo daquele navegador
- em dispositivos compartilhados, recomenda-se usar `Limpar` ao final do uso

## Qualidade do projeto

O projeto possui:

- tipagem com TypeScript
- validações de dados sensíveis como CPF/CNPJ, datas e URLs `https`
- testes unitários para utilitários, persistência e estado principal
- testes end-to-end em desktop e mobile
- pipeline de CI com `lint`, testes, build e E2E

## Deploy

O projeto usa `Vite` com `base` configurável por variável de ambiente.

Para deploy em GitHub Pages, use:

```bash
VITE_BASE_PATH=/PropostaSimples/ npm run build
```

Para deploy em domínio raiz ou preview local:

```bash
npm run build
```

Depois, publique a pasta `dist/`.

## Observações técnicas

- a geração de PDF roda no navegador e concentra a parte mais pesada do bundle
- os links externos de apoio operacional dependem de portais oficiais de terceiros
- o histórico local não substitui armazenamento em nuvem ou multiusuário

## Limitações atuais

- não existe autenticação
- não existe sincronização entre dispositivos
- não existe backend para armazenamento centralizado
- o layout do PDF é único, sem múltiplos templates visuais

## Possíveis próximos passos

- carregamento sob demanda do módulo de PDF
- templates alternativos de proposta
- importação e duplicação de propostas
- exportação adicional em formatos além de PDF
- sincronização opcional com backend no futuro

## Licença e uso

Este repositório pode ser usado como base para estudo, portfólio e evolução do produto. Se for publicar para clientes reais, vale complementar com:

- política de privacidade apropriada ao seu contexto
- identidade visual própria
- revisão jurídica/comercial do conteúdo padrão das propostas
