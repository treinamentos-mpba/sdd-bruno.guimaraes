## Contexto

A empresa precisa de uma aplicação de previsão do tempo para que usuários consultem as condições de uma cidade e planejem os próximos dias. A experiência deve funcionar em dispositivos móveis e permitir a alternância entre Celsius e Fahrenheit. O briefing ainda não define plataforma, fonte de dados, localização, idioma nem detalhes das informações meteorológicas exibidas.

## Requisitos Funcionais

- **RF1 — Buscar cidades:** permitir que o usuário pesquise uma cidade pelo nome e selecione o local desejado.
- **RF2 — Consultar clima atual:** exibir as condições meteorológicas atuais da cidade selecionada.
- **RF3 — Consultar previsão:** exibir a previsão para cinco dias.
- **RF4 — Alternar unidades:** permitir alternar entre Celsius e Fahrenheit e apresentar as temperaturas na unidade escolhida.
- **RF5 — Usar em dispositivos móveis:** disponibilizar as funções principais em dispositivos móveis.

## Requisitos Não-Funcionais

- **RNF1 — Responsividade:** a interface deve se adaptar a telas móveis, além de outros tamanhos de tela que venham a ser incluídos no escopo.
- **RNF2 — Usabilidade:** busca, consulta e troca de unidade devem ser compreensíveis e acessíveis sem depender exclusivamente de um dispositivo ou método de interação específico.
- **RNF3 — Atualidade e confiabilidade dos dados:** as informações devem representar dados meteorológicos atuais e de previsão, conforme a fonte de dados a definir.
- **RNF4 — Resiliência:** a aplicação deve informar o usuário caso não seja possível buscar ou carregar os dados, sem apresentar resultados como se fossem atuais.

## Riscos

| Risco | Probabilidade | Impacto | Mitigação sugerida |
| --- | --- | --- | --- |
| Nomes de cidades ambíguos ou repetidos | Alta | Médio | Apresentar informações de desambiguação, como estado/região e país, antes da seleção. |
| Fonte de dados indisponível, lenta ou sujeita a limites de uso | Média | Alto | Avaliar limites e disponibilidade da fonte; prever estados de erro e nova tentativa. |
| Diferenças entre unidades em partes da previsão | Média | Médio | Definir quais valores são afetados pela alternância e validar que a unidade é consistente em toda a interface. |
| Layout ou controles inadequados em telas pequenas | Média | Alto | Validar os fluxos principais em dispositivos e larguras móveis representativas. |
| Interpretação divergente de “cinco dias” | Média | Médio | Definir se a contagem inclui o dia atual e qual granularidade da previsão será exibida. |

## Perguntas em Aberto

1. A aplicação será web, nativa ou ambas? Quais navegadores e plataformas móveis devem ser suportados?
2. Qual fonte de dados meteorológicos será utilizada? Há requisitos de custo, licença, cobertura geográfica ou disponibilidade?
3. Como o usuário deve escolher uma cidade entre resultados homônimos? Busca deve sugerir resultados enquanto a pessoa digita?
4. A previsão de cinco dias inclui o dia atual? Deve ser diária ou apresentar horários?
5. Quais informações, além da temperatura e condição geral, devem aparecer no clima atual e na previsão?
6. Qual será a unidade inicial e a escolha deve ser lembrada entre visitas?
7. A aplicação deve detectar a localização do usuário, oferecer favoritos ou funcionar com dados previamente carregados?
8. Quais idiomas, formatos de data e convenções regionais devem ser suportados?
9. Há requisitos definidos de acessibilidade, desempenho, privacidade ou disponibilidade?

## Suposições

- O usuário escolhe uma cidade por meio de busca; localização automática não foi solicitada.
- “Previsão de 5 dias” significa um horizonte de cinco dias, mas a inclusão do dia atual ainda precisa ser confirmada.
- A aplicação depende de uma conexão com a internet para obter dados meteorológicos, salvo decisão futura em contrário.
- Não há requisito informado de conta, autenticação ou compartilhamento de dados pessoais.
- Celsius e Fahrenheit devem representar os mesmos dados meteorológicos; a alternância não altera a cidade nem o período consultado.

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** Reduz a necessidade de credenciais e simplifica a integração inicial. Resolve a escolha da fonte na pergunta em aberto 2; cobertura, disponibilidade, limites e condições de uso ainda devem ser verificados.
- **Previsão de cinco dias: hoje + os quatro dias seguintes.** Estabelece um período único para produto, interface e testes. Resolve se a contagem inclui hoje na pergunta em aberto 4; a granularidade (diária ou por horário) continua em aberto.
- **Unidade padrão: Celsius.** Define a unidade exibida na primeira consulta sem impedir a alternância para Fahrenheit. Resolve a unidade inicial na pergunta em aberto 6; persistir a preferência entre visitas ainda não foi decidido.
- **Sem autenticação e sem persistência de servidor.** Mantém a primeira versão sem contas e sem armazenamento de dados do usuário no servidor. Resolve a necessidade de autenticação e persistência de servidor mencionada nas perguntas em aberto 7 e 9; armazenamento local, favoritos e histórico não estão definidos por esta decisão.
- **Idioma da interface: pt-BR.** Fixa o idioma dos textos e mensagens da interface para a primeira versão. Resolve a escolha de idioma na pergunta em aberto 8; outros idiomas e detalhes de localização devem ser tratados separadamente se entrarem no escopo.