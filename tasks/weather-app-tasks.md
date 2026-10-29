# Backlog de Tarefas — Weather App

Fonte: [plano técnico](../plans/weather-app-plan.md) e [especificação](../specs/weather-app-spec.md).

As dependências indicam pré-requisitos diretos. Os arquivos são prováveis, conforme a estrutura proposta no plano, e podem ser ajustados para preservar a mesma separação de responsabilidades.

## Entrega 1 — Base da aplicação e contratos

### T-01 — Preparar a base executável da aplicação

- **Descrição:** Criar ou completar o ponto de entrada React/Vite e as configurações necessárias para desenvolver e executar testes unitários e E2E.
- **Critérios de aceite:**
  - A aplicação inicia pelo script `pnpm dev` e gera build pelo script `pnpm build`.
  - Vitest/Testing Library e Playwright podem executar pelos scripts já existentes ou por scripts documentados.
  - TypeScript permanece em modo strict; nenhuma biblioteca de estado global ou cache é adicionada.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `index.html`, `src/main.tsx`, `src/App.tsx`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `package.json`.
- **Tipo:** Infra
- **Rastreabilidade:** RNF1, RNF2; estrutura e stack do plano.

### T-02 — Definir os contratos de domínio

- **Descrição:** Declarar os modelos compartilhados de cidade, unidade, clima atual, previsão diária, previsão e erro tipado.
- **Critérios de aceite:**
  - Os tipos representam os campos, opcionalidade, nulos e categorias de erro previstos no plano.
  - Os valores de temperatura no domínio são armazenados em Celsius e sem arredondamento.
  - Os tipos de resposta bruta da API não são expostos à interface.
- **Dependências:** T-01.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF1–RF4; RNF9.

### T-03 — Criar a estrutura visual e o estado inicial

- **Descrição:** Montar a tela principal responsiva, com tema do projeto e orientação inicial sem dados fictícios.
- **Critérios de aceite:**
  - O primeiro carregamento apresenta orientação para pesquisar, sem erro ou informações meteorológicas inventadas.
  - A composição visual funciona em viewport móvel e desktop sem rolagem horizontal.
  - A estrutura mantém componentes de apresentação separados de serviços de rede.
- **Dependências:** T-01, T-02.
- **Arquivos prováveis:** `src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/components/WeatherStatus.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF5, RF6; AC6.1, AC7.1; RNF1.

### T-04 — Testar a tela inicial e sua estrutura acessível

- **Descrição:** Verificar o estado inicial e os fundamentos de acessibilidade da aplicação.
- **Critérios de aceite:**
  - O teste confirma a orientação inicial e a ausência de dados fictícios.
  - Elementos interativos têm nome acessível e podem receber foco por teclado.
  - Os testes não dependem de chamadas à rede pública.
- **Dependências:** T-03.
- **Arquivos prováveis:** `tests/unit/components/App.test.tsx`, `tests/unit/components/WeatherStatus.test.tsx`.
- **Tipo:** Test
- **Rastreabilidade:** AC6.2–AC6.4, AC7.1; RNF2.

## Entrega 2 — Busca e seleção de cidades

### T-05 — Implementar normalização e validação do termo de busca

- **Descrição:** Criar funções puras para aparar espaços, normalizar Unicode em NFC e validar o comprimento do termo.
- **Critérios de aceite:**
  - Termos válidos têm de 1 a 100 pontos de código Unicode após aparar espaços e normalizar.
  - Termos vazios, apenas com espaços ou acima do limite são rejeitados sem efeitos colaterais.
  - A normalização preserva consultas equivalentes com e sem acentos conforme o serviço de geocodificação.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/geocoding.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF1.2; AC1.1a, AC1.1b, AC1.4, AC1.5.

### T-06 — Testar as regras de validação do termo

- **Descrição:** Cobrir limites, normalização Unicode e termos inválidos da busca.
- **Critérios de aceite:**
  - Casos de 0, 1, 100 e 101 pontos de código têm resultados esperados e verificáveis.
  - Há casos de espaços e strings Unicode com formas equivalentes de composição.
  - Nenhum teste precisa de relógio, rede ou estado React.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/lib/geocoding.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC1.1a, AC1.1b, AC1.4, AC1.5.

### T-07 — Validar e normalizar resultados de geocodificação

- **Descrição:** Converter o payload da Open-Meteo em cidades de domínio, preservando identidade, coordenadas e ordem.
- **Critérios de aceite:**
  - Resultados válidos produzem cidades com os campos obrigatórios e região opcional.
  - No máximo 10 resultados são aceitos, na ordem recebida; lista ausente ou vazia representa busca sem correspondência.
  - Payload malformado e campos essenciais inválidos produzem erro explícito, não lista vazia.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/geocoding.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF1.1, RF1.3, RF1.7; AC1.1, AC2.1–AC2.2; RNF9.

### T-08 — Testar a normalização de geocodificação

- **Descrição:** Cobrir respostas válidas, vazias e malformadas do geocoding.
- **Critérios de aceite:**
  - Os testes verificam ordem, limite de resultados, região opcional e preservação de coordenadas/identidade.
  - Lista vazia válida é distinguida de resposta inválida.
  - Os testes são determinísticos e não usam a API real.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/lib/geocoding.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** RF1.1, RF1.3, RF1.7; AC1.1, AC2.1–AC2.2.

### T-09 — Implementar transporte HTTP resiliente

- **Descrição:** Criar o suporte compartilhado a chamadas HTTPS com timeout, cancelamento e classificação de falhas.
- **Critérios de aceite:**
  - Cada requisição expira em 10 segundos e pode ser cancelada.
  - Falhas distinguem rede, timeout, HTTP, HTTP 429, erro reportado pela API e resposta inválida.
  - Cancelamento por ação mais recente não é exposto como erro visível; não há retry automático.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/http.ts`, `src/types/weather.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF6; AC7.2, AC7.7; RNF4, RNF6, RNF9.

### T-10 — Testar o transporte HTTP e a classificação de erros

- **Descrição:** Verificar timeout, cancelamento e classes de falha usando `fetch` controlado.
- **Critérios de aceite:**
  - Testes cobrem rejeição de rede, timeout, cancelamento, HTTP comum, 429, JSON inválido e envelope de erro em HTTP 2xx.
  - Timers são controlados sem espera real e restaurados após os testes.
  - Nenhum teste unitário chama a Open-Meteo.
- **Dependências:** T-09.
- **Arquivos prováveis:** `tests/unit/services/http.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC7.2, AC7.7; RNF4.

### T-11 — Implementar o serviço de geocodificação

- **Descrição:** Construir a URL e consultar o endpoint de busca usando o termo validado e o transporte compartilhado.
- **Critérios de aceite:**
  - A consulta usa HTTPS, termo codificado, `count=10`, `language=pt` e `format=json`.
  - A resposta é normalizada antes de ser retornada ao hook.
  - Erros de transporte ou payload inválido permanecem distintos de uma resposta válida sem resultados.
- **Dependências:** T-06, T-08, T-09.
- **Arquivos prováveis:** `src/services/geocodingService.ts`, `src/lib/geocoding.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF1.1–RF1.7; AC1.1, AC1.3, AC1.5; RNF4, RNF6.

### T-12 — Testar o serviço de geocodificação

- **Descrição:** Validar parâmetros, normalização e falhas do serviço com `fetch` simulado.
- **Critérios de aceite:**
  - Os testes verificam URL, encoding do termo, limite de 10 e parâmetros de idioma/formato.
  - Cenários de sucesso, lista vazia, falha HTTP/429, rede, timeout e payload inválido são cobertos.
  - Nenhum teste faz requisição externa real.
- **Dependências:** T-11.
- **Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** RF1; AC1.1–AC1.5, AC7.7; RNF4.

### T-13 — Criar os componentes de formulário e resultados da busca

- **Descrição:** Implementar a entrada acessível de cidade e a lista de resultados com dados para desambiguar locais.
- **Critérios de aceite:**
  - O formulário permite buscar por botão e Enter e associa mensagens de validação ao campo.
  - A lista mostra cidade, país e estado/região quando disponível; a seleção é acessível por teclado e toque.
  - Busca, resultados e validações são apresentados por props/eventos, sem chamada de rede no componente.
- **Dependências:** T-03, T-05, T-07.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`, `src/components/CityResults.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF1, RF5, RF6; AC1.1–AC1.5, AC2.1–AC2.2; RNF2.

### T-14 — Orquestrar busca, estados e concorrência

- **Descrição:** Integrar validação, serviço e estado de busca, descartando resultados obsoletos.
- **Critérios de aceite:**
  - A busca representa `idle`, `loading`, `success`, `empty` e `error` sem confundir falha com ausência de resultados.
  - Entrada inválida não chama o serviço; erro oferece retry manual da busca.
  - Respostas antigas não substituem a busca mais recente, inclusive quando o cancelamento não é efetivo.
- **Dependências:** T-11, T-13.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF1, RF6; AC1.2–AC1.6, AC7.2, AC8.2; RNF4.

### T-15 — Testar a orquestração da busca

- **Descrição:** Verificar estados, retry e respostas fora de ordem do fluxo de busca.
- **Critérios de aceite:**
  - Testes cobrem estados iniciais, loading, sucesso, vazio, erro e retry manual.
  - Termo inválido não chama serviço e uma resposta obsoleta não substitui a atual.
  - Serviços e promessas são controlados pelos testes, sem acesso à rede.
- **Dependências:** T-14.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC1.2–AC1.6, AC7.2, AC8.2.

### T-16 — Testar a interação dos componentes de busca

- **Descrição:** Verificar fluxo observável de formulário, validação, resultados e seleção.
- **Critérios de aceite:**
  - Testes exercitam botão, Enter e navegação por teclado, usando roles e nomes acessíveis.
  - Mensagens de entrada inválida e busca sem resultados são distintas.
  - Selecionar um resultado transmite a cidade e as coordenadas correspondentes.
- **Dependências:** T-13, T-15.
- **Arquivos prováveis:** `tests/unit/components/SearchForm.test.tsx`, `tests/unit/components/CityResults.test.tsx`.
- **Tipo:** Test
- **Rastreabilidade:** AC1.1–AC1.5, AC2.1–AC2.2, AC6.2–AC6.4.

## Entrega 3 — Clima atual e previsão

### T-17 — Normalizar e validar clima atual

- **Descrição:** Converter o payload atual em modelo de domínio, aplicando regras para campos essenciais e complementares.
- **Critérios de aceite:**
  - Temperatura e código meteorológico válidos são exigidos para sucesso.
  - Sensação térmica, umidade e vento inválidos/ausentes tornam-se `null`; faixas de umidade e vento são validadas.
  - Horário observado é preservado; se ausente, usa-se o horário de recebimento convertido ao fuso e identificado como horário da consulta.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/weather.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF2.1–RF2.4; AC3.1–AC3.4; RNF3, RNF9.

### T-18 — Testar a normalização do clima atual

- **Descrição:** Cobrir validação de dados essenciais, complementares, faixas e horário.
- **Critérios de aceite:**
  - Testes verificam campos essenciais válidos/inválidos e campos complementares nulos quando inválidos.
  - Valores de umidade fora de 0–100 e vento negativo são rejeitados conforme o contrato.
  - Casos de horário ausente usam relógio controlado e fuso definido.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/unit/lib/weather.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC3.1–AC3.4; RNF3, RNF9.

### T-19 — Normalizar e validar previsão de cinco dias

- **Descrição:** Combinar arrays diários por índice e validar datas, valores e fuso da cidade.
- **Critérios de aceite:**
  - A previsão usa datas locais D a D+4 em ordem cronológica e ignora datas adicionais.
  - Fuso IANA ausente/inválido torna a seção indisponível; valores diários ausentes/inválidos viram `null` e marcam dia e previsão como incompletos.
  - Mínima acima da máxima é inválida; menos de cinco dias utilizáveis é sinalizado sem estimar valores.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/weather.ts`, `src/lib/date.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF3.1–RF3.4; AC4.1–AC4.4; RNF3, RNF9.

### T-20 — Testar a normalização da previsão

- **Descrição:** Cobrir alinhamento de arrays, datas locais, fuso e previsões incompletas.
- **Critérios de aceite:**
  - Há testes para cinco dias, arrays curtos/desalinhados, campos obrigatórios inválidos e datas extras.
  - Casos de virada de dia, mês e ano usam fuso IANA controlado, sem depender do fuso do dispositivo.
  - Valores ausentes são exibidos como ausentes no modelo, nunca estimados.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/unit/lib/weather.test.ts`, `tests/unit/lib/date.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC4.1–AC4.4; RNF3, RNF9.

### T-21 — Implementar os serviços de clima atual e previsão

- **Descrição:** Consultar o endpoint forecast com as coordenadas selecionadas e normalizar as respostas de cada seção.
- **Critérios de aceite:**
  - Requisições usam HTTPS, coordenadas do objeto `City`, unidades Celsius/km/h, `timezone=auto` e `forecast_days=5`.
  - Clima atual e previsão podem ser consultados e falhar independentemente.
  - Respostas passam por validação de envelope/schema antes de chegar à interface.
- **Dependências:** T-09, T-17, T-19.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF2, RF3; AC3.1, AC4.1; RNF4, RNF6, RNF9.

### T-22 — Testar os serviços meteorológicos

- **Descrição:** Validar parâmetros de forecast, normalização e classificação de falhas sem rede real.
- **Critérios de aceite:**
  - Testes verificam coordenadas, unidades de origem, fuso, previsão de cinco dias e campos solicitados.
  - Cobrem falha HTTP/429, erro da API em HTTP 2xx, JSON/schema inválido e respostas parciais.
  - Consultas de clima atual e previsão podem falhar separadamente.
- **Dependências:** T-21.
- **Arquivos prováveis:** `tests/unit/services/weatherService.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** RF2–RF3; AC3.1–AC4.4, AC7.7; RNF4, RNF9.

### T-23 — Implementar os componentes de clima e previsão

- **Descrição:** Exibir condições atuais e cartões dos dias da previsão, com identidade da cidade e estados parciais.
- **Critérios de aceite:**
  - Clima atual apresenta cidade, temperatura, condição, horário de referência e campos complementares disponíveis.
  - Previsão apresenta datas locais, dias da semana, mínima, máxima e condição; campos indisponíveis aparecem como “—”.
  - Previsão incompleta é identificada e código meteorológico desconhecido não interrompe a renderização.
- **Dependências:** T-02, T-19.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/Forecast.tsx`, `src/components/WeatherStatus.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF2–RF3, RF6; AC3.1–AC3.4, AC4.1–AC4.4; RNF3, RNF9.

### T-24 — Testar componentes meteorológicos e estados parciais

- **Descrição:** Verificar a renderização de clima atual, previsão completa/incompleta e estados de seção.
- **Critérios de aceite:**
  - Testes cobrem dados presentes, valores `null`, condições desconhecidas e previsão incompleta.
  - Falha de uma seção não oculta dados válidos da outra.
  - Datas e unidades são verificadas pelo conteúdo acessível, sem acoplamento à estrutura interna.
- **Dependências:** T-23.
- **Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`, `tests/unit/components/Forecast.test.tsx`.
- **Tipo:** Test
- **Rastreabilidade:** AC3.1–AC4.4, AC7.3.

### T-25 — Orquestrar seleção, consultas independentes e atualização

- **Descrição:** Ao selecionar cidade, coordenar clima atual e previsão com estados, retry e proteção contra respostas obsoletas.
- **Critérios de aceite:**
  - Selecionar outra cidade limpa imediatamente os dados da cidade anterior e inicia ambas as consultas sem dependência de sucesso mútuo.
  - Status, erro, retry e atualização são independentes por seção; retry refaz somente a seção que falhou.
  - Respostas antigas são descartadas; falha ao atualizar a mesma cidade só preserva dados com indicação de desatualização e horário.
- **Dependências:** T-14, T-21.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF2, RF3, RF6; AC2.2, AC7.3–AC7.6; RNF3, RNF4.

### T-26 — Testar estados e concorrência das consultas meteorológicas

- **Descrição:** Cobrir seleção, independência entre seções, retry e respostas concorrentes no hook.
- **Critérios de aceite:**
  - Testes provam que uma falha parcial preserva o sucesso da outra seção e que retry consulta somente a seção com falha.
  - Troca de cidade remove dados anteriores; falha de atualização marca dados retidos como desatualizados.
  - Respostas fora de ordem, inclusive para consultas repetidas da mesma cidade, não sobrescrevem a ação mais recente.
- **Dependências:** T-25.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC7.3–AC7.6; RNF3, RNF4.

## Entrega 4 — Formatação e alternância de unidade

### T-27 — Implementar conversão e formatação de apresentação

- **Descrição:** Criar funções puras para temperatura, valores regionais, data e códigos meteorológicos.
- **Critérios de aceite:**
  - Conversão de Fahrenheit sempre parte do valor Celsius original; arredonda somente na apresentação, com empate afastado de zero.
  - Datas e dias da semana usam pt-BR; umidade, vento e temperatura exibem unidades corretas e campos ausentes permanecem “—”.
  - Códigos WMO conhecidos têm descrição em pt-BR e códigos desconhecidos retornam “Condição indisponível”.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/temperature.ts`, `src/lib/date.ts`, `src/lib/weather.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF2, RF3, RF4; AC3.1, AC4.2, AC5.1–AC5.4; RNF7, RNF9.

### T-28 — Testar conversão e formatação de apresentação

- **Descrição:** Exercitar conversões, arredondamento, formatação regional e códigos WMO.
- **Critérios de aceite:**
  - Casos tabelados incluem 0 °C, 20 °C, −40 °C, valores negativos/fracionários e empates positivos e negativos.
  - Alternâncias repetidas não acumulam arredondamento e campos ausentes não viram zero.
  - Datas, separador decimal, unidades e fallback de código desconhecido são verificados.
- **Dependências:** T-27.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`, `tests/unit/lib/date.test.ts`, `tests/unit/lib/weather.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC4.2, AC5.1–AC5.4; RNF7, RNF9.

### T-29 — Criar o controle de unidade

- **Descrição:** Implementar a alternância acessível entre Celsius e Fahrenheit para todas as temperaturas apresentadas.
- **Critérios de aceite:**
  - Celsius é a unidade inicial e o controle informa claramente a opção selecionada.
  - A alternância atualiza clima atual, sensação térmica e mínimas/máximas da previsão sem alterar cidade ou datas.
  - Trocar unidade não inicia requisição e funciona por teclado e toque.
- **Dependências:** T-23, T-27.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`, `src/App.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF4–RF5; AC5.1–AC5.5, AC6.2, AC6.4; RNF2, RNF7.

### T-30 — Testar a alternância de unidade

- **Descrição:** Validar o controle e a aplicação consistente da unidade aos dados meteorológicos.
- **Critérios de aceite:**
  - Testes verificam a unidade inicial e a mudança de todas as temperaturas visíveis.
  - Cidade, datas e valores de origem não mudam com a alternância.
  - Durante uma consulta pendente, a resposta final respeita a unidade selecionada e não provoca requisição adicional.
- **Dependências:** T-26, T-28, T-29.
- **Arquivos prováveis:** `tests/unit/components/UnitToggle.test.tsx`, `tests/unit/hooks/useWeatherApp.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC5.1–AC5.5; RNF7.

## Entrega 5 — Integração, acessibilidade e hardening

### T-31 — Integrar os fluxos completos e estados da tela

- **Descrição:** Conectar formulário, resultados, seleção, clima, previsão, unidade e ações de retry na aplicação.
- **Critérios de aceite:**
  - A tela compõe os estados `idle`, `loading`, `success`, `empty` e `error` da busca e os estados independentes das seções meteorológicas.
  - Loading e erros são anunciados sem mover foco indevidamente; erros recuperáveis têm retry manual e falha parcial mantém o contexto válido.
  - Busca, seleção, retry e alternância permanecem operáveis por teclado e toque, com foco visível e sem dependência exclusiva de cor.
- **Dependências:** T-16, T-23, T-25, T-29.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/WeatherStatus.tsx`, `src/components/SearchForm.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF1–RF6; AC1–AC8; RNF2, RNF4.

### T-32 — Testar acessibilidade, estados e responsividade dos componentes

- **Descrição:** Validar comportamento observável e requisitos de usabilidade da interface em diferentes estados.
- **Critérios de aceite:**
  - Testes de componentes cobrem estado inicial, loading, vazio, erro recuperável, sucesso e sucesso parcial.
  - Formulário, seleção, alternância e retry são operáveis sem mouse; mensagens têm associação e nomes acessíveis.
  - Revisão verifica foco visível, ordem lógica, contraste WCAG 2.2 AA e alvos interativos de pelo menos 44 × 44 CSS px.
- **Dependências:** T-31.
- **Arquivos prováveis:** `tests/unit/components/`, `src/components/`.
- **Tipo:** Test
- **Rastreabilidade:** AC1–AC8; RNF1, RNF2.

### T-33 — Validar fluxos ponta a ponta e viewports

- **Descrição:** Criar cenários Playwright integrados com interceptação das APIs, incluindo falhas, concorrência e dispositivos móveis.
- **Critérios de aceite:**
  - Fluxo de busca, desambiguação, seleção, clima, cinco dias e alternância é validado com fixtures e sem depender de rede pública.
  - Cenários cobrem vazio, validação, retry, timeout, falha parcial, atualização desatualizada e respostas fora de ordem.
  - Viewports 320, 360, 414, 768, 1024 e 1440 px não apresentam rolagem horizontal; fluxo principal funciona a 360 × 800 com toque e alvos mínimos de 44 × 44 CSS px.
  - Suíte executa em Chromium, Firefox e WebKit.
- **Dependências:** T-32.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC1–AC8; RNF1, RNF2, RNF4, RNF5.

### T-34 — Verificar gates de lançamento e documentar conformidade

- **Descrição:** Registrar as verificações de produção relativas à Open-Meteo, privacidade, segurança, navegadores, acessibilidade e performance.
- **Critérios de aceite:**
  - Termos, licença, atribuição exigida, uso comercial e limites da Open-Meteo são verificados, datados e documentados; atribuição visível com link é adicionada se exigida.
  - Política de privacidade informa o processamento do termo/coordenadas e IP pelo provedor; implantação confirma HTTPS, ausência de segredos no bundle e tratamento de 429.
  - Matriz manual inclui versões atual e anterior dos navegadores/plataformas definidos na spec e revisão WCAG 2.2 AA com leitor de tela.
  - Cinco medições Lighthouse mobile em build de produção, viewport 360 × 800 e rede 4G registram resultados e verificam percentil 75 de LCP ≤ 2,5 s, TBT ≤ 200 ms e CLS ≤ 0,1.
- **Dependências:** T-33.
- **Arquivos prováveis:** `README.md`, `public/privacy.html`, `src/components/Attribution.tsx`, documentação de implantação.
- **Tipo:** Infra
- **Rastreabilidade:** RNF1.1, RNF2, RNF5, RNF6, RNF8; Production Release Gates.

### T-35 — Executar e registrar a validação final

- **Descrição:** Rodar os comandos de qualidade e testes após integração e registrar evidências e pendências dos gates manuais.
- **Critérios de aceite:**
  - `pnpm lint`, `pnpm build`, `pnpm test` e a suíte `pnpm test:e2e` são executados com resultados registrados.
  - Falhas são corrigidas ou documentadas explicitamente; não há testes unitários dependentes da Open-Meteo real.
  - Gaps de plataforma, acessibilidade ou performance permanecem listados como pendências, sem serem declarados aprovados.
- **Dependências:** T-33, T-34.
- **Arquivos prováveis:** `README.md`, arquivos de configuração de lint/build/teste.
- **Tipo:** Test
- **Rastreabilidade:** Todos os critérios AC1–AC8; RNF1.1, RNF2, RNF4–RNF5, RNF9.
