# PropostaSimples

Aplicação web para criação de propostas comerciais voltada a micro e pequenos prestadores de serviço, com foco em clareza operacional, aparência profissional e geração rápida de PDF.

O produto permite preencher dados do prestador e do cliente, organizar itens da proposta, revisar o documento em tempo real, salvar propostas localmente no navegador e exportar uma versão final em PDF.

## Visão Geral

Este projeto foi construído como uma interface de produto real, não apenas como formulário funcional. A aplicação prioriza:

- experiência simples para usuários leigos
- prévia em tempo real do documento
- persistência local sem backend
- exportação de PDF com identidade visual própria
- fluxo validado com testes unitários e E2E

## Principais Funcionalidades

- cadastro de dados do prestador e do cliente
- composição comercial com itens, quantidade, valor unitário e desconto
- resumo financeiro automático
- geração automática do número da proposta quando necessário
- salvamento de rascunho no `localStorage`
- histórico de propostas salvas no navegador
- geração de PDF com layout comercial
- seção de links úteis para emissão de certidões e consultas operacionais
- suporte a tema claro/escuro

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

## Estrutura do Projeto

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
scripts/
artifacts/
```

### Convenções adotadas

- código e nomes técnicos em inglês
- textos da interface em português brasileiro
- `components/ui` para primitives reutilizáveis
- `components/forms` para blocos de formulário de negócio
- `pages` para entry points de tela
- `tests` para testes unitários/integrados
- `e2e` para testes Playwright

## Requisitos

- `Node.js >= 20`
- `npm >= 10`

## Como Rodar Localmente

```bash
npm install
npm run dev
```

Aplicação disponível em:

```bash
http://localhost:5173
```

## Scripts Disponíveis

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
npm run test:watch
npm run test:coverage
npm run test:e2e
npm run test:e2e:ui
```

### Demo

```bash
npm run record:demo
```

Esse script grava uma demonstração automatizada do produto e salva o vídeo em:

```bash
artifacts/linkedin-demo.webm
```

## Testes Automatizados

### Unitários e integração leve

Cobrem principalmente:

- sanitização e máscaras
- validação de dados
- persistência local
- comportamento do contexto principal

### End-to-end

Cobrem em desktop e mobile:

- renderização da aplicação
- preenchimento do formulário
- atualização da prévia
- cálculo de itens
- máscaras de entrada
- persistência de rascunho
- salvamento de propostas
- validação de link de pagamento
- fluxo de limpeza
- rota 404

## Deploy

O projeto usa `Vite` com `base` configurado para produção em:

```ts
base: mode === "production" ? "/proposta-simples/" : "/"
```

Se o deploy for em GitHub Pages, esse valor deve refletir o nome do repositório.

Se o deploy for em domínio raiz ou ambiente próprio, ajuste conforme necessário em [vite.config.ts](/Users/alvaro/Documents/Projetos%20desenvolvidos/propostaSimples/vite.config.ts).

## Persistência e Privacidade

- os dados são armazenados localmente no navegador
- nenhuma informação da proposta é enviada para backend
- o histórico depende do armazenamento local do dispositivo/navegador

## Observações Técnicas

- a geração de PDF funciona no navegador e requer política CSP compatível com WebAssembly
- o bundle de PDF ainda é o chunk mais pesado da aplicação e pode ser otimizado futuramente com carregamento sob demanda
- alguns links úteis dependem de portais governamentais externos, que podem alterar certificados, redirecionamentos ou disponibilidade sem aviso

## Status Atual

No estado atual, o projeto está com:

- `lint` passando
- `typecheck` passando
- testes unitários passando
- testes E2E passando
- build de produção passando
- gravação automatizada de demo funcionando

## Próximos Passos Possíveis

- lazy loading do módulo de PDF
- aumento de cobertura útil por componente
- refinamento de acessibilidade por teclado em fluxos longos
- exportação de proposta com templates visuais alternativos
- sincronização em nuvem opcional no futuro
