# Weather App — Especificação de Produto

> Fonte: briefing de negócio + `specs/discovery.md`. Este documento é a fonte única da verdade para as próximas etapas do fluxo SDD.

## 1. Overview

### Visão geral

O Weather App é uma aplicação de previsão do tempo que permite ao usuário pesquisar uma cidade pelo nome, visualizar as condições meteorológicas atuais e a previsão para cinco dias (hoje + 4 dias seguintes), com alternância entre Celsius e Fahrenheit. A experiência deve funcionar plenamente em dispositivos móveis.

### Objetivos do produto

- Permitir que qualquer pessoa consulte rapidamente o clima de uma cidade e planeje os próximos dias.
- Oferecer uma experiência simples, sem cadastro, autenticação ou armazenamento de dados pessoais em servidor.
- Garantir clareza nos estados da aplicação (carregando, erro, sem resultados), nunca apresentando dados desatualizados como se fossem atuais.

### Decisões de produto já tomadas (não reabrir)

- **Fonte de dados:** Open-Meteo, sem API key.
- **Previsão de 5 dias:** hoje + os 4 dias seguintes.
- **Unidade padrão:** Celsius (°C), com alternância para Fahrenheit (°F).
- **Sem autenticação e sem persistência de servidor.**
- **Idioma da interface:** pt-BR.

### Público-alvo

Usuários em geral, prioritariamente em dispositivos móveis, que desejam consultar o clima de uma ou mais cidades de forma rápida e sem fricção.

## 2. Functional Requirements

- **RF1 — Buscar cidades:** o sistema deve permitir que o usuário pesquise uma cidade pelo nome e selecione o local desejado entre os resultados.
  - RF1.1 — A busca deve retornar uma lista de cidades correspondentes ao termo digitado.
  - RF1.2 — Cada resultado deve exibir informações de desambiguação (ao menos nome da cidade, estado/região quando disponível e país), para diferenciar cidades homônimas.
  - RF1.3 — O sistema deve comunicar quando a busca não encontrar nenhuma cidade.
  - RF1.4 — O sistema deve tratar termos de busca inválidos ou vazios sem executar consulta desnecessária e sem apresentar erro confuso ao usuário.
- **RF2 — Consultar clima atual:** o sistema deve exibir as condições meteorológicas atuais da cidade selecionada.
  - RF2.1 — Exibir, no mínimo: temperatura atual e descrição da condição do tempo (ex.: ensolarado, nublado, chuva) em pt-BR.
  - RF2.2 — Exibir dados complementares disponíveis na fonte, no mínimo: sensação térmica (ou equivalente), umidade relativa e velocidade do vento.
  - RF2.3 — Identificar claramente a cidade consultada (nome + desambiguação) junto aos dados exibidos.
- **RF3 — Consultar previsão de 5 dias:** o sistema deve exibir a previsão para cinco dias, sendo o dia atual + os quatro dias seguintes.
  - RF3.1 — Para cada dia: identificação do dia (data e/ou dia da semana em pt-BR), temperaturas mínima e máxima e condição geral do tempo.
  - RF3.2 — Os cinco dias devem ser apresentados em ordem cronológica, iniciando pelo dia atual.
- **RF4 — Alternar unidades:** o sistema deve permitir alternar entre Celsius e Fahrenheit e apresentar as temperaturas na unidade escolhida.
  - RF4.1 — A unidade inicial é Celsius (°C).
  - RF4.2 — A alternância deve afetar **todas** as temperaturas exibidas (clima atual, sensação térmica e previsão), de forma consistente, com o símbolo da unidade sempre visível.
  - RF4.3 — A alternância não deve alterar a cidade selecionada nem o período consultado, nem exigir nova busca pelo usuário.
- **RF5 — Uso em dispositivos móveis:** todas as funções principais (busca, clima atual, previsão, alternância de unidade) devem estar disponíveis e utilizáveis em dispositivos móveis.
- **RF6 — Estados de carregamento, erro e vazio:** o sistema deve comunicar claramente, em pt-BR:
  - RF6.1 — Estado de carregamento enquanto busca cidades ou dados meteorológicos.
  - RF6.2 — Estado de erro quando a fonte de dados estiver indisponível, lenta (timeout) ou retornar falha, com possibilidade de o usuário tentar novamente.
  - RF6.3 — Estado vazio/inicial antes de qualquer consulta e quando a busca não retornar resultados.

## 3. User Stories

- **US1 (RF1):** Como **usuário**, quero **pesquisar uma cidade pelo nome** para **encontrar o local cujo clima desejo consultar**.
- **US2 (RF1):** Como **usuário**, quero **ver estado/região e país de cada resultado da busca** para **escolher a cidade correta entre homônimas**.
- **US3 (RF2):** Como **usuário**, quero **ver as condições meteorológicas atuais da cidade selecionada** para **saber como está o tempo agora**.
- **US4 (RF3):** Como **usuário**, quero **ver a previsão de hoje e dos próximos quatro dias** para **planejar minhas atividades da semana**.
- **US5 (RF4):** Como **usuário**, quero **alternar entre Celsius e Fahrenheit** para **ler as temperaturas na unidade com que estou acostumado**.
- **US6 (RF5):** Como **usuário em um celular**, quero **usar todas as funções do app na tela do meu dispositivo** para **consultar o clima em qualquer lugar**.
- **US7 (RF6):** Como **usuário**, quero **ser informado quando os dados estiverem carregando ou quando algo falhar** para **entender o estado da aplicação e poder tentar novamente**.
- **US8 (RF1/RF6):** Como **usuário**, quero **receber uma mensagem clara quando minha busca não encontrar cidades** para **corrigir o termo digitado sem confusão**.

## 4. Acceptance Criteria

### US1 / RF1 — Buscar cidades

- **AC1.1** — Dado que estou na tela inicial, quando digito um nome de cidade válido (ex.: "São Paulo") e aciono a busca, então vejo uma lista de cidades correspondentes ao termo.
- **AC1.2** — Dado que a busca está em andamento, quando aguardo a resposta, então vejo um indicador de carregamento (RF6.1).
- **AC1.3** — Dado que digitei um termo que não corresponde a nenhuma cidade, quando a busca é concluída, então vejo uma mensagem em pt-BR informando que nenhuma cidade foi encontrada, sem mensagem de erro técnica (RF1.3, RF6.3).
- **AC1.4** — Dado que o campo de busca está vazio ou contém apenas espaços, quando tento buscar, então nenhuma consulta é disparada e nenhum erro é exibido (RF1.4).
- **AC1.5** — Dado que a busca aceita acentos e caracteres especiais, quando digito "São Paulo" ou "Sao Paulo", então obtenho resultados coerentes para a cidade.

### US2 / RF1 — Desambiguação de cidades homônimas

- **AC2.1** — Dado que busquei um nome com múltiplas cidades homônimas (ex.: "Springfield"), quando a lista de resultados é exibida, então cada item mostra nome, estado/região (quando disponível) e país.
- **AC2.2** — Dado que a lista de resultados está visível, quando seleciono um item, então os dados de clima exibidos correspondem exatamente à cidade escolhida, identificada na tela (RF2.3).

### US3 / RF2 — Clima atual

- **AC3.1** — Dado que selecionei uma cidade, quando os dados são carregados, então vejo temperatura atual, descrição da condição do tempo em pt-BR, sensação térmica, umidade e velocidade do vento.
- **AC3.2** — Dado que os dados do clima estão sendo carregados, quando aguardo, então vejo um indicador de carregamento no lugar dos dados (RF6.1).
- **AC3.3** — Dado que a fonte de dados falhou ou excedeu o tempo limite, quando a consulta termina, então vejo uma mensagem de erro em pt-BR com ação de tentar novamente, e nenhum dado desatualizado é apresentado como atual (RF6.2, RNF4).
- **AC3.4** — Dado que o clima atual está exibido, quando observo a tela, então o nome da cidade (com desambiguação) está visível junto aos dados.

### US4 / RF3 — Previsão de 5 dias

- **AC4.1** — Dado que selecionei uma cidade, quando a previsão é carregada, então vejo exatamente 5 dias, começando pelo dia atual, em ordem cronológica.
- **AC4.2** — Dado que a previsão está exibida, quando observo cada dia, então vejo identificação do dia (data e/ou dia da semana em pt-BR), temperaturas mínima e máxima e condição geral do tempo.
- **AC4.3** — Dado que a previsão falhou ao carregar, quando a consulta termina, então vejo mensagem de erro com ação de tentar novamente, sem exibir previsão parcial como se fosse completa (RF6.2).

### US5 / RF4 — Alternância de unidades

- **AC5.1** — Dado que abri a aplicação pela primeira vez e consultei uma cidade, quando observo as temperaturas, então todas estão em Celsius (°C) (RF4.1).
- **AC5.2** — Dado que estou visualizando o clima em Celsius, quando alterno para Fahrenheit, então **todas** as temperaturas visíveis (atual, sensação térmica, mínimas e máximas da previsão) passam a ser exibidas em °F, com valores convertidos corretamente e símbolo da unidade visível (RF4.2).
- **AC5.3** — Dado que alternei a unidade, quando a troca é aplicada, então a cidade selecionada e o período da previsão permanecem inalterados e não é necessária nova busca (RF4.3).
- **AC5.4** — Dado que alterno a unidade repetidas vezes, quando observo os valores, então eles permanecem consistentes (a conversão é reversível, sem acumular distorções perceptíveis de arredondamento).

### US6 / RF5 — Dispositivos móveis

- **AC6.1** — Dado que acesso a aplicação em uma tela de largura móvel representativa (ex.: 360–414 px), quando uso busca, clima atual, previsão e alternância de unidade, então todas as funções são utilizáveis sem rolagem horizontal e sem sobreposição de conteúdo.
- **AC6.2** — Dado que uso toque como método de interação, quando aciono controles (busca, seleção de cidade, alternância de unidade, tentar novamente), então todos respondem a toque com áreas de acionamento adequadas.

### US7 / RF6 — Estados de carregamento e erro

- **AC7.1** — Dado que qualquer consulta (busca ou dados de clima) está em andamento, quando aguardo, então um indicador de carregamento é exibido e os controles não sugerem que os dados já estão disponíveis.
- **AC7.2** — Dado que uma consulta falhou (rede indisponível, erro da fonte ou timeout), quando a falha é detectada, então vejo mensagem de erro clara em pt-BR e uma ação de tentar novamente que reexecuta a consulta.
- **AC7.3** — Dado que uma consulta falhou, quando a mensagem de erro é exibida, então nenhum dado anterior é apresentado como se fosse atual sem indicação clara de que pode estar desatualizado (RNF4).

### US8 / RF6 — Estado vazio

- **AC8.1** — Dado que abri a aplicação e ainda não realizei nenhuma busca, quando observo a tela, então vejo um estado inicial claro orientando a buscar uma cidade (sem erro e sem dados fictícios).
- **AC8.2** — Dado que a busca retornou zero resultados, quando a lista seria exibida, então vejo mensagem orientando a revisar o termo digitado.

## 5. Non-Functional Requirements

- **RNF1 — Responsividade:** a interface deve se adaptar a telas móveis (prioridade) e a tamanhos maiores (tablet/desktop), sem perda de funcionalidade nem rolagem horizontal nos fluxos principais.
- **RNF2 — Usabilidade e acessibilidade:**
  - Fluxos de busca, consulta e troca de unidade devem ser compreensíveis sem instruções externas.
  - A aplicação deve ser operável por teclado e por toque, sem depender exclusivamente de um método de interação.
  - Textos, mensagens e rótulos em pt-BR; elementos interativos com rótulos acessíveis; contraste de texto legível; estados de carregamento e erro perceptíveis por tecnologias assistivas.
- **RNF3 — Atualidade e confiabilidade dos dados:** os dados exibidos devem refletir as informações mais recentes disponíveis na fonte Open-Meteo; a aplicação não deve apresentar dados como atuais quando a consulta falhou.
- **RNF4 — Resiliência:** falhas de rede, indisponibilidade da fonte ou lentidão (timeout) devem resultar em mensagens claras e possibilidade de nova tentativa, nunca em tela travada, quebrada ou silenciosamente vazia.
- **RNF5 — Performance:** a aplicação deve fornecer feedback visual imediato (< 1 s) a qualquer ação do usuário; consultas que excedam um tempo limite razoável devem ser tratadas como erro recuperável (timeout) em vez de espera indefinida.
- **RNF6 — Privacidade:** nenhum dado pessoal do usuário é coletado, enviado ou armazenado em servidor próprio; as consultas à fonte de dados limitam-se ao necessário (termo de busca/coordenadas da cidade).
- **RNF7 — Formatos regionais:** datas, dias da semana e números devem seguir convenções pt-BR (ex.: formato de data dd/mm, separador decimal vírgula quando aplicável).

## 6. Edge Cases

- **Busca:**
  - Termo vazio ou somente espaços → não executar consulta (AC1.4).
  - Termo com acentos, cedilha, hífens ou apóstrofos (ex.: "São João d'Aliança") → busca deve funcionar.
  - Termo muito curto (1–2 caracteres) → resultados possivelmente amplos; sistema deve lidar sem erro.
  - Nenhum resultado encontrado → mensagem de vazio orientando o usuário (AC8.2).
  - Muitos resultados homônimos → lista com desambiguação (estado/região, país) (AC2.1).
  - Caracteres não alfabéticos ou emojis → tratar como busca sem resultados, sem quebra.
- **Dados meteorológicos:**
  - Fonte de dados indisponível (erro HTTP/da fonte) → estado de erro com tentar novamente (AC7.2).
  - Timeout/resposta lenta → tratar como erro recuperável (RNF5).
  - Sem conexão de internet → mensagem clara de falha de conexão.
  - Resposta incompleta da fonte (campo ausente, ex.: sensação térmica indisponível) → omitir o campo com indicação neutra (ex.: "—") em vez de exibir valor incorreto ou quebrar.
  - Fonte retorna menos de 5 dias de previsão → exibir os dias disponíveis com indicação de dados incompletos, sem apresentar como previsão completa.
- **Unidades:**
  - Alternância durante carregamento → aplicar a unidade escolhida quando os dados chegarem, sem estado inconsistente.
  - Alternâncias repetidas → valores consistentes, sem distorção acumulada (AC5.4).
- **Contexto temporal e geográfico:**
  - Virada de dia (fuso da cidade ≠ fuso do usuário) → o "dia atual" da previsão deve corresponder ao dia local da cidade consultada.
  - Cidades com nomes idênticos no mesmo país → desambiguação por estado/região deve permitir distinção.
- **Interação:**
  - Nova busca iniciada enquanto outra consulta está em andamento → apenas o resultado da consulta mais recente deve ser exibido (sem resultados "atrasados" sobrescrevendo os atuais).

## 7. Assumptions

Premissas herdadas do discovery (refinadas) e novas premissas adotadas nesta especificação:

1. O usuário escolhe a cidade exclusivamente por busca textual; **detecção automática de localização não faz parte desta versão** (ver Out of Scope).
2. A aplicação requer conexão com a internet; não há modo offline nem cache de longa duração nesta versão.
3. Não há contas, autenticação ou compartilhamento de dados pessoais.
4. Celsius e Fahrenheit representam os mesmos dados meteorológicos; a alternância é apenas de apresentação e não altera cidade nem período.
5. **Granularidade da previsão (proposta de resolução):** a previsão de 5 dias é **diária** (mínima, máxima e condição geral por dia); detalhamento por horário fica fora desta versão. Registrada aqui como premissa; pode ser revista pelo produto.
6. **Persistência da preferência de unidade (proposta de resolução):** a preferência de unidade vale **apenas para a sessão em uso**; ao retornar à aplicação, a unidade volta ao padrão Celsius. Persistir a escolha entre visitas pode ser avaliado futuramente.
7. A cobertura geográfica, limites de uso e disponibilidade da fonte Open-Meteo são considerados adequados para esta versão, pendentes de verificação formal (ver Risks).
8. O conjunto mínimo de dados do clima atual (temperatura, condição, sensação térmica, umidade, vento) está disponível na fonte escolhida; campos indisponíveis são omitidos com indicação neutra.
9. A interface é somente em pt-BR; nomes de cidades podem aparecer conforme fornecidos pela fonte (possivelmente em outro idioma/grafia).

## 8. Risks

| # | Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| R1 | Nomes de cidades ambíguos ou repetidos levam o usuário à cidade errada | Alta | Médio | Exibir estado/região e país em todos os resultados antes da seleção (RF1.2); manter identificação da cidade junto aos dados (RF2.3). |
| R2 | Fonte Open-Meteo indisponível, lenta ou sujeita a limites de uso | Média | Alto | Verificar limites/condições de uso da Open-Meteo antes da implementação; tratar timeout e falhas com estados de erro e nova tentativa (RF6.2, RNF4, RNF5). |
| R3 | Inconsistência de unidades entre partes da interface após alternância | Média | Médio | Definir que a alternância afeta todas as temperaturas exibidas (RF4.2); validar consistência via critérios AC5.2 e AC5.4. |
| R4 | Layout ou controles inadequados em telas pequenas | Média | Alto | Priorizar design mobile-first; validar fluxos principais em larguras móveis representativas (AC6.1, AC6.2). |
| R5 | Divergência na interpretação de "cinco dias" | Baixa (mitigado) | Médio | Decisão tomada: hoje + 4 dias seguintes (RF3); granularidade diária assumida (Assumption 5) — confirmar com o produto. |
| R6 | Dados incompletos ou ausentes na resposta da fonte | Média | Médio | Omitir campos indisponíveis com indicação neutra; nunca exibir valores inventados (Edge Cases). |
| R7 | Dia atual incorreto devido a diferença de fuso entre usuário e cidade | Baixa | Médio | Usar o fuso/dia local da cidade consultada como referência da previsão (Edge Cases). |
| R8 | Descrições de condição do tempo da fonte não disponíveis em pt-BR | Média | Baixo | Mapear os códigos/condições da fonte para descrições em pt-BR mantidas pelo produto. |

## 9. Out of Scope

Explicitamente fora desta versão:

- Autenticação, contas de usuário e qualquer persistência de dados em servidor (decisão do discovery).
- Detecção automática da localização do usuário (geolocalização).
- Favoritos, histórico de buscas ou múltiplas cidades salvas.
- Previsão detalhada por horário (granularidade intradiária).
- Modo offline, cache de longa duração ou dados pré-carregados.
- Notificações e alertas meteorológicos (chuva forte, tempestades etc.).
- Outros idiomas além de pt-BR e configurações regionais alternativas.
- Mapas meteorológicos, radar, gráficos avançados ou dados históricos.
- Compartilhamento de resultados em redes sociais.
- Aplicativo nativo (iOS/Android) como entregável distinto — o escopo é uma aplicação acessível em dispositivos móveis.

## 10. Open Questions

Ambiguidades remanescentes **não** resolvidas pelas decisões do discovery (as parcialmente resolvidas foram tratadas como Assumptions 5 e 6, sujeitas a confirmação do produto):

1. **Navegadores e plataformas suportados:** quais navegadores/versões mínimas e plataformas móveis devem ser oficialmente suportados e testados?
2. **Busca com sugestões:** a busca deve sugerir resultados enquanto o usuário digita (autocomplete) ou apenas após ação explícita de buscar?
3. **Dados adicionais:** além do conjunto mínimo definido (RF2.1/RF2.2), o produto deseja exibir outros dados (probabilidade de chuva, índice UV, nascer/pôr do sol, pressão atmosférica)?
4. **Persistência local da preferência de unidade:** a escolha C/F deve ser lembrada entre visitas (armazenamento local no dispositivo)? Assumption 6 propõe não persistir nesta versão — confirmar.
5. **Granularidade da previsão:** confirmar a premissa de previsão diária (Assumption 5) ou incluir faixas de horário em versão futura.
6. **Requisitos formais de acessibilidade e disponibilidade:** há meta formal (ex.: conformidade WCAG em nível específico, SLA de disponibilidade) a ser atendida, além das diretrizes gerais de RNF2?
7. **Limites de uso da Open-Meteo:** quais são os limites práticos (requisições/dia) e eles comportam o volume esperado de usuários? Há plano de contingência caso sejam excedidos?
