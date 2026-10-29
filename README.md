<div align="center">

# SDD Weather App

### Treinamento hands-on de **Spec-Driven Development** com **GitHub Copilot**

**Brief → Spec → Plan → Tasks → Code → Test → Review → Ship**

</div>

---

Este repositório é um **laboratório de treinamento de 8 horas** que ensina a
construir software guiado por especificação (**Spec-Driven Development**) usando
o **GitHub Copilot** em todas as etapas. O projeto final é um **Weather App** em
React + TypeScript que consome a API Open-Meteo.

> ## Princípio central
> **NÃO COMECE PELO CÓDIGO.** Sempre: **Spec → Plan → Tasks → Code.**

---

## O workshop

Comece pelo **[Guia do Workshop](workshop/GUIDE.md)** e siga os módulos em ordem.

| # | Módulo | Fase | Duração |
| --- | --- | --- | --- |
| 01 | [Setup](workshop/module-01-setup/README.md) | Preparação | 30 min |
| 02 | [Understanding the Problem](workshop/module-02-discovery/README.md) | Discovery | 45 min |
| 03 | [Writing the Specification](workshop/module-03-spec/README.md) | Spec | 50 min |
| 04 | [Creating the Technical Plan](workshop/module-04-plan/README.md) | Plan | 45 min |
| 05 | [Breaking Down Tasks](workshop/module-05-tasks/README.md) | Tasks | 40 min |
| 06 | [Building the UI](workshop/module-06-ui/README.md) | Code | 60 min |
| 07 | [Integrating APIs](workshop/module-07-api/README.md) | Code | 60 min |
| 08 | [Testing](workshop/module-08-testing/README.md) | Test | 55 min |
| 09 | [Hardening](workshop/module-09-hardening/README.md) | Test | 50 min |
| 10 | [Pull Request Review](workshop/module-10-review/README.md) | Review | 45 min |
| 11 | [Delivery (GitHub Pages)](workshop/module-11-delivery/README.md) | Ship | 30 min |

Cada módulo tem **README.md**, **challenge.md**, **prompts.md** e
**solution.md**.

---

## Começando

### Pré-requisitos

- **Node.js**
- **pnpm** (único gerenciador de pacotes suportado — habilite com `corepack enable`)
- **GitHub Copilot** habilitado no VS Code
- Git e uma conta no GitHub (para PR e deploy)

> O repositório inclui um **DevContainer** com tudo pré-configurado. Abra em um
> Codespace ou em "Reopen in Container" e pule a instalação manual.

### Instalação

```bash
pnpm install
pnpm exec playwright install   # navegadores para os testes E2E
```

### Scripts

```bash
pnpm dev             # servidor de desenvolvimento (Vite)
pnpm build           # build de produção
pnpm preview         # serve o build localmente
pnpm lint            # Biome (lint)
pnpm format          # Biome (formatação)
pnpm check           # Biome (lint + formatação)
pnpm test            # testes unitários (Vitest)
pnpm test:coverage   # cobertura
pnpm test:e2e        # testes E2E (Playwright)
```

### Consulta de clima

Execute `pnpm dev` para abrir [src/App.tsx](src/App.tsx).
A tela inicia com orientação de busca, sem dados nem requisições automáticas.
O hook [useWeather](src/hooks/useWeather.ts) consulta a Open-Meteo após buscar
uma cidade e carrega o clima da primeira correspondência. A tela apresenta
carregamento, vazio, erro com **Tentar novamente** ou clima atual e cinco dias.
O retry repete a última operação; não há controles de simulação na tela.
O controle °C/°F preserva a escolha entre estados e converte somente na exibição.

### Dados de exemplo para a UI

Os contratos estão em [src/types/weather.ts](src/types/weather.ts). Para desenvolver
componentes sem a API, importe o objeto tipado:

```ts
import { mockWeatherData } from './mocks/weather';

const { city, current, forecast } = mockWeatherData;
```

O caminho acima considera um arquivo diretamente em `src/`. O
[mock](src/mocks/weather.ts) contém Salvador, clima atual e cinco dias completos
(29/10/2026 a 02/11/2026), no fuso `America/Bahia`. As temperaturas mantêm casas
decimais em Celsius; conversão e arredondamento ficam na apresentação. As datas são
fixas e não acompanham o relógio. O mock não faz requisições nem é ativado
automaticamente na aplicação.

---

## Arquitetura do app

### Serviço de busca de cidades

[searchCities](src/services/weatherService.ts) consulta o geocoding da Open-Meteo,
retornando até dez objetos `City` na ordem da fonte. O nome recebe trim,
normalização NFC e `encodeURIComponent`; entrada vazia retorna `[]` sem rede.
Respostas válidas sem `results` também retornam `[]`. Erros HTTP, de rede e de
payload lançam `WeatherServiceError`, com `kind` e `status` quando aplicável.
O App está conectado ao serviço pelo hook `useWeather`.

### Consulta agregada de clima

`getWeather(city)` em [weatherService.ts](src/services/weatherService.ts) consulta
`current` e `daily` pelas coordenadas da cidade, em Celsius e km/h, com fuso
automático e cinco dias. Retorna `WeatherData`, preservando a cidade e a precisão
dos valores. Arrays diários são alinhados por índice e ordenados por data.
Ausência de `current`/`daily`, campos atuais essenciais inválidos ou menos de
cinco datas consecutivas lança `WeatherServiceError`. Complementos inválidos
viram `null`; campos diários obrigatórios inválidos marcam o dia e a previsão
como incompletos. Probabilidade ausente não é convertida em zero.
Esta consulta agregada é usada pelo App via `useWeather`, mas ainda não implementa
estados independentes das seções nem cancelamento externo.

### Timeout e falhas de rede

As duas consultas usam `fetchWithTimeout` em
[weatherService.ts](src/services/weatherService.ts). Cada chamada tem seu próprio
`AbortController`, abortado após 10 segundos; o timer é limpo no `finally`,
inclusive em sucesso ou falha. `AbortError` vira `WeatherServiceError` com
`kind: 'timeout'` e “A requisição demorou demais.”; falhas de rede usam
`kind: 'network'` e “Falha de rede.”. A causa original é preservada.
O helper não repete requisições. O prazo cobre o `fetch`, não a leitura
posterior do corpo da resposta.

```text
src/
├── components/      # apresentação (um componente por arquivo)
│   └── states/      # loading, erro, vazio
├── hooks/           # orquestração (useWeather)
├── services/        # acesso a dados (Open-Meteo) isolado
├── lib/             # funções puras (conversão, formatação, códigos WMO)
├── types/           # contratos compartilhados
├── styles/          # Tailwind + estilos globais
├── App.tsx          # composição da tela
└── main.tsx         # bootstrap React
```

Decisões-chave:

- **Temperaturas em Celsius** internamente; conversão só na apresentação (o
  toggle °C/°F **não** faz nova requisição).
- **Rede isolada** em `services/` — componentes e hooks não conhecem URLs.
- Sempre tratar **loading**, **erro** e **vazio**.

---

## Stack

- **TypeScript** (strict) · **React** · **Vite**
- **Tailwind CSS** (tema dark glassmorphism)
- **Vitest** + **Testing Library** (unit) · **Playwright** (E2E)
- **Biome** (lint + formatação)
- **pnpm** (gerenciador de pacotes)
- **Open-Meteo** (geocoding + forecast, sem API key)

---

## Copilot no fluxo SDD

A pasta `.github/` traz a inteligência do laboratório:

- **`agents/`** — personas especializadas: Spec, Plan, Task, Code, Test, Review.
- **`prompts/`** — prompts de produção para cada etapa.
- **`instructions/`** — convenções (React, Tailwind, Testing) aplicadas
  automaticamente.
- **`workflows/`** — CI (lint/build/test/e2e), deploy no Pages e validações que
  **impõem a ordem Spec → Plan → Tasks**.

Veja [AGENTS.md](AGENTS.md) para a descrição de cada agente.

---

## Idioma

- Narrativa, comentários e documentação: **pt-BR**.
- Identificadores de código, nomes de arquivos e termos técnicos: **en-US**.

---

<div align="center">

Construído com ❤️ para capacitar times em **Spec-Driven Development** usando o poder do GitHub Copilot.

</div>
