# PROJETO DE SOFTWARE

## *Stakeholders*
|NOME|CARGO|E-MAIL|
|:---|:---|:---|
|Dra. Valeria Arenhardt|Professora|valeria.arenhardt@ifro.edu.br|
|Roberto Simplicio Guimaraes|Professor|roberto.simplicio@ifro.edu.br|
|Wesley Jhonnes Ramos Rolim|Professor|wesley.rolim@ifro.edu.br|
|Erick Leonardo Weill|Professor|erick.weil@ifro.edu.br|


# Sumário

* [RESUMO DO PROJETO](#resumo-do-projeto)
* [INTRODUÇÃO](#introdução)
  * [PROPÓSITO DESTE DOCUMENTO](#propósito-deste-documento)
  * [CONCEPÇÃO DO SISTEMA](#concepção-do-sistema)
* [DESCRIÇÃO GERAL](#descrição-geral)
  * [USUÁRIOS DO SISTEMA](#usuários-do-sistema)
  * [ABRANGÊNCIA E SISTEMAS SIMILARES](#abrangência-e-sistemas-similares)
  * [SUPOSIÇÕES E DEPENDÊNCIAS](#suposições-e-dependências)
* [ESTUDO DE VIABILIDADE](#estudo-de-viabilidade)
* [METODOLOGIA ADOTADA NO DESENVOLVIMENTO](#metodologia-adotada-no-desenvolvimento)
* [REQUISITOS DO SOFTWARE](#requisitos-do-software)
  * [REQUISITOS FUNCIONAIS](#requisitos-funcionais)
  * [REQUISITOS NÃO FUNCIONAIS](#requisitos-não-funcionais)
* [PROTOTIPAGEM](#prototipagem)
* [DIAGRAMA DE CASOS DE USO](#diagrama-de-casos-de-uso)
  * [ESPECIFICAÇÃO DOS CASOS DE USO](#descrição--especificação-dos-casos-de-uso)
* [DIAGRAMA DE CLASSES](#diagrama-de-classes)
* [DIAGRAMA DE SEQUÊNCIAS](#diagrama-de-sequências)
* [ DIAGRAMA DE ATIVIDADES](#diagrama-de-atividades)
* [REFERÊNCIAS](#referências)


# RESUMO DO PROJETO

|| |
|:---|:---|
| **NOME** |Dashboard de Métricas |
| **Lider do Projeto** | Giullia Beatriz Chiarotti |
| **PRINCIPAL OBJETIVO** | Facilitar a visualização dos Projetos |
| **BENEFÍCIOS ESPERADOS** | Otimização do Tempo |
| **INÍCIO E TÉRMINO PREVISTOS** | 01/10/2024 - 11/03/2025 |


# INTRODUÇÃO

Este documento apresenta a especificação do Projeto de Software desenvolvido para facilitar a visualização e o acompanhamento de projetos acadêmicos utilizando um dashboard de métricas do GitLab. O sistema proposto permitirá a análise de dados por meio de gráficos intuitivos, proporcionando aos usuários uma visão clara sobre o progresso das atividades e a participação dos envolvidos para os gestores responsaveis.
A documentação detalha os requisitos funcionais e não funcionais, os stakeholders, a metodologia adotada, os diagramas de modelagem e demais aspectos técnicos necessários para garantir a viabilidade e a eficácia do projeto. O objetivo principal é otimizar o tempo dos usuários, oferecendo uma interface prática e eficiente para o monitoramento das informações.
Além disso, este documento busca garantir que todas as informações relevantes para o desenvolvimento e implementação do sistema estejam devidamente organizadas, permitindo uma compreensão clara de cada etapa do projeto e das decisões técnicas adotadas.


## PROPÓSITO DESTE DOCUMENTO

Garantir que todas as informações relevantes para a produção do produto final estejam organizadas para assim facilitar o entendimento do que estiver a cargo da produção!

## CONCEPÇÃO DO SISTEMA

Métodos utilizados para a obtenção dos requisitos do sistema:
  * Baseado em requisitos de Sistemas Semelhantes.


# DESCRIÇÃO GERAL
O H&R é um sistema completo para gerenciamento de estoque de peças automotivas, projetado para facilitar o controle, categorização e monitoramento de itens em lojas de autopeças. O sistema oferece uma abordagem estruturada para classificar peças por valor monetário e tipo de veículo, além de integrar-se com sistemas externos de PDV e emissão de notas fiscais.

## Usuários do sistema
|USUÁRIO|DESCRIÇÃO|
|:---|:---|
|**Gerente Geral:**|Será um usuarios administrador com todos os acessos e permissões.|
|**Gerente de Estoque:**|Será um usuario administrador com permissões especificas.|
|**Estoquista:**|Será um usuario comum que poderá realizar operações de acordo com sua função.|
|**Vendedor:**|Será usuario no ponto de PDV que poderá realizar registros de saídas (vendas)|



### Sistemas similares:
O dashboard vai ser baseado nos projetos desenvolvidos no GitLab, exibindo gráficos intuitivos para os usuários. Alguns exemplos similares ao dashboard de métricas são: 
•	Microsoft Power BI;
•	QilkView;
•	Google Data Studio;
•	O próprio dashboard fornecido pelo GitHub.


## Suposições e dependências

Não será necessário que os usuários tenham um computador muito potente para conseguir acessar o dashboard;
•	Por padrão o computador deve ter uma memória RAM de 4GB;
•	Um processador comum como um Intel Core I3 de 3° Geração ou mais;
•	Um navegador instalado podendo ser o Google Chrome, Microsoft Edge, etc...;
•	Conexão com a internet, preferencialmente com uma velocidade superior ou igual a 5 MB.

# ESTUDO DE VIABILIDADE

Análise de Viabilidade Técnica

Tecnologias Utilizadas:
  * Front-End: React ou Vue.js para criação da interface de usuário, garantindo uma experiência fluida e interativa.

  * Back-End: Node.js para integração com a API do GitLab, manipulando requisições e gerenciando dados.

  * Banco de Dados: Será utilizado MongoDB para persistência das informações.

Escalabilidade:
  * O sistema será projetado para atender às necessidades atuais, com possibilidade de crescimento conforme o número de usuários e dados aumentem.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Viabilidade Econômica
  * Custos de Desenvolvimento:

   Recursos Humanos: O time é composto por 3 desenvolvedores, portanto, o custo de desenvolvimento será baseado nas horas trabalhadas.
   
   Ferramentas: 
  
  * Infraestrutura: 

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Exemplo de Estimativa de Custos:
  * 3 desenvolvedores x 6 meses de trabalho x custo médio:
  * 2.400 x 3 x 6 = 43.200.

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Viabilidade Operacional:
  * Equipe de Manutenção: 

  * Suporte Técnico: 

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Viabilidade Legal
  * Licenciamento e Direitos: 

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Análise de Mercado:
  * Público-Alvo: 
  * Necessidade: 
  * Concorrência: 

------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

Riscos e Mitigações:
  * AAAA: 
  * AAAA: 
  * AAAA: 


# Metodologia Adotada no Desenvolvimento

A metodologia de desenvolvimento escolhida foi a Scrum, utilizada para gerenciar o fluxo de trabalho do projeto de software. O objetivo é garantir transparência, melhoria contínua e eficiência no processo de desenvolvimento.

**Princípios do Kanban**

O Kanban segue os seguintes princípios:
  * otimizar o fluxo de trabalho.
  * Tornar o time mais orientado e produtivo.
  * Aumentar o engajamento da equipe e fortalecer o senso de colaboração.
  * Melhorar processos internos.
  * Viabilizar entregas de maneira pragmática, aumentando a satisfaçãão do cliente.
  * Economizar tempo e recursos.
  * Facilitar a gestão de mudanças.


# Requisitos do Software

A especificação dos requisitos deste documento deve seguir as recomendações da norma IEEE Std-830-1998, levando em conta as recomentações do documento de [características dos requisitos](caracteristicas_requisitos.md).

## Requisitos Funcionais

A tabela a seguir contém a relação dos Requisitos Funcionais elicitados, com as colunas: identificador, nome, descrição e prioridade:

| IDENTIFICADOR | NOME | DESCRIÇÃO |
:---|:---|:---|
|RF-001 |O sistema deve permitir cadastro, edição e exclusão de peças|###################|
|RF-002 |O sistema deve categorizar automaticamente as peças por valor|• Categoria A: R$1.001,00 até R$10.000,00 - Categoria B: R$500,00 até R$1.000,00 - Categoria C: R$0,00 até R$499,00|
|RF-003 |O sistema deve registrar entrada e saída de peças do estoque|###################|
|RF-004 |O sistema deve gerar alertas quando o estoque atingir níveis críticos|###################|
|RF-005 |O sistema deve integrar-se com o sistema de PDV para registrar vendas|###################|
|RF-006 |O sistema deve integrar-se com o sistema de notas fiscais para emissão de NF-e|###################|
|RF-007 |O sistema deve atualizar o estoque automaticamente após cada venda|###################|
|RF-008 |O sistema deve gerar relatórios de estoque atual|###################|
|RF-009 |O sistema deve gerar relatórios de movimentação (entradas/saídas)|###################|
|RF-010 |O sistema deve gerar relatórios de vendas por categoria de valor|###################|
|RF-011 |O sistema deve gerar relatórios de vendas por Peça|###################|

## Requisitos Não Funcionais
A tabela a seguir contém a relação com os Requisitos Não Funcionais identificados, contendo identificador, nome, descrição e prioridade:

| IDENTIFICADOR | NOME | DESCRIÇÃO |
|:---|:---|:---|
RNF-001 |O sistema deve possuir interface intuitiva e responsiva|###################|
RNF-002 |O tempo de aprendizado do sistema pelo usuário não deve exceder 4 horas|###################|
RNF-003 |O sistema deve suportar até 30 usuários simultanêos|###################|
RNF-004 |O tempo de resposta para consultas simples nãão deve exceder 2 segundos.|###################|
RNF-005 |O tempo de resposta para relatórios complexos não deve exceder 10 segundos|###################|
RNF-006 |O sistema deve implementar controle de acesso baseado em perfis|###################|
RNF-007 |As senhas dos usuários devem ser armazenadas com criptografia|###################|
RNF-008 |O sistema deve estar disponível 99,5% do tempo em horário comercial|###################|
RNF-009 |O sistema deve realizar backup automático diário dos dados|###################|
RNF-010 |O sistema deve ter mecanismo de recuperação de falhas|###################|


# Prototipagem




# Diagrama de Casos de Uso

![Diagrama Casos de Uso]()

## Descrição / Especificação dos Casos de Uso

### UC-01 - Realizar Login

|UC-01 - Realizar Login|           
|:---|
|**Descrição/Objetivo:** Permitir que os usuários do sistema (alunos e professores) acessem o dashboard de métricas do GitLab por meio de autenticação|
|**Atores: Professor**|
|**Pré-condições:** O usuário deve estar cadastrado no sistema e o usuário deve possuir um navegador compatível e conexão com a internet.|
|**Pós-condições:** O usuário terá acesso ao dashboard e às funcionalidades conforme seu nível de permissão.|
|**FLUXO PRINCIPAL / BÁSICO:**|
|1. O usuário acessa a página de login do sistema. |
|2. O sistema exibe os campos para inserção de credenciais (e-mail e senha).|
|3. O usuário insere suas credenciais e confirma o login.|
|4. O sistema valida as credenciais e autentica o usuário.|
|5. O usuário é redirecionado para o dashboard correspondente ao seu perfil (aluno ou professor).|
|**FLUXOS ALTERNATIVOS / EXCESSÕES:** |
|**A1: Usuário insere credenciais inválidas** |
|1. O sistema informa que o e-mail ou senha estão incorretos
|2. O usuário pode tentar novamente ou utilizar a opção de recuperação de senha.|
|**A2:  Usuário esqueceu a senha** |
|1. O usuário seleciona a opção "Esqueci minha senha".|
|2. O sistema solicita o e-mail cadastrado.|
|3. O usuário insere o e-mail e confirma.|
|4. O sistema envia um link de recuperação de senha para o e-mail informado.|
|5. O usuário redefine a senha e tenta realizar login novamente.|

### UC-02 - Visualizar Elementos do Sistema

|UC-02 - Visualizar Elementos do Sistema|           
|:---|
|**Descrição/Objetivo:** Permitir que os usuários do sistema visualizem os elementos e métricas exibidas no dashboard, como commits, tarefas em andamento, issues, participantes ativos, histórico de alterações e gráficos estatísticos.|
|**Atores: Professor**|
|**Pré-condições:** O usuário deve estar autenticado no sistema e o sistema deve estar conectado à internet para carregar as métricas em tempo real.|
|**Pós-condições:** O usuário pode visualizar e interpretar as métricas apresentadas no dashboard e o sistema exibe as informações atualizadas e organizadas de maneira intuitiva.|
|**FLUXO PRINCIPAL / BÁSICO:**|
|1. O usuário acessa o sistema e entra no dashboard. |
|2. O sistema carrega e exibe os elementos disponíveis, como:
 - Total de commits e commits por projetos.
 - Tarefas em andamento e tarefas em atraso.
 - Participantes mais ativos e com poucas atividades.
 - Relatórios de issues e histórico de alterações.
 - Merge requests e últimos commits.
 - Projetos mais atualizados e milestones.|
|3. O usuário pode rolar a tela para visualizar mais informações e métricas.|
|4. O usuário pode clicar em "Ver tudo" para expandir determinadas seções.|
|**FLUXOS ALTERNATIVOS / EXCESSÕES:** |
|**A1: Falha na conexão com a internet** |
|1. O sistema exibe uma mensagem informando que os dados não puderam ser carregados.|
|2. O usuário pode tentar recarregar a página quando a conexão for restabelecida.|
|**A2:  Falha no carregamento de dados do GitLab** |
|1. O sistema informa que há um erro na sincronização com o GitLab.|
|2. O usuário pode tentar novamente mais tarde ou contatar o suporte técnico.|

### UC-03 - Gerenciar Projetos

|UC-03 - Gerenciar Projetos|           
|:---|
|**Descrição/Objetivo:** Permitir que o gestor do projeto (professor) gerencie os projetos no sistema, podendo visualizar, editar e acompanhar o progresso das atividades, além de gerenciar participantes, commits, issues e milestones.|
|**Atores: Professor**|
|**Pré-condições:** O usuário deve estar autenticado no sistema e o usuário deve ter permissão de administrador para gerenciar projetos.|
|**Pós-condições:** As informações do projeto são atualizadas conforme as ações do gestor.|
|**FLUXO PRINCIPAL / BÁSICO:**|
|1. O gestor acessa o sistema e entra na seção "Projetos".|
|2. O sistema exibe a lista de projetos disponíveis.|
|3. O gestor seleciona um projeto para visualizar os detalhes.|
|4. O sistema exibe as informações do projeto, incluindo: Commits, issues, merge requests e tarefas em andamento, participantes ativos e inativos e milestones e progresso do projeto.|
|**FLUXOS ALTERNATIVOS / EXCESSÕES:** |
|**A1: Falha na conexão com a internet** |
|1. O sistema exibe uma mensagem informando que os dados não puderam ser carregados.|
|2. O usuário pode tentar recarregar a página quando a conexão for restabelecida.|
|**A2:  Falha no carregamento de dados do GitLab** |
|1. O sistema informa que há um erro na sincronização com o GitLab.|
|2. O usuário pode tentar novamente mais tarde ou contatar o suporte técnico.|

### UC-04 - Coletar Dados via API

|UC-04 - Coletar Dados via API|           
|:---|
|**Descrição/Objetivo:** Permitir que o sistema colete dados automaticamente do GitLab por meio da API, obtendo informações relevantes sobre os projetos, como commits, issues, merge requests, milestones e estatísticas de código.|
|**Atores: Sistema**|
|**Pré-condições:** O sistema deve estar devidamente configurado com credenciais de acesso à API do GitLab e o GitLab deve estar operacional e acessível pela API.|
|**Pós-condições:** Os dados coletados são armazenados no banco de dados ou em arquivos estruturados e o dashboard é atualizado com as informações mais recentes.|
|**FLUXO PRINCIPAL / BÁSICO:**|
|1. O sistema inicia a rotina de coleta de dados.|
|2. O sistema solicita e recebe os seguintes dados: Commits por usuário, Merge requests e suas aprovações, Issues abertas, fechadas e em andamento, Milestones e progresso dos projetos, Comentários e discussões, Estatísticas de código (linhas adicionadas/removidas, churn de código, etc.).|
|3. O sistema processa e estrutura os dados coletados.|
|4. Os dados são armazenados no banco de dados ou em arquivos estruturados.|
|5. O dashboard é atualizado com as informações coletadas.|
|**FLUXOS ALTERNATIVOS / EXCESSÕES:** |
|**A1: Falha na conexão com a internet** |
|1. O sistema exibe uma mensagem informando que os dados não puderam ser carregados.|
|2. O usuário pode tentar recarregar a página quando a conexão for restabelecida.|
|**A2:  Falha no carregamento de dados do GitLab** |
|1. O sistema informa que há um erro na sincronização com o GitLab.|
|2. O usuário pode tentar novamente mais tarde ou contatar o suporte técnico.|
|**A3:  Resposta incompleta da API** |
|1. O sistema recebe uma resposta parcial ou inconsistente da API.|
|2. O sistema tenta uma nova requisição.|
|3. Se a falha persistir, o sistema exibe um aviso.|

### UC-05 - Analisar Comentários e Discussões

|UC-05 - Analisar Comentários e Discussões|           
|:---|
|**Descrição/Objetivo:** Permitir que o sistema colete, analise e exiba os comentários e discussões realizadas nos projetos do GitLab, auxiliando os gestores e participantes a monitorar interações, avaliar feedbacks e acompanhar a comunicação da equipe.|
|**Atores: Gestor**|
|**Pré-condições:** O sistema deve estar devidamente configurado com credenciais de acesso à API do GitLab.|
|**Pós-condições:** Os gestores podem visualizar insights sobre a participação dos usuários nas discussões.|
|**FLUXO PRINCIPAL / BÁSICO:**|
|1. O sistema inicia a coleta de dados da API do GitLab.|
|2. O sistema solicita e recebe os comentários e discussões associadas aos commits, merge requests e issues.|
|3. O gestor pode filtrar e visualizar detalhes dos comentários conforme o projeto ou participante.|
|**FLUXOS ALTERNATIVOS / EXCESSÕES:** |
|**A1: Falha na conexão com a internet** |
|1. O sistema exibe uma mensagem informando que os dados não puderam ser carregados.|
|2. O usuário pode tentar recarregar a página quando a conexão for restabelecida.|
|**A2:  Falha no carregamento de dados do GitLab** |
|1. O sistema informa que há um erro na sincronização com o GitLab.|
|2. O usuário pode tentar novamente mais tarde ou contatar o suporte técnico.|

### UC-06 - Gerenciar Informações Pessoais

|UC-06 - Gerenciar Informações Pessoais|           
|:---|
|**Descrição/Objetivo:** Permitir que os usuários visualizem e gerenciem suas informações pessoais, garantindo que os dados estejam sempre corretos.|
|**Atores: Professor**|
|**Pré-condições:** O usuário deve estar autenticado no sistema.|
|**Pós-condições:** As informações pessoais e preferências do usuário são atualizadas no sistema.|
|**FLUXO PRINCIPAL / BÁSICO:**|
|1. O usuário acessa o sistema e entra na área de perfil.|
|2. O sistema exibe as informações pessoais atuais do usuário.|
|3. O usuário altera as informações desejadas, como:
 - Notificações.
 - Tema.
 - Foto de perfil.
 - Preferências de notificação.|
|**FLUXOS ALTERNATIVOS / EXCESSÕES:** |
|**A1: Falha na conexão com a internet** |
|1. O sistema exibe uma mensagem informando que os dados não puderam ser carregados.|
|2. O usuário pode tentar recarregar a página quando a conexão for restabelecida.|
|**A2:  Falha no carregamento de dados do GitLab** |
|1. O sistema informa que há um erro na sincronização com o GitLab.|
|2. O usuário pode tentar novamente mais tarde ou contatar o suporte técnico.|
|**A3:  Falha ao salvar as preferências** |
|1. O sistema tenta salvar as alterações, mas ocorre um erro interno e exibe uma mensagem de erro.|

# Diagrama de Classes

![Diagrama de Classes]()

# Diagrama de Sequências

![Diagrama de Sequencia Login]()

![Diagrama de Sequencia]()

# Diagrama de Atividades

![Diagrama de Atividades]()

# REFERÊNCIAS

Esta subseção apresenta as referências aos documentos que utilizamos no auxílio à construção deste documento.
* 
* 
