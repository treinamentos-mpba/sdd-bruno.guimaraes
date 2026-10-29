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

- **Fonte de dados:** APIs públicas de geocodificação e previsão da Open-Meteo; sem API key.
- **Previsão de 5 dias:** hoje + os 4 dias seguintes.
- **Granularidade da previsão:** diária, com mínima, máxima e condição geral por dia; previsão por horário fica fora desta versão.
- **Unidade padrão:** Celsius (°C), com alternância para Fahrenheit (°F).
- **Persistência da unidade:** a preferência vale apenas durante a sessão; uma nova sessão começa em Celsius.
- **Modo de busca:** envio explícito pelo botão ou tecla Enter; sem autocomplete nesta versão.
- **Exibição de dados adicionais:** somente o conjunto mínimo definido nesta especificação.
- **Sem autenticação e sem persistência de servidor.**
- **Idioma da interface:** pt-BR.

### Público-alvo

Usuários em geral, prioritariamente em dispositivos móveis, que desejam consultar o clima de uma ou mais cidades de forma rápida e sem fricção.

## 2. Functional Requirements

- **RF1 — Buscar cidades:** o sistema deve permitir que o usuário pesquise uma cidade pelo nome e selecione o local desejado entre os resultados.
  - RF1.1 — A busca só é enviada por ação explícita (botão ou Enter). O sistema remove espaços no início/fim e normaliza Unicode NFC antes de enviar o termo.
  - RF1.2 — Termos com 1 a 100 pontos de código Unicode são aceitos; termos vazios ou acima do limite não são enviados. Termos com acentos, hífens, apóstrofos ou outros alfabetos não devem ser rejeitados por validação restrita ao alfabeto latino.
  - RF1.3 — Cada resultado deve exibir o nome da cidade, o país e o estado/região quando fornecido pela fonte. A lista segue a ordem de relevância da fonte e contém no máximo 10 resultados.
  - RF1.4 — O sistema deve comunicar quando uma busca concluída com sucesso não encontrar cidades.
  - RF1.5 — O sistema deve distinguir busca sem resultados de falha de rede, timeout, limite excedido ou erro da fonte; somente a busca bem-sucedida sem correspondências é estado vazio.
  - RF1.6 — A busca deve apresentar estado de carregamento, permitir nova tentativa em falha e descartar resultados de qualquer busca anterior à mais recente.
  - RF1.7 — Ao selecionar um resultado, preservar sua identidade fornecida pela fonte (incluindo coordenadas e desambiguação) para consultar o clima sem nova busca por nome.
- **RF2 — Consultar clima atual:** o sistema deve exibir as condições meteorológicas atuais da cidade selecionada.
  - RF2.1 — Exibir temperatura atual e condição meteorológica em pt-BR. São campos essenciais; se qualquer um faltar ou for inválido, a seção é indisponível e apresenta erro recuperável.
  - RF2.2 — Exibir sensação térmica, umidade relativa e velocidade do vento. São complementares: se ausentes ou inválidos, manter o rótulo e exibir "—".
  - RF2.3 — Exibir a cidade selecionada (nome, região/estado quando disponível e país) junto aos dados.
  - RF2.4 — Exibir o horário de referência informado pela fonte no fuso da cidade. Se ausente, exibir a hora de recebimento da resposta convertida para o fuso da cidade e identificada como horário da consulta.
  - RF2.5 — Disponibilizar atualização manual dos dados. Não atualizar automaticamente; atualizar ou repetir uma falha afeta apenas a seção solicitada.
  - RF2.6 — Para requisições concorrentes da mesma cidade e seção, somente a resposta da ação mais recente pode atualizar a interface.
- **RF3 — Consultar previsão de 5 dias:** o sistema deve exibir a previsão para cinco dias, sendo o dia atual + os quatro dias seguintes.
  - RF3.1 — Para cada dia, exibir a data local, dia da semana em pt-BR, temperatura mínima e máxima e condição geral.
  - RF3.2 — Usar o fuso IANA retornado pela fonte para identificar o dia atual e ordenar a previsão do dia local atual até D+4; não usar o fuso do dispositivo. Se não houver fuso válido, a previsão é indisponível e deve apresentar erro recuperável.
  - RF3.3 — Exibir as datas locais D, D+1, D+2, D+3 e D+4, em ordem cronológica, independentemente da ordem de resposta da fonte. Ignorar datas adicionais; se uma data esperada estiver ausente, aplicar RF3.4 e identificar a previsão como incompleta.
  - RF3.4 — Temperaturas e condição são obrigatórias por dia. Valores ausentes/inválidos são indicados como "—" e o dia é marcado como incompleto; não estimar nem substituir dados.
- **RF4 — Alternar unidades:** o sistema deve permitir alternar entre Celsius e Fahrenheit e apresentar as temperaturas na unidade escolhida.
  - RF4.1 — A unidade inicial é Celsius (°C).
  - RF4.2 — A alternância afeta todas as temperaturas exibidas, incluindo atual, sensação térmica, mínimas e máximas. Exibir unidade junto a cada valor.
  - RF4.3 — A alternância não deve alterar a cidade selecionada nem o período consultado, nem exigir nova busca pelo usuário.
  - RF4.4 — Converter a partir dos valores originais com precisão integral da fonte, nunca a partir de valores já arredondados ou convertidos.
- **RF5 — Uso em dispositivos móveis:** todas as funções principais (busca, clima atual, previsão, alternância de unidade) devem estar disponíveis e utilizáveis em dispositivos móveis.
- **RF6 — Estados de carregamento, erro e vazio:** o sistema deve comunicar claramente, em pt-BR:
  - RF6.1 — Estado de carregamento enquanto busca cidades ou dados meteorológicos.
  - RF6.2 — Estados de erro distintos para falha de conexão, timeout, limite de uso, resposta inválida e indisponibilidade da fonte, com nova tentativa explícita.
  - RF6.3 — Estado inicial antes de uma consulta e estado sem resultados apenas após busca bem-sucedida sem correspondências.
  - RF6.4 — Ao selecionar outra cidade, remover imediatamente os dados da cidade anterior. Em atualização da mesma cidade que falhar, manter os dados anteriores somente se identificados como desatualizados, com o horário da última consulta bem-sucedida.

## 3. User Stories

O discovery descreve usuários em geral, sem segmentar personas. Por isso, as histórias usam a persona representativa **usuário que consulta o clima**, sem presumir perfis adicionais.

- **US1 (RF1):** Como usuário que consulta o clima, quero pesquisar uma cidade pelo nome para encontrar o local cujo clima desejo consultar.
- **US2 (RF1):** Como usuário que consulta o clima, quero ver estado/região e país nos resultados da busca para escolher a cidade correta entre homônimas.
- **US3 (RF2):** Como usuário que consulta o clima, quero ver as condições meteorológicas atuais da cidade selecionada para saber como está o tempo agora.
- **US4 (RF3):** Como usuário que consulta o clima, quero ver a previsão de hoje e dos próximos quatro dias para planejar minhas atividades da semana.
- **US5 (RF4):** Como usuário que consulta o clima, quero alternar entre Celsius e Fahrenheit para ler as temperaturas na unidade com que estou acostumado.
- **US6 (RF5):** Como usuário que consulta o clima em um dispositivo móvel, quero usar as funções principais do app em uma tela pequena para consultar o clima onde estiver.
- **US7 (RF6):** Como usuário que consulta o clima, quero ver quando os dados estão carregando ou quando ocorre uma falha para entender o estado da aplicação e poder tentar novamente.
- **US8 (RF1/RF6):** Como usuário que consulta o clima, quero receber uma mensagem clara quando minha busca não encontrar cidades para corrigir o termo digitado sem confusão.

## 4. Acceptance Criteria

### US1 / RF1 — Buscar cidades

- **AC1.1 (RF1.1)** — Dado que estou na tela inicial e informo o nome de uma cidade existente, quando aciono a busca e ela é concluída, então vejo uma lista com as cidades correspondentes retornadas pela busca.
- **AC1.1a (RF1.2, RF1.3)** — Dado que informo um termo com 1 a 100 pontos de código Unicode, quando aciono a busca, então o sistema envia o termo aparado e normalizado em NFC e exibe no máximo 10 resultados na ordem retornada pela fonte.
- **AC1.1b (RF1.2)** — Dado que informo um termo com mais de 100 pontos de código Unicode, quando tento buscar, então nenhuma requisição é enviada e recebo orientação para corrigir o campo.
- **AC1.2 (RF6.1)** — Dado que uma busca por cidade foi iniciada e ainda não foi concluída, quando aguardo a resposta, então vejo um indicador de carregamento até a busca terminar.
- **AC1.3 (RF1.4, RF6.3)** — Dado que informei um termo sem cidades correspondentes, quando a busca é concluída com sucesso e sem resultados, então vejo uma mensagem em pt-BR informando que nenhuma cidade foi encontrada e orientando a revisar o termo.
- **AC1.4 (RF1.2)** — Dado que o campo de busca está vazio ou contém apenas espaços, quando tento buscar, então nenhuma consulta é enviada, o campo recebe foco e uma orientação acessível informa que devo digitar uma cidade.
- **AC1.5 (caso de busca)** — Dado que uma cidade pode ser encontrada com ou sem acentos, quando busco por "São Paulo" ou "Sao Paulo", então a lista inclui a cidade correspondente em ambos os casos.
- **AC1.6 (RF1.6)** — Dado que duas buscas foram iniciadas em sequência e a resposta da primeira chega por último, quando os resultados são exibidos, então somente os resultados da segunda busca permanecem visíveis.

### US2 / RF1 — Desambiguação de cidades homônimas

- **AC2.1 (RF1.3)** — Dado que a busca retorna cidades homônimas, quando a lista de resultados é exibida, então cada item mostra o nome da cidade e o país, além do estado/região quando essa informação estiver disponível.
- **AC2.2 (RF1)** — Dado que a lista de resultados está visível, quando seleciono uma cidade, então a consulta meteorológica usa o local selecionado e a tela identifica essa mesma cidade (RF2.3).

### US3 / RF2 — Clima atual

- **AC3.1 (RF2.1, RF2.2)** — Dado que selecionei uma cidade e a consulta retornou campos essenciais válidos, quando observo os dados, então vejo temperatura atual e condição em pt-BR; sensação térmica, umidade relativa em % e velocidade do vento em km/h são exibidos quando disponíveis, ou como "—".
- **AC3.2 (RF2.2, caso de resposta incompleta)** — Dado que a fonte não retornou um dos dados complementares, quando o clima atual é exibido, então o campo indisponível apresenta uma indicação neutra (como "—") e os demais dados disponíveis continuam visíveis.
- **AC3.3 (RF2.1, RF6.2)** — Dado que a consulta falhou, excedeu 10 s ou não retornou temperatura/condição válidas, quando a falha é detectada, então vejo erro em pt-BR e uma ação de tentar novamente; não vejo dados de outra cidade nem dados anteriores sem indicação de desatualização.
- **AC3.4 (RF2.3)** — Dado que os dados do clima atual estão exibidos, quando observo a tela, então vejo junto a eles o nome da cidade consultada e as informações de desambiguação disponíveis.
- **AC3.5 (RF2.4)** — Dado que a consulta de clima atual foi concluída, quando observo os dados, então vejo o horário de referência da fonte no fuso local da cidade; se ausente, vejo a hora de recebimento da resposta, convertida para o fuso da cidade e identificada como horário da consulta.
- **AC3.6 (RF2.5)** — Dado que os dados estão exibidos, quando aciono atualizar, então somente as seções meteorológicas da cidade selecionada são consultadas novamente e o horário é atualizado após sucesso.

### US4 / RF3 — Previsão de 5 dias

- **AC4.1 (RF3.2, RF3.3)** — Dado que selecionei uma cidade com fuso válido, quando a previsão é exibida, então vejo as datas locais D a D+4 em ordem cronológica, sem datas extras; D corresponde à data atual no fuso da cidade.
- **AC4.2 (RF3.1, RF3.2)** — Dado que um dia da previsão está disponível, quando observo esse dia, então vejo a data no formato dd/MM/yyyy, o dia da semana em pt-BR, as temperaturas mínima e máxima arredondadas para o inteiro mais próximo e a condição geral.
- **AC4.3 (RF6.2)** — Dado que a consulta da previsão falhou ou excedeu o tempo limite, quando a falha é detectada, então vejo uma mensagem de erro em pt-BR e uma ação de tentar novamente, sem previsão parcial apresentada como completa.
- **AC4.4 (RF3.3, RF3.4)** — Dado que faltam uma ou mais datas entre D e D+4, ou que há valores obrigatórios ausentes, quando a previsão é exibida, então mostro os dias e valores disponíveis, indico campos ausentes com "—" e identifico a previsão ou o dia como incompleto.

### US5 / RF4 — Alternância de unidades

- **AC5.1 (RF4.1)** — Dado que iniciei uma sessão e consultei uma cidade, quando observo as temperaturas, então elas são apresentadas em Celsius (°C) por padrão.
- **AC5.2 (RF4.2, RF4.4)** — Dado que há temperaturas exibidas em Celsius, quando seleciono Fahrenheit, então todas as temperaturas disponíveis do clima atual, da sensação térmica e da previsão passam a ser exibidas em Fahrenheit (°F), arredondadas para o inteiro mais próximo, com símbolo visível e conversão conforme °F = (°C × 9/5) + 32; por exemplo, 0 °C resulta em 32 °F e 20 °C em 68 °F. A conversão inversa usa °C = (°F − 32) × 5/9.
- **AC5.3 (RF4.3)** — Dado que estou consultando uma cidade e uma previsão, quando alterno a unidade, então a cidade e as datas da previsão permanecem as mesmas e não preciso realizar uma nova busca pela cidade.
- **AC5.4 (RF4.2, caso de alternância repetida)** — Dado que alternei entre Celsius e Fahrenheit várias vezes, quando retorno a Celsius, então cada temperatura exibida corresponde ao mesmo inteiro mostrado antes da alternância, sem acumular diferenças de conversão.
- **AC5.5 (RF4, caso de carregamento)** — Dado que uma consulta meteorológica está em andamento, quando altero a unidade antes de a resposta chegar, então os dados são exibidos na unidade escolhida quando a consulta terminar.

### US6 / RF5 — Dispositivos móveis

- **AC6.1 (RF5, RNF1)** — Dado que acesso a aplicação em larguras de 320, 360, 414, 768, 1024 e 1440 px, quando concluo os fluxos principais, então todos os controles e dados permanecem utilizáveis, sem rolagem horizontal nem sobreposição.
- **AC6.2 (RF5)** — Dado que acesso a aplicação em um dispositivo móvel com interação por toque, quando aciono a busca, seleciono um resultado, alterno a unidade ou tento novamente uma consulta, então cada controle executa a ação correspondente.
- **AC6.3 (RNF2)** — Dado que uso a aplicação sem mouse e com leitor de tela, quando navego pelos fluxos principais, então todos os controles têm nome acessível, ordem de foco lógica, foco visível, estados de carregamento e erro anunciados e nenhuma informação é comunicada somente por cor.
- **AC6.4 (RNF2)** — Dado que verifico a interface, quando meço os alvos de toque, então cada alvo interativo tem pelo menos 44 × 44 CSS px.

### US7 / RF6 — Estados de carregamento e erro

- **AC7.1 (RF6.1)** — Dado que uma busca por cidade ou consulta meteorológica foi iniciada e ainda está pendente, quando aguardo a resposta, então vejo um indicador de carregamento até a consulta terminar.
- **AC7.2 (RF6.2)** — Dado que uma consulta falhou por falta de conexão, indisponibilidade da fonte ou timeout, quando a falha é detectada, então vejo uma mensagem clara em pt-BR e uma ação de tentar novamente que reexecuta a consulta que falhou.
- **AC7.3 (RF6.2, RNF3, RNF4)** — Dado que uma consulta falhou, quando o estado de erro é exibido, então dados de uma consulta anterior não são apresentados como se fossem atuais.
- **AC7.4 (RF2.6, RF6.4)** — Dado que iniciei consultas para cidades diferentes em sequência e a resposta da consulta mais antiga chega por último, quando a interface atualiza, então somente dados da cidade selecionada mais recentemente são exibidos. Para consultas repetidas da mesma seção e cidade, somente a resposta da ação mais recente é aplicada.
- **AC7.5 (RF2, RF3, RF6.2)** — Dado que a consulta do clima atual ou da previsão falha, quando a outra consulta é concluída com sucesso, então os dados bem-sucedidos permanecem visíveis e a seção com falha apresenta seu próprio erro e ação de tentar novamente; a nova tentativa reexecuta apenas a seção que falhou.
- **AC7.6 (RF6.4)** — Dado que atualizo uma cidade e a atualização falha, quando o estado de erro é exibido, então os dados anteriores da mesma cidade permanecem identificados como desatualizados com seu horário; ao selecionar outra cidade, esses dados são removidos antes da nova consulta.
- **AC7.7 (RF1.5, RF6.2)** — Dado que a fonte retorna lista vazia, erro HTTP, HTTP 429, timeout ou resposta inválida, quando a busca termina, então somente a lista vazia produz estado sem resultados; os demais casos exibem erro recuperável em pt-BR.

### US8 / RF6 — Estado vazio

- **AC8.1 (RF6.3)** — Dado que abri a aplicação e ainda não realizei nenhuma consulta, quando observo a tela inicial, então vejo uma orientação para buscar uma cidade, sem mensagem de erro ou dados meteorológicos fictícios.
- **AC8.2 (RF1.4, RF6.3)** — Dado que uma busca foi concluída sem resultados, quando a área de resultados é exibida, então vejo uma mensagem em pt-BR orientando a revisar o termo digitado.

## 5. Non-Functional Requirements

- **RNF1 — Responsividade:** a interface deve se adaptar a telas móveis (prioridade) e a tamanhos maiores (tablet/desktop), sem perda de funcionalidade nem rolagem horizontal nos fluxos principais.
- **RNF1.1 — Plataformas suportadas:** suportar as duas versões estáveis mais recentes de Chrome, Edge e Firefox em desktop, Safari em macOS e Safari em iOS, e Chrome em Android. Validar no mínimo uma versão atual e a versão anterior de cada navegador/plataforma no lançamento.
- **RNF2 — Usabilidade e acessibilidade:**
  - Fluxos de busca, consulta e troca de unidade devem ser compreensíveis sem instruções externas.
  - A aplicação deve ser operável por teclado e por toque, sem depender exclusivamente de um método de interação.
  - Atender WCAG 2.2 nível AA. Contraste mínimo: 4,5:1 para texto comum e 3:1 para texto grande e componentes gráficos; estados de carregamento e erro anunciados por tecnologia assistiva; conteúdo não depende somente de cor.
- **RNF3 — Atualidade e confiabilidade dos dados:** exibir horário de referência da fonte e fuso da cidade; não apresentar dados de outra cidade como atuais. Dados mantidos após falha de atualização devem estar claramente marcados como desatualizados.
- **RNF4 — Resiliência:** cada requisição deve terminar em sucesso, erro ou timeout em até 10 s; novas tentativas são acionadas pelo usuário, não automaticamente. Erros de busca, clima atual e previsão devem ser isolados por seção.
- **RNF5 — Performance:** o feedback visual da ação deve aparecer em até 1 s. Em cinco execuções do build de produção com Lighthouse mobile, viewport 360 × 800 e perfil de rede 4G simulado, o percentil 75 deve atender LCP ≤ 2,5 s, TBT ≤ 200 ms e CLS ≤ 0,1. Tempo de resposta da API externa não integra essas medições, mas está sujeito ao timeout de 10 s.
- **RNF6 — Privacidade e segurança:** não coletar dados analíticos, identificadores ou dados pessoais. Enviar à Open-Meteo somente o termo pesquisado ou as coordenadas necessárias; não armazenar buscas ou localização entre sessões. Requisições devem usar HTTPS; nenhum segredo ou credencial pode ser incluído no pacote cliente. Informar na política de privacidade que termo, coordenadas e endereço IP são processados pelo provedor conforme os termos dele.
- **RNF7 — Formatos regionais:** datas devem usar dd/MM/yyyy e dias da semana em pt-BR; separador decimal, quando aplicável, é vírgula. Temperaturas são arredondadas ao inteiro mais próximo, com empate afastado de zero, e exibidas com °C ou °F; umidade é arredondada ao inteiro mais próximo e usa %, e velocidade do vento é arredondada ao inteiro mais próximo e usa km/h.
- **RNF8 — Conformidade da fonte:** antes do lançamento, confirmar e documentar licença, atribuição exigida, limites, uso comercial aplicável e política de privacidade da Open-Meteo. Exibir atribuição visível com link quando exigida pelos termos da fonte.
- **RNF9 — Condições inválidas:** validar schema, tipos e faixas antes de exibir: umidade deve estar entre 0 e 100%, velocidade do vento deve ser não negativa e mínima diária não pode exceder máxima diária. Valores inválidos seguem as regras de campo ausente; códigos meteorológicos conhecidos devem ser traduzidos para pt-BR e código desconhecido deve resultar em "Condição indisponível", sem quebrar a tela.

## 6. Edge Cases

- **Busca:**
  - Termo vazio ou somente espaços → não executar consulta (AC1.4).
  - Termo com acentos, cedilha, hífens ou apóstrofos (ex.: "São João d'Aliança") → busca deve funcionar.
  - Termo muito curto (1–2 caracteres) → resultados possivelmente amplos; sistema deve lidar sem erro.
  - Nenhum resultado encontrado → mensagem de vazio orientando o usuário (AC8.2).
  - Muitos resultados homônimos → lista com desambiguação (estado/região, país) (AC2.1).
  - Caracteres não alfabéticos ou emojis → enviar a busca normalmente; se a fonte responder com sucesso sem correspondências, exibir estado vazio. Se a fonte falhar, exibir erro recuperável; em nenhum caso a interface deve quebrar.
- **Dados meteorológicos:**
  - Fonte de dados indisponível (erro HTTP/da fonte) → estado de erro com tentar novamente (AC7.2).
  - Timeout/resposta lenta → tratar como erro recuperável (RNF5).
  - Sem conexão de internet → mensagem clara de falha de conexão.
  - Resposta incompleta da fonte (campo complementar ausente, ex.: sensação térmica) → manter o rótulo com "—", sem exibir valor incorreto ou quebrar.
  - Fonte retorna menos de cinco datas entre D e D+4 → exibir os dias disponíveis e indicar previsão incompleta; dados para datas posteriores a D+4 são ignorados (AC4.1, AC4.4).
  - Temperatura atual ou condição geral ausente → tratar a seção de clima atual como indisponível e exibir erro recuperável, sem inventar valores. Complementos ausentes → manter o rótulo com "—" (AC3.2). Dados obrigatórios de um dia ausentes → marcar esse dia como incompleto e identificá-lo, sem substituir valores por estimativas.
  - HTTP 429 ou resposta equivalente de limite excedido → informar indisponibilidade temporária e oferecer nova tentativa manual; não repetir automaticamente.
  - Código de condição desconhecido ou fora da tabela de tradução → exibir "Condição indisponível" e manter os demais dados válidos.
- **Unidades:**
  - Alternância durante carregamento → aplicar a unidade escolhida quando os dados chegarem, sem estado inconsistente.
  - Alternâncias repetidas → valores consistentes, sem distorção acumulada (AC5.4).
- **Contexto temporal e geográfico:**
  - Virada de dia (fuso da cidade ≠ fuso do usuário) → o "dia atual" da previsão deve corresponder ao dia local da cidade consultada.
  - Cidades com nomes idênticos no mesmo país → desambiguação por estado/região deve permitir distinção.
- **Interação:**
  - Nova busca iniciada enquanto outra consulta está em andamento → apenas o resultado da consulta mais recente deve ser exibido (sem resultados "atrasados" sobrescrevendo os atuais).
  - Falha isolada na consulta de clima atual ou na previsão → manter a seção concluída com sucesso e permitir nova tentativa apenas para a seção que falhou (AC7.5).

## 7. Assumptions

Premissas herdadas do discovery (refinadas) e novas premissas adotadas nesta especificação:

1. O usuário escolhe a cidade exclusivamente por busca textual; **detecção automática de localização não faz parte desta versão** (ver Out of Scope).
2. A aplicação requer conexão com a internet; não há modo offline nem cache de longa duração nesta versão.
3. Não há contas, autenticação ou compartilhamento de dados pessoais.
4. Celsius e Fahrenheit representam os mesmos dados meteorológicos; a alternância é apenas de apresentação e não altera cidade nem período.
5. A previsão é diária (mínima, máxima e condição geral); detalhamento por horário fica fora desta versão.
6. A preferência de unidade vale apenas para a sessão; uma nova sessão começa em Celsius.
7. A cobertura geográfica e a disponibilidade da Open-Meteo são adequadas para esta versão; limites e condições de uso são uma condição de liberação, não uma garantia do produto.
8. A temperatura e a condição geral são campos essenciais do clima atual; se ausentes, a seção é tratada como indisponível. Complementos ausentes são indicados por "—"; dados diários obrigatórios ausentes são marcados como incompletos.
9. A interface é somente em pt-BR; nomes de cidades podem aparecer conforme fornecidos pela fonte (possivelmente em outro idioma/grafia).

## 8. Risks

| # | Risco | Probabilidade | Impacto | Mitigação |
| --- | --- | --- | --- | --- |
| R1 | Nomes de cidades ambíguos ou repetidos levam o usuário à cidade errada | Alta | Médio | Exibir estado/região e país em todos os resultados antes da seleção (RF1.3); manter identificação da cidade junto aos dados (RF2.3). |
| R2 | Fonte Open-Meteo indisponível, lenta ou sujeita a limites de uso | Média | Alto | Antes do lançamento, validar limites/termos frente à projeção de tráfego; aplicar timeout de 10 s e apresentar erro recuperável, sem novas tentativas automáticas (RNF4, RNF8). |
| R3 | Inconsistência de unidades entre partes da interface após alternância | Média | Médio | Definir que a alternância afeta todas as temperaturas exibidas (RF4.2); validar consistência via critérios AC5.2 e AC5.4. |
| R4 | Layout ou controles inadequados em telas pequenas | Média | Alto | Priorizar design mobile-first; validar fluxos principais em larguras móveis representativas (AC6.1, AC6.2). |
| R5 | Divergência na interpretação de "cinco dias" | Baixa (mitigado) | Médio | Decisão tomada: cinco dias locais, hoje + 4 dias seguintes, em granularidade diária; limitar a exibição aos cinco primeiros dias (RF3, RF3.3). |
| R6 | Dados incompletos ou ausentes na resposta da fonte | Média | Médio | Tratar campos essenciais ausentes como indisponibilidade da seção; indicar complementos ausentes com "—" e marcar dias incompletos, sem exibir valores inventados (Edge Cases). |
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
- Busca por autocomplete, dados meteorológicos adicionais além do conjunto mínimo e atualização automática.
- Garantia de disponibilidade (SLA) sobre a Open-Meteo ou funcionamento offline.

## 10. Production Release Gates

Antes de publicar em produção:

1. Confirmar que os termos, licença, atribuição e limites da Open-Meteo permitem o uso previsto e comportam a projeção de tráfego; registrar a fonte e a data da verificação.
2. Publicar política de privacidade que identifique a Open-Meteo como destinatária do termo de busca/coordenadas e informe o processamento do endereço IP pelo provedor.
3. Executar a matriz de navegadores/plataformas (RNF1.1), testes de acessibilidade WCAG 2.2 AA e medições das metas de performance RNF5.
4. Confirmar que HTTPS, ausência de segredos no pacote cliente e tratamento de falha/HTTP 429 foram verificados na implantação de produção.
