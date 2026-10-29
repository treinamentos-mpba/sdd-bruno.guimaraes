# Backlog de Tarefas — Weather App
Fonte: [plano técnico](../plans/weather-app-plan.md) e [especificação](../specs/weather-app-spec.md).
As dependências indicam pré-requisitos diretos. Os arquivos são prováveis, conforme a estrutura proposta no plano, e podem ser ajustados para preservar a mesma separação de responsabilidades.

## Ordem do backlog (normativa)

Siga esta ordem para implementar. A configuração das ferramentas de teste é infraestrutura e pode ser preparada na base; os testes de comportamento ficam após integração. As seções de entrega abaixo preservam o detalhamento e a rastreabilidade; esta ordem por camada rege a execução. Dentro de cada fase, tarefas sem dependência entre si podem ocorrer em paralelo.

| Fase | Ordem das tarefas |
| --- | --- |
| Base de execução | T-01, T-36, T-45, T-46, T-47 |
| Tipos | T-02 |
| Funções puras | T-05, T-07, T-17, T-19, T-27 |
| Services | T-09, T-11, T-21 |
| Hooks | T-14, T-25 |
| Componentes | T-03, T-37, T-13, T-23, T-29 |
| Integração | T-31, T-38 |
| Testes | T-04, T-06, T-08, T-10, T-12, T-15, T-16, T-18, T-20, T-22, T-24, T-26, T-28, T-30, T-32, T-33 |
| Hardening e release | T-39, T-34, T-40, T-41, T-42, T-43, T-44, T-35 |

## Rastreabilidade dos requisitos funcionais

A tabela indica as tarefas de implementação e, quando houver cobertura dedicada, as tarefas de teste/verificação. **Lacuna** identifica requisito sem tarefa de implementação correspondente.

| Requisito da spec | Tarefas de implementação | Tarefas de teste/verificação | Lacuna |
| --- | --- | --- | --- |
| RF1.1 — Busca explícita, trim e normalização NFC | T-05, T-11, T-13, T-14 | T-06, T-12, T-16 | Não |
| RF1.2 — Termos Unicode com 1–100 pontos de código; rejeitar vazio/maior que 100 | T-05, T-13, T-14 | T-06, T-16 | Não |
| RF1.3 — Resultados com cidade, país/região, ordem e limite de 10 | T-07, T-11, T-13 | T-08, T-12, T-16 | Não |
| RF1.4 — Comunicar busca concluída sem resultados | T-13, T-14, T-31 | T-15, T-16, T-32, T-33 | Não |
| RF1.5 — Distinguir vazio de falha de rede, timeout, limite e erro da fonte | T-09, T-11, T-14, T-32 | T-10, T-12, T-15, T-32, T-33 | Não |
| RF1.6 — Loading, retry manual e descarte de busca obsoleta | T-09, T-14, T-31, T-38 | T-10, T-15, T-32, T-33 | Não |
| RF1.7 — Preservar identidade e coordenadas do local selecionado | T-07, T-11, T-13, T-14, T-25 | T-08, T-12, T-16, T-33 | Não |
| RF2.1 — Temperatura e condição essenciais em pt-BR; erro se inválidas | T-17, T-21, T-23, T-27 | T-18, T-22, T-24, T-33 | Não |
| RF2.2 — Sensação térmica, umidade e vento; “—” se indisponíveis | T-17, T-23, T-27 | T-18, T-24, T-32, T-33 | Não |
| RF2.3 — Identidade da cidade junto ao clima atual | T-13, T-23, T-25, T-31 | T-16, T-24, T-33 | Não |
| RF2.4 — Horário da fonte no fuso local ou horário de consulta identificado | T-17, T-23, T-27 | T-18, T-24, T-33 | Não |
| RF2.5 — Atualização manual isolada por seção, sem atualização automática | T-25, T-31, T-38 | T-26, T-32, T-33 | Não |
| RF2.6 — Só a resposta da ação mais recente atualiza cada seção | T-25 | T-26, T-33 | Não |
| RF3.1 — Dados locais de cada dia: data, semana, mínima/máxima e condição | T-19, T-23, T-27 | T-20, T-24, T-33 | Não |
| RF3.2 — Usar fuso IANA para definir D; erro recuperável se inválido | T-19, T-21, T-23, T-27 | T-20, T-22, T-24, T-33 | Não |
| RF3.3 — Mostrar D a D+4 em ordem, ignorar extras e identificar faltantes | T-19, T-23 | T-20, T-24, T-33 | Não |
| RF3.4 — Sinalizar campos/dias incompletos sem estimar valores | T-19, T-23 | T-20, T-24, T-32, T-33 | Não |
| RF4.1 — Celsius como unidade inicial | T-29 | T-30, T-33 | Não |
| RF4.2 — Alternar todas as temperaturas e mostrar unidade | T-23, T-27, T-29 | T-28, T-30, T-33 | Não |
| RF4.3 — Preservar cidade/período e não exigir nova busca | T-29, T-31, T-38 | T-30, T-33 | Não |
| RF4.4 — Converter sempre a partir do valor de origem preciso | T-02, T-27 | T-28, T-30 | Não |
| RF5 — Disponibilizar e tornar utilizáveis as funções principais em dispositivos móveis | T-13, T-23, T-29, T-31, T-37, T-38 | T-33, T-39 | Não |
| RF6.1 — Comunicar carregamento de busca e consultas meteorológicas | T-13, T-14, T-23, T-25, T-31 | T-15, T-24, T-26, T-32, T-33 | Não |
| RF6.2 — Erros distintos e nova tentativa explícita | T-09, T-13, T-14, T-23, T-25, T-31, T-38 | T-10, T-15, T-22, T-24, T-26, T-32, T-33 | Não |
| RF6.3 — Estado inicial e vazio somente após busca bem-sucedida sem resultados | T-03, T-13, T-14, T-31 | T-04, T-15, T-16, T-32, T-33 | Não |
| RF6.4 — Limpar dados ao trocar cidade; marcar dados retidos como desatualizados após falha | T-25, T-31 | T-26, T-32, T-33 | Não |

## Entrega 1 — Base da aplicação e contratos

### T-01 — Configurar o projeto Vite e os scripts base
- **Descrição:** Preparar a configuração do Vite e os scripts de desenvolvimento e build.
- **Critérios de aceite:**
  - `pnpm dev` inicia o servidor Vite e `pnpm build` termina com código zero e gera o diretório de build.
  - `package.json` não declara biblioteca de estado global nem cache de longa duração.
- **Dependências:** Nenhuma.
- **Arquivos prováveis:** `vite.config.ts`, `package.json`.
- **Tipo:** Infra
- **Rastreabilidade:** RNF1, RNF2; estrutura e stack do plano.

### T-36 — Criar a entrada React da aplicação
- **Descrição:** Conectar o documento HTML ao ponto de entrada React.
- **Critérios de aceite:**
  - `index.html` referencia `src/main.tsx` e contém o elemento raiz usado pelo React.
  - `pnpm dev` serve o documento sem erro de carregamento do módulo; `pnpm build` termina com código zero.
- **Dependências:** T-01.
- **Arquivos prováveis:** `index.html`, `src/main.tsx`.
- **Tipo:** Infra
- **Rastreabilidade:** RNF1; estrutura do plano.

### T-45 — Configurar TypeScript strict
- **Descrição:** Configurar o compilador TypeScript em modo strict para a aplicação.
- **Critérios de aceite:**
  - A configuração efetiva de TypeScript tem `strict: true`.
  - `pnpm exec tsc --noEmit` termina com código zero, sem desabilitar verificações strict.
- **Dependências:** T-01.
- **Arquivos prováveis:** `tsconfig.json`.
- **Tipo:** Infra
- **Rastreabilidade:** RNF9; stack do plano.

### T-46 — Configurar testes unitários
- **Descrição:** Configurar Vitest e Testing Library para executar a suíte unitária.
- **Critérios de aceite:**
  - `pnpm test` executa Vitest e descobre os arquivos de teste unitário do projeto.
  - Uma execução sem testes encontrados ou com teste falhando retorna código diferente de zero.
- **Dependências:** T-01.
- **Arquivos prováveis:** `vitest.config.ts`, `package.json`.
- **Tipo:** Infra
- **Rastreabilidade:** RNF2; estratégia de testes do plano.

### T-47 — Configurar testes E2E
- **Descrição:** Configurar Playwright e o script para executar a suíte E2E.
- **Critérios de aceite:**
  - `pnpm test:e2e` executa Playwright usando a configuração do projeto e retorna falha quando um teste E2E falha.
- **Dependências:** T-01.
- **Arquivos prováveis:** `playwright.config.ts`, `package.json`.
- **Tipo:** Infra
- **Rastreabilidade:** RNF1, RNF2; estratégia de testes do plano.

### T-02 — Definir os contratos de domínio

- **Descrição:** Declarar os modelos compartilhados de cidade, unidade, clima atual, previsão diária, previsão e erro tipado.
- **Critérios de aceite:**
  - Os tipos de domínio representam cidade (identidade, nome, país, região opcional e coordenadas), unidade, clima atual, dia/previsão e categorias de erro tipadas.
  - Campos complementares ausentes são representáveis como `null`; os campos essenciais têm tipos não opcionais.
  - Os valores de temperatura no domínio são armazenados em Celsius e sem arredondamento.
  - Os tipos de resposta bruta da API não são expostos à interface.
  - `pnpm exec tsc --noEmit` conclui sem erros de tipo nos contratos.
- **Dependências:** T-01, T-45.
- **Arquivos prováveis:** `src/types/weather.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF1–RF4; RNF9.

### T-03 — Criar a estrutura visual e o estado inicial
- **Descrição:** Montar a composição inicial da tela e o estado de orientação, sem dados fictícios.
- **Critérios de aceite:**
  - Renderizar a aplicação sem interação exibe orientação para buscar uma cidade e nenhum erro ou dado meteorológico.
  - A montagem inicial não inicia chamadas de rede; componentes de apresentação recebem dados por props/eventos e não importam serviços.
- **Dependências:** T-02, T-14, T-25, T-36.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/WeatherStatus.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF6; AC7.1, AC8.1; RNF1.

### T-37 — Aplicar tema e responsividade à estrutura inicial
- **Descrição:** Implementar os estilos globais e o layout responsivo da tela inicial.
- **Critérios de aceite:**
  - O tema dark glassmorphism e os estilos globais estão aplicados à estrutura inicial.
  - Nos viewports 320, 360, 414, 768, 1024 e 1440 CSS px, a tela inicial não tem rolagem horizontal (`scrollWidth <= clientWidth`).
- **Dependências:** T-03.
- **Arquivos prováveis:** `src/index.css`.
- **Tipo:** UI
- **Rastreabilidade:** RF5; AC6.1; RNF1.

### T-04 — Testar a tela inicial e sua estrutura acessível

- **Descrição:** Verificar o estado inicial e os fundamentos de acessibilidade da aplicação.
- **Critérios de aceite:**
  - Testes confirmam orientação inicial visível e ausência de conteúdo de clima antes de uma busca.
  - Cada controle renderizado tem role e nome acessíveis e é alcançável por teclado.
  - A suíte passa com serviços de rede simulados e sem chamada à Open-Meteo.
- **Dependências:** T-03, T-37, T-46.
- **Arquivos prováveis:** `tests/unit/components/App.test.tsx`, `tests/unit/components/WeatherStatus.test.tsx`.
- **Tipo:** Test
- **Rastreabilidade:** AC8.1; RNF2.

## Entrega 2 — Busca e seleção de cidades

### T-05 — Implementar normalização e validação do termo de busca

- **Descrição:** Criar funções puras para aparar espaços, normalizar Unicode em NFC e validar o comprimento do termo.
- **Critérios de aceite:**
  - Após trim e normalização NFC, o validador aceita termos com 1 e 100 pontos de código Unicode e rejeita termos com 0 ou 101.
  - Entrada inválida retorna erro de validação sem executar transporte ou serviço de geocodificação.
  - A função aceita caracteres acentuados, hífens, apóstrofos e alfabetos não latinos sem regra de allowlist latina.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/geocoding.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF1.2; AC1.1a, AC1.1b, AC1.4.

### T-06 — Testar as regras de validação do termo

- **Descrição:** Cobrir limites, normalização Unicode e termos inválidos da busca.
- **Critérios de aceite:**
  - Testes unitários verificam os quatro limites: 0 e 101 rejeitados; 1 e 100 aceitos.
  - Testes verificam trim, NFC para strings compostas/decompostas e aceitação de caracteres não latinos, hífen e apóstrofo.
  - A suíte de teste unitário passa sem rede, relógio simulado ou renderização React.
- **Dependências:** T-05.
- **Arquivos prováveis:** `tests/unit/lib/geocoding.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** RF1.2; AC1.1a, AC1.1b, AC1.4.

### T-07 — Validar e normalizar resultados de geocodificação

- **Descrição:** Converter o payload da Open-Meteo em cidades de domínio, preservando identidade, coordenadas e ordem.
- **Critérios de aceite:**
  - Cada resultado válido normaliza identidade da fonte, nome, país, latitude e longitude; região/estado é opcional.
  - A saída contém no máximo 10 cidades e preserva a ordem da fonte; array válido vazio resulta em lista vazia.
  - Envelope inválido, coordenadas fora de faixa ou campos essenciais ausentes retornam erro de validação, nunca lista vazia.
- **Dependências:** T-02, T-05.
- **Arquivos prováveis:** `src/lib/geocoding.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF1.1, RF1.3, RF1.7; AC1.1, AC2.1; RNF9.

### T-08 — Testar a normalização de geocodificação

- **Descrição:** Cobrir respostas válidas, vazias e malformadas do geocoding.
- **Critérios de aceite:**
  - Testes verificam entrada com mais de 10 resultados (saída limitada a 10), ordem preservada, região ausente e identidade/coordenadas preservadas.
  - Um array vazio válido produz lista vazia; envelope inválido, campo essencial ausente e coordenada fora de faixa produzem erro.
  - Todos os casos são determinísticos e não usam a API real.
- **Dependências:** T-07.
- **Arquivos prováveis:** `tests/unit/lib/geocoding.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** RF1.1, RF1.3, RF1.7; AC1.1, AC2.1.

### T-09 — Implementar transporte HTTP resiliente

- **Descrição:** Criar o suporte compartilhado a chamadas HTTPS com timeout, cancelamento e classificação de falhas.
- **Critérios de aceite:**
  - Cada chamada termina em sucesso, erro ou timeout após no máximo 10 segundos; o chamador pode abortá-la via `AbortSignal`.
  - Resultado diferencia rejeição de rede, timeout, status HTTP (incluindo 429), envelope de erro da API e JSON/schema inválido.
  - Aborto intencional não é classificado como erro recuperável para exibição e o transporte não repete chamadas automaticamente.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/services/http.ts`, `src/types/weather.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF6; AC7.2, AC7.7; RNF4, RNF6, RNF9.

### T-10 — Testar o transporte HTTP e a classificação de erros

- **Descrição:** Verificar timeout, cancelamento e classes de falha usando `fetch` controlado.
- **Critérios de aceite:**
  - Testes verificam sucesso, rejeição de rede, timeout em 10 s, cancelamento, HTTP não-2xx, HTTP 429, JSON inválido e erro de API em HTTP 2xx.
  - Testes verificam que cada chamada de transporte ocorre uma vez e timers são restaurados após cada caso.
  - Nenhum teste unitário chama a Open-Meteo.
- **Dependências:** T-09.
- **Arquivos prováveis:** `tests/unit/services/http.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC7.2, AC7.7; RNF4.

### T-11 — Implementar o serviço de geocodificação

- **Descrição:** Construir a URL e consultar o endpoint de busca usando o termo validado e o transporte compartilhado.
- **Critérios de aceite:**
  - A URL usa HTTPS, termo codificado e parâmetros `count=10`, `language=pt` e `format=json`.
  - O serviço repassa o `AbortSignal` recebido e retorna cidades de domínio já normalizadas.
  - Lista válida sem resultados é distinta de falhas de transporte, status HTTP ou payload inválido.
- **Dependências:** T-05, T-07, T-09.
- **Arquivos prováveis:** `src/services/geocodingService.ts`, `src/lib/geocoding.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF1.1–RF1.5, RF1.7; AC1.1a, AC1.3, AC7.7; RNF4, RNF6.

### T-12 — Testar o serviço de geocodificação

- **Descrição:** Validar parâmetros, normalização e falhas do serviço com `fetch` simulado.
- **Critérios de aceite:**
  - Testes verificam protocolo HTTPS, encoding, limite e parâmetros de idioma/formato da URL, além do encaminhamento do sinal de cancelamento.
  - Testes cobrem resposta válida, lista vazia, erro HTTP comum/429, rede, timeout e payload inválido, conferindo o tipo de resultado/erro.
  - A suíte passa sem requisição externa real.
- **Dependências:** T-11.
- **Arquivos prováveis:** `tests/unit/services/geocodingService.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** RF1.1, RF1.3–RF1.5; AC1.1a, AC1.3, AC7.7; RNF4.

### T-13 — Criar os componentes de formulário e resultados da busca

- **Descrição:** Implementar a entrada acessível de cidade e a lista de resultados com dados para desambiguar locais.
- **Critérios de aceite:**
  - Submeter pelo botão ou Enter emite uma única ação de busca; mensagem de validação fica associada ao input por atributo acessível.
  - Cada resultado exibe nome e país, inclui região quando disponível, e pode ser selecionado por teclado e toque.
  - Props de loading, lista vazia e erro exibem seus estados com mensagens distintas em pt-BR.
  - Os componentes recebem estado por props e emitem eventos; não importam serviço nem chamam `fetch`.
- **Dependências:** T-03, T-05, T-07, T-14.
- **Arquivos prováveis:** `src/components/SearchForm.tsx`, `src/components/CityResults.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF1, RF6; AC1.1–AC1.4, AC2.1–AC2.2, AC6.2; RNF2.

### T-14 — Orquestrar busca, estados e concorrência

- **Descrição:** Integrar validação, serviço e estado de busca, descartando resultados obsoletos.
- **Critérios de aceite:**
  - A busca transita por `idle`, `loading`, `success`, `empty` e `error`; somente sucesso com zero resultados produz `empty`.
  - Termo inválido não chama serviço; ação explícita de retry repete o termo da busca que falhou.
  - Em duas buscas sobrepostas, a resposta da primeira é ignorada se a segunda já foi iniciada, mesmo sem cancelamento efetivo.
- **Dependências:** T-05, T-11.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF1, RF6; AC1.2–AC1.6, AC7.2, AC8.2; RNF4.

### T-15 — Testar a orquestração da busca

- **Descrição:** Verificar estados, retry e respostas fora de ordem do fluxo de busca.
- **Critérios de aceite:**
  - Testes verificam os cinco estados da busca, incluindo indicador visível enquanto uma promessa controlada permanece pendente e transição de erro para retry/sucesso.
  - Teste comprova zero chamadas para entrada inválida e que a resposta mais antiga não altera resultado após a segunda busca.
  - Serviços e promessas são controlados pelos testes; a suíte não acessa rede.
- **Dependências:** T-14.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC1.2–AC1.6, AC7.2, AC8.2.

### T-16 — Testar a interação dos componentes de busca

- **Descrição:** Verificar fluxo observável de formulário, validação, resultados e seleção.
- **Critérios de aceite:**
  - Testes exercitam submissão por botão e Enter e seleção por teclado consultando roles e nomes acessíveis.
  - Teste de busca confirma resultados para “São Paulo” e “Sao Paulo”, sem rejeição por acentuação.
  - Entrada inválida, resultado vazio bem-sucedido e falha recuperável geram mensagens/estados distintos.
  - Ao selecionar um resultado, o callback recebe a identidade e as coordenadas da mesma cidade renderizada.
- **Dependências:** T-13, T-15.
- **Arquivos prováveis:** `tests/unit/components/SearchForm.test.tsx`, `tests/unit/components/CityResults.test.tsx`.
- **Tipo:** Test
- **Rastreabilidade:** AC1.1–AC1.5, AC2.1–AC2.2; RNF2.

## Entrega 3 — Clima atual e previsão

### T-17 — Normalizar e validar clima atual

- **Descrição:** Converter o payload atual em modelo de domínio, aplicando regras para campos essenciais e complementares.
- **Critérios de aceite:**
  - Temperatura numérica finita e código WMO inteiro são obrigatórios; ausência ou formato inválido retorna erro de seção.
  - Código WMO válido sem mapeamento de descrição continua no modelo e pode ser apresentado como “Condição indisponível”.
  - Sensação térmica, umidade e vento ausentes ou inválidos tornam-se `null`; umidade fora de 0–100 e vento negativo são inválidos.
  - Horário da fonte e fuso da cidade são preservados; se o horário não vier, o normalizador usa `receivedAt` e marca o valor como horário da consulta.
- **Dependências:** T-02.
- **Arquivos prováveis:** `src/lib/weather.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF2.1–RF2.4; AC3.1–AC3.3, AC3.5; RNF3, RNF9.

### T-18 — Testar a normalização do clima atual

- **Descrição:** Cobrir validação de dados essenciais, complementares, faixas e horário.
- **Critérios de aceite:**
  - Testes verificam temperatura/código essenciais válidos e ausentes/inválidos, código WMO válido desconhecido e cada complementar válido, ausente e inválido.
  - Testes verificam umidade nos limites 0 e 100, abaixo/acima deles, e vento zero e negativo.
  - Teste sem horário da fonte injeta `receivedAt` e verifica hora local e marcador de horário da consulta sem usar o relógio real.
- **Dependências:** T-17.
- **Arquivos prováveis:** `tests/unit/lib/weather.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** RF2.1–RF2.4; AC3.1–AC3.3, AC3.5; RNF3, RNF9.

### T-19 — Normalizar e validar previsão de cinco dias

- **Descrição:** Combinar arrays diários por índice e validar datas, valores e fuso da cidade.
- **Critérios de aceite:**
  - D é a data atual calculada no fuso IANA válido da cidade; a saída contém apenas D a D+4 em ordem cronológica, independentemente da ordem de entrada.
  - Fuso ausente/inválido retorna erro de seção; mínima, máxima ou código/condição ausentes/inválidos marcam dia e previsão como incompletos sem descartar outros dias válidos.
  - Mínima maior que máxima é inválida; datas esperadas ausentes continuam identificadas como incompletas e nenhum valor é estimado.
  - Código WMO inteiro não mapeado permanece disponível para apresentação do fallback “Condição indisponível”.
- **Dependências:** T-02, T-17.
- **Arquivos prováveis:** `src/lib/weather.ts`, `src/lib/date.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF3.1–RF3.4; AC4.1–AC4.4; RNF3, RNF9.

### T-20 — Testar a normalização da previsão

- **Descrição:** Cobrir alinhamento de arrays, datas locais, fuso e previsões incompletas.
- **Critérios de aceite:**
  - Testes conferem as cinco datas esperadas e incluem entrada fora de ordem, array curto/desalinhado, data extra e dia ausente.
  - Testes cobrem limites de virada de dia, mês e ano com fuso IANA fixo, independente do fuso do processo/dispositivo.
  - Testes verificam condição/temperaturas ausentes, mínima maior que máxima, código WMO válido desconhecido, flags de incompletude e ausência de valores estimados.
- **Dependências:** T-19.
- **Arquivos prováveis:** `tests/unit/lib/weather.test.ts`, `tests/unit/lib/date.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC4.1–AC4.4; RNF3, RNF9.

### T-21 — Implementar os serviços de clima atual e previsão

- **Descrição:** Consultar o endpoint forecast com as coordenadas selecionadas e normalizar as respostas de cada seção.
- **Critérios de aceite:**
  - URL usa HTTPS, latitude/longitude da cidade selecionada, Celsius, km/h, `timezone=auto` e `forecast_days=5`.
  - Serviço expõe chamadas separadas para clima atual e previsão, cada uma com seu resultado/erro e sinal de cancelamento.
  - Cada payload valida envelope e campos/schema antes de chamar o normalizador; payload inválido não retorna sucesso parcial como válido.
- **Dependências:** T-09, T-17, T-19.
- **Arquivos prováveis:** `src/services/weatherService.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF2, RF3; AC3.1, AC3.3, AC4.1, AC4.3, AC7.7; RNF4, RNF6, RNF9.

### T-22 — Testar os serviços meteorológicos com mock de fetch

- **Descrição:** Validar parâmetros de forecast, normalização e classificação de falhas sem rede real.
  - Todos os casos substituem `fetch` por mock e verificam URL, latitude/longitude, unidades de origem, fuso, cinco dias e parâmetros/campos de clima atual e previsão.
  - Testes verificam latitude/longitude, unidades de origem, fuso, cinco dias e parâmetros/campos de clima atual e previsão.
  - Testes comprovam que falha de uma chamada não impede sucesso da outra e que cada service normaliza apenas sua resposta.
  - A suíte termina sem chamadas de rede reais e verifica os sinais de cancelamento repassados ao mock.
- **Dependências:** T-21.
- **Arquivos prováveis:** `tests/unit/services/weatherService.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** RF2–RF3; AC3.1, AC3.3, AC4.1, AC4.3, AC7.7; RNF4, RNF9.

### T-23 — Implementar os componentes de clima e previsão

- **Descrição:** Exibir condições atuais e cartões dos dias da previsão, com identidade da cidade e estados parciais.
- **Critérios de aceite:**
  - Clima atual mostra identidade completa da cidade, temperatura e condição, horário e rótulos de sensação, umidade e vento com valores ou “—”.
  - Cada cartão da previsão mostra data local, dia da semana, mínima, máxima e condição; campos ausentes aparecem como “—”.
  - Dia/previsão incompletos têm indicação textual e código WMO desconhecido mostra “Condição indisponível” sem erro de renderização.
- **Dependências:** T-02, T-19, T-25, T-27.
- **Arquivos prováveis:** `src/components/CurrentWeather.tsx`, `src/components/Forecast.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF2–RF3; AC3.1–AC3.5, AC4.1–AC4.4; RNF3, RNF9.

### T-24 — Testar componentes meteorológicos e estados parciais

- **Descrição:** Verificar a renderização de clima atual, previsão completa/incompleta e estados de seção.
- **Critérios de aceite:**
  - Testes verificam renderização de todos os campos, valores `null` como “—”, código desconhecido e marcador de incompletude.
  - Com clima atual bem-sucedido e previsão em erro (e vice-versa), a seção válida permanece visível.
  - Datas, rótulos e unidades são verificados por texto/roles acessíveis, sem consultar estado ou estrutura interna.
- **Dependências:** T-23.
- **Arquivos prováveis:** `tests/unit/components/CurrentWeather.test.tsx`, `tests/unit/components/Forecast.test.tsx`.
- **Tipo:** Test
- **Rastreabilidade:** AC3.1–AC3.4, AC4.1–AC4.4.

### T-25 — Orquestrar seleção, consultas independentes e atualização

- **Descrição:** Ao selecionar cidade, coordenar clima atual e previsão com estados, retry e proteção contra respostas obsoletas.
- **Critérios de aceite:**
  - Selecionar cidade diferente remove seus dados anteriores antes de iniciar as consultas independentes de clima e previsão.
  - Atualização e retry são ações manuais; não há polling/atualização automática, e retry ou atualização de uma seção não invoca serviço da outra.
  - Resposta de cidade/ação anterior não altera estado atual; falha de atualização da mesma cidade mantém dados apenas com flag desatualizada e horário identificável.
- **Dependências:** T-14, T-21.
- **Arquivos prováveis:** `src/hooks/useWeatherApp.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF2, RF3, RF6; AC2.2, AC7.3–AC7.6; RNF3, RNF4.

### T-26 — Testar estados e concorrência das consultas meteorológicas

- **Descrição:** Cobrir seleção, independência entre seções, retry e respostas concorrentes no hook.
- **Critérios de aceite:**
  - Testes verificam sucesso parcial e contagem de chamadas para comprovar retry isolado à seção com falha.
  - Após trocar cidade, nenhum dado da anterior permanece; após falha de atualização da mesma cidade, dados retidos têm flag e horário de desatualização.
  - Promessas controladas completam fora de ordem (incluindo mesma cidade/seção) e somente a ação mais recente altera a UI.
- **Dependências:** T-25.
- **Arquivos prováveis:** `tests/unit/hooks/useWeatherApp.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC7.3–AC7.6; RNF3, RNF4.

## Entrega 4 — Formatação e alternância de unidade

### T-27 — Implementar conversão e formatação de apresentação

- **Descrição:** Criar funções puras para temperatura, valores regionais, data e códigos meteorológicos.
- **Critérios de aceite:**
  - Fórmulas implementam °F = (°C × 9/5) + 32 e inversa; valores de origem não são mutados nem arredondados e apresentação usa empate afastado de zero.
  - Data usa `dd/MM/yyyy`, dia da semana e decimal usam `pt-BR`; temperatura, umidade e vento arredondam ao inteiro mais próximo com unidades °C/°F, %, km/h; valores ausentes são “—”.
  - Códigos WMO conhecidos têm descrição pt-BR e desconhecidos retornam literalmente “Condição indisponível”.
- **Dependências:** T-02, T-17, T-19.
- **Arquivos prováveis:** `src/lib/temperature.ts`, `src/lib/date.ts`, `src/lib/weather.ts`.
- **Tipo:** Data
- **Rastreabilidade:** RF2, RF3, RF4; AC3.1, AC4.2, AC5.1–AC5.4; RNF7, RNF9.

### T-28 — Testar conversão de unidade com testes unitários
- **Descrição:** Testar isoladamente as funções puras de conversão e arredondamento de temperatura.
- **Descrição:** Exercitar conversões, arredondamento, formatação regional e códigos WMO.
  - Testes unitários tabelados verificam 0 °C → 32 °F, 20 °C → 68 °F, −40 °C → −40 °F, valores fracionários/negativos e as fórmulas de conversão inversa.
  - Testes verificam arredondamento para inteiro com empate afastado de zero em valores positivos e negativos.
  - Alternâncias repetidas são calculadas sempre a partir do valor original e retornam à apresentação inicial; valor ausente permanece ausente, nunca zero.
  - A suíte da função pura passa sem React, serviço, relógio ou rede.
- **Dependências:** T-27.
- **Arquivos prováveis:** `tests/unit/lib/temperature.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC5.1–AC5.4; RNF7, RNF9.

### T-29 — Criar o controle de unidade

- **Descrição:** Implementar a alternância acessível entre Celsius e Fahrenheit para todas as temperaturas apresentadas.
- **Critérios de aceite:**
  - Controle inicia em Celsius e expõe a unidade selecionada por estado/label acessível.
  - Alterar para Fahrenheit atualiza temperatura atual, sensação térmica e mínimas/máximas, mantendo cidade e datas.
  - A contagem de chamadas de serviço não aumenta ao alternar; ambos os valores são operáveis por teclado e toque.
- **Dependências:** T-23, T-27.
- **Arquivos prováveis:** `src/components/UnitToggle.tsx`, `src/App.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF4–RF5; AC5.1–AC5.3, AC6.2; RNF2, RNF7.

### T-30 — Testar a alternância de unidade

- **Descrição:** Validar o controle e a aplicação consistente da unidade aos dados meteorológicos.
- **Critérios de aceite:**
  - Testes verificam °C inicial, °F em todos os campos disponíveis, símbolos e precisão de apresentação.
  - Após alternar e voltar, cidade, datas e valores de origem permanecem iguais; nenhuma chamada adicional ocorre.
  - Com requisição pendente, alternar antes de resolver faz a resposta aparecer na unidade escolhida, sem segunda chamada.
- **Dependências:** T-26, T-28, T-29.
- **Arquivos prováveis:** `tests/unit/components/UnitToggle.test.tsx`, `tests/unit/hooks/useWeatherApp.test.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC5.1–AC5.5; RNF7.

## Entrega 5 — Integração, acessibilidade e hardening

### T-31 — Integrar os fluxos completos e estados da tela
- **Descrição:** Compor na aplicação o formulário, resultados, seleção, clima atual, previsão e estados independentes das seções.
- **Critérios de aceite:**
- Teste de integração renderiza a tela e percorre busca, seleção, clima atual e previsão usando serviços simulados.
- Busca exibe `idle`, `loading`, `success`, `empty` e `error`; clima atual e previsão exibem estados independentes.
- Selecionar resultado transmite a mesma identidade/coordenadas para as consultas e identifica essa cidade na tela.
- **Dependências:** T-13, T-23, T-25.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/WeatherStatus.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF1–RF3, RF6; AC1.1–AC1.6, AC2.2, AC3.1–AC3.4, AC4.1, AC7.1, AC8.1–AC8.2; RNF2, RNF4.

### T-38 — Integrar alternância de unidade e retry na tela
- **Descrição:** Conectar o controle de unidade e as ações de retry aos estados e dados apresentados pela aplicação.
- **Critérios de aceite:**
- No fluxo integrado, alternar °C/°F atualiza todas as temperaturas disponíveis sem aumentar a contagem de chamadas de serviço.
- Falhar uma busca/seção e acionar retry repete somente essa operação; outra seção bem-sucedida permanece visível.
- Os controles integrados são encontrados por role/nome acessível, operam por teclado e toque e anunciam estados de loading/erro.
- **Dependências:** T-31, T-25, T-29.
- **Arquivos prováveis:** `src/App.tsx`, `src/components/WeatherStatus.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RF4, RF6; AC5.1–AC5.5, AC7.2–AC7.7; RNF2.

### T-32 — Testar estados loading, erro e vazio dos componentes
- **Descrição:** Verificar os estados de carregamento, erro recuperável e vazio nos componentes da busca e das seções meteorológicas.
- **Critérios de aceite:**
- Testes de componentes verificam busca em loading, erro e vazio; clima atual e previsão em loading e erro; previsão válida vazia/incompleta sem confundi-la com erro.
- Busca vazia após sucesso mostra orientação de revisar o termo; erro de busca e erro meteorológico mostram ação de retry acessível.
- Os estados de loading/erro são expostos por roles/regiões semânticas com nome acessível e as mensagens são textuais, não dependentes somente de cor.
- As asserções usam roles e nomes acessíveis e não chamam a rede pública; contraste, foco visível e alvos de toque são verificados manualmente em T-42.
- **Dependências:** T-31, T-38.
- **Arquivos prováveis:** `tests/unit/components/SearchForm.test.tsx`, `tests/unit/components/CityResults.test.tsx`, `tests/unit/components/WeatherStatus.test.tsx`.
- **Tipo:** Test
- **Rastreabilidade:** AC1.2–AC1.4, AC3.3, AC4.3–AC4.4, AC7.1–AC7.2, AC7.5, AC8.2; RNF2.

### T-33 — Validar fluxos funcionais ponta a ponta
- **Descrição:** Criar cenários Playwright para os fluxos funcionais, interceptando as APIs para evitar dependência da rede pública.
- **Critérios de aceite:**
- Teste Playwright percorre busca, desambiguação, seleção, clima, cinco dias e alternância em Chromium, usando fixtures interceptadas e zero chamadas à rede pública.
- O fluxo principal é executado em viewport mobile de 360 × 800 CSS px com contexto de toque; busca, seleção, visualização e alternância são concluídas nesse viewport.
- A alternância preserva cidade/datas e não aumenta o número de requisições registradas pelas rotas interceptadas.
- Cenários verificam vazio vs. erro, entrada inválida sem requisição, retry manual, timeout em até 10 s, atualização manual com horário atualizado, falha parcial, dados desatualizados e resposta fora de ordem.
- Cada ação de busca/seleção/retry apresenta feedback de loading em até 1 s, medido no teste.
- **Dependências:** T-32, T-47.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC1.1–AC1.6, AC2.1–AC2.2, AC3.1–AC3.6, AC4.1–AC4.4, AC5.1–AC5.5, AC7.1–AC7.7, AC8.1–AC8.2; RNF4, RNF5.

### T-39 — Validar responsividade e navegadores em E2E
- **Descrição:** Acrescentar ao conjunto E2E a cobertura de viewports, toque e navegadores prevista na especificação.
- **Critérios de aceite:**
- Em cada largura 320, 360, 414, 768, 1024 e 1440 CSS px, o fluxo principal e estados de loading/erro/sucesso não têm rolagem horizontal (`scrollWidth <= clientWidth`) nem elementos sobrepostos.
- Em viewport 360 × 800 com toque, busca, seleção, alternância e retry funcionam; cada alvo interativo mede pelo menos 44 × 44 CSS px. O fluxo funcional principal mobile permanece coberto em T-33.
- A suíte configurada executa em Chromium, Firefox e WebKit, com resultado registrado para cada navegador.
- **Dependências:** T-33.
- **Arquivos prováveis:** `tests/e2e/weather-app.spec.ts`, `playwright.config.ts`.
- **Tipo:** Test
- **Rastreabilidade:** AC6.1–AC6.4; RNF1, RNF2, RNF5.

### T-34 — Verificar gates de lançamento e documentar conformidade
- **Descrição:** Verificar e documentar os termos, licença, atribuição exigida, uso comercial e limites da Open-Meteo.
- **Critérios de aceite:**
- Um registro inclui URL/fonte consultada, data da verificação e conclusões separadas sobre licença, atribuição, uso comercial, limites e tráfego projetado.
- O registro declara se atribuição visível é exigida e transcreve o formato/link exigido para orientar T-44.
- Qualquer condição não verificável fica explicitamente marcada como pendente, não como aprovada.
- **Dependências:** T-33.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Infra
- **Rastreabilidade:** RNF6, RNF8; Production Release Gates.

### T-40 — Publicar a política de privacidade
- **Descrição:** Documentar o tratamento de dados de busca e conexão na política de privacidade da aplicação.
- **Critérios de aceite:**
- A página pública de privacidade identifica Open-Meteo como destinatária e informa processamento do termo/coordenadas e IP pelo provedor.
- A aplicação disponibiliza um link navegável para a página; a política não afirma retenção ou uso além do que foi verificado nos termos.
- **Dependências:** T-34.
- **Arquivos prováveis:** `public/privacy.html`.
- **Tipo:** Infra
- **Rastreabilidade:** RNF6; Production Release Gates.

### T-41 — Verificar salvaguardas de implantação
- **Descrição:** Documentar as verificações de segurança exigidas antes de publicar a aplicação.
- **Critérios de aceite:**
- Checklist de implantação evidencia URL HTTPS, inspeção do bundle cliente sem segredos/credenciais/analytics, ausência de armazenamento de buscas/localização entre sessões e envio somente do termo ou coordenadas necessárias.
- Checklist registra comportamento de erro HTTP 429 e o tratamento indicado ao usuário.
- Cada item tem status aprovado/reprovado/pendente e referência à evidência; itens não verificados não são marcados como aprovados.
- **Dependências:** T-33.
- **Arquivos prováveis:** documentação de implantação, `README.md`.
- **Tipo:** Infra
- **Rastreabilidade:** RNF4, RNF6; Production Release Gates.

### T-42 — Executar a validação manual de plataformas e acessibilidade
- **Descrição:** Verificar a matriz manual de navegadores/plataformas e os requisitos WCAG 2.2 AA.
- **Critérios de aceite:**
- Matriz registra teste na versão atual e anterior de Chrome, Edge e Firefox desktop, Safari macOS/iOS e Chrome Android, conforme disponibilidade.
- Revisão WCAG 2.2 AA registra leitor de tela, foco/ordem, ausência de dependência de cor, contraste de texto comum ≥ 4,5:1 e texto grande/componentes ≥ 3:1.
- Medição registra largura e altura de cada tipo de alvo interativo; todos têm ≥ 44 × 44 CSS px ou ficam listados como falha.
- Evidências, plataforma/versão e gaps encontrados são registrados.
- **Dependências:** T-39.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Test
- **Rastreabilidade:** RNF1.1, RNF2; Production Release Gates.

### T-43 — Medir performance do build de produção
- **Descrição:** Executar e registrar as medições de performance exigidas para o lançamento.
- **Critérios de aceite:**
- São anexados cinco resultados Lighthouse mobile do build de produção, viewport 360 × 800 e perfil de rede 4G simulado.
- Para cada métrica é calculado o percentil 75; passa somente se LCP ≤ 2,5 s, TBT ≤ 200 ms e CLS ≤ 0,1.
- Os resultados excluem latência da API externa; desvios são registrados como pendências.
- **Dependências:** T-33.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Test
- **Rastreabilidade:** RNF5; Production Release Gates.

### T-44 — Implementar atribuição visível do provedor
- **Descrição:** Exibir a atribuição à Open-Meteo com link quando a verificação de termos exigir.
- **Critérios de aceite:**
- Se T-34 identificar atribuição como obrigatória, a tela exibe o texto e link exigidos, apontando para a fonte aprovada; se não for exigida, a conclusão está registrada e a tarefa não adiciona atribuição indevida.
- Quando exibida, a atribuição tem nome acessível e link operável por teclado, sem depender de cor ou ícone.
- **Dependências:** T-34, T-31.
- **Arquivos prováveis:** `src/components/Attribution.tsx`, `src/App.tsx`.
- **Tipo:** UI
- **Rastreabilidade:** RNF8; Production Release Gates.

### T-35 — Executar e registrar a validação final
- **Descrição:** Rodar os comandos de qualidade e testes após integração e registrar resultados e pendências dos gates.
- **Critérios de aceite:**
- São registrados o comando, código de saída e resultado de `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e`.
- Cada comando passa ou sua falha tem issue/pendência e evidência registrada; testes unitários não fazem chamadas à Open-Meteo real.
- Gaps dos gates T-34 e T-39–T-44 permanecem listados como pendências; a execução não os converte em aprovação.
- **Dependências:** T-04, T-06, T-08, T-10, T-12, T-15, T-16, T-18, T-20, T-22, T-24, T-26, T-28, T-30, T-32, T-33, T-34, T-36, T-37, T-38, T-39, T-40, T-41, T-42, T-43, T-44, T-45, T-46, T-47.
- **Arquivos prováveis:** `README.md`.
- **Tipo:** Test
- **Rastreabilidade:** Todos os critérios AC1–AC8; RNF1.1, RNF2, RNF4–RNF5, RNF9.
