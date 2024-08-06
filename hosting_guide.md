# 🚀 Selfhosting do FiscalizaJá
Este guia serve como documentação para quem quiser fazer selfhost da plataforma. Bem como entender alguns detalhes técnicos.

## 📱 Requisitos mínimos
Antes de tudo, existem alguns requisitos mínimos que você precisa para rodar tudo sem problemas:
- Pelo menos 2 núcleos na CPU (intenso uso de concorrência)
- 1,5GB de memória ram
- 50GB de espaço em disco
- PostgreSQL >= 15.3
- Redis
- NodeJS >= V20.11
- NGINX (opcional)

O projeto foi testado nas versões especificadas nos requisitos, por isso não posso garantir que tudo vá funcionar bem se as dependências estiverem em versões diferentes.

O uso de memória pelo webserver é muito baixo, no entanto, para realizar atualizações dos dados é necessário uma quantidade significativa de memória, se você está em um ambiente com pouca ram, é altamente recomendável que modifique o `loader.config.json` nos módulos de `dadosabertos`, para carregar uma porção menor de dados na memória.

## 📦 Separação de diretórios
Dentro de `src`, você vai notar que existem dois diretórios principais: `webserver` e `dadosabertos`.
- `webserver`: Módulo responsável pela API rest que servirá os dados. Ele NUNCA importa diretamente a conexão com o banco de dados. Muito pelo contrário, ele usa apenas as funções do `QueryHandler`.
- `dadosabertos`: Pasta onde ficarão os módulos responsáveis por gerenciar os dados extraídos das plataformas. Perceba que todos têm os mesmos nomes de arquivos (salva-se algumas exceções).
    - `database.ts`: Exporta a conexão com o banco de dados e a função para prepará-lo criando as tabelas e índices necessários.
    - `downloader.ts`: Exporta a classe responsável por fazer o download dos dados.
    - `expense_type_reference.json`: Contém a referência para os tipos de despesa dos parlamentares.
        - A estrutura do arquivo é otimizada para acesso rápido internamente durante a execução.
        - Devido a diferenças entre as plataformas, não segue o mesmo padrão para todos.
            - `expense_type_reference.json` de `camara`:
            ```json
                {
                    "<subcota>:<especificação_subcota>": {
                        "type": "Tipo da despesa"
                    }
                }
            ```
            Perceba que não é colocado `subcota` e `especificação_subcota` dentro do objeto para definir a despesa, eles ficam direto na chave. Isso otimiza o acesso a informação uma vez que obter diretamente a chave de um objeto é muito mais eficiente do que qualquer tipo de pesquisa dentro de uma array. No entanto, no endpoint de referências eles são convertidos para um formato que facilita o entendimento dos dados:
            ```json
                [
                    {
                        "subquote": 1,
                        "number_specification_subquote": 0,
                        "type": "Manutenção de escritório parlamentar"
                    }
                ]
            ```
    - `loader.config.json`: Configurações para o `loader.ts` que carrega os dados, ajuste esse conforme necessário para o seu hardware. Os valores padrões foram testados no meu notebook com 12GB de ram e carregam uma alta quantidade de dados na memória. Se você tem pouca ram, considere diminuir os números.
    - `loader.ts`: Exporta as funções responsáveis por carregar os dados. Lembre-se de não rodar essas funções mais de 1 vez simultaneamente, pois não há mecanismos de controle de concorrência, exceto os do PostgreSQL.
    - `queryHandler.ts`: Exporta a classe responsável por fazer as queries no banco de dados. É a classe que o resto da aplicação usará para interagir com os dados. Nada de queries escritas diretamente no banco de dados por outras partes da aplicação.

## 💣 Testes
O fiscalizajá utiliza o [Poku](https://poku.io/pt-BR/) para os testes, para iniciar a bancada de testes, simplesmente use `npx poku`.

A parte dos testes ainda está numa fase extremamente inicial (pois não sou um QA), se você tiver ideias de como melhorar, fique a vontade para abrir um PR com as suas sugestões e alterações!

## 🙋‍♂️ Fisca-cli
Antes disso, dê uma olhada no `.env.example` e crie as variáveis de ambiente necessárias (ou um arquivo `.env`).

Você deve ter notado que o projeto possui uma CLI própria muito simples para algumas tarefas.
Com ela, você deve:
- Preparar os bancos de dados (basta selecionar as opções, não tem erro).
- Salvar os dados pela primeira vez nos seus respectivos banco de dados (você pode optar por esperar o cronjob fazer isso, todo dia às 6 da manhã xD)

## 🦅 Rodando o webserver
Depois que você preparou todos os bancos de dados e salvou os dados, para começar servindo tudo, você deve rodar o webserver.
Assumindo que você já usou `npm install` para instalar os módulos necessários, é muito simples:
- Compile o código com `npx tsc`
- Vá para a pasta `dist`
- Rode o comando: `node src/webserver/app`
- Agora você tem o webserver rodando

### 👐 NGINX recomendado
A API foi feita com o pensamento de que haverá um proxy reverso lidando com tudo (nunca é recomendado expor um webserver Nodejs direto para a web), por isso recomendo que você a deixe atrás de um NGINX, Apache ou outro da sua preferência para poder aplicar técnicas de ratelimiting, caching e outras coisas para melhorar a performance e segurança.

## 💣 NÃO RECOMENDADO
- PostgreSQL serverless (falta de liberdade para configurar o banco de dados, performance degradável)
- Rodar a API em plataformas serverless (Vercel, Bohr, etc)
    - Embora seja totalmente possível e provavelmente funcione, a estrutura como um todo não foi preparada para rodar num ambiente serverless onde muitas coisas podem vir a explodir (como as apis padrões do Nodejs), por isso não recomendo.
- Instância PostgreSQL com recursos compartilhados (💀)
    - O motivo de eu não recomendar de forma alguma esse tipo de hospedagem para o banco de dados, é que em alguns momentos ele é puxado ao limite (na atualização dos dados por exemplo), o que demoraria muito tempo nos recursos limitados de uma hospedagem compartilhada e ainda afetaria as outras pessoas.
- Menos de 1,5GB de ram disponível para a aplicação
    - Embora o webserver em si seja extremamente leve, a atualização dos dados requer muito da memória, pois lê diversos arquivos jsons gigantes, faz muitas conversões e ainda precisa criar transações concorrentes no banco de dados.

## 🔎 RECOMENDO
- Rodar o banco de dados e a API juntos em um servidor VPS.
    - Se possível, não expor o banco de dados para a internet, a não ser que você queira conectar de fora com ferramentas como o PgAdmin.
- Utilizar o PM2 para gerenciar o processo do webserver.
- NGINX

Hospedar o FiscalizaJá é uma tarefa simples e o projeto consome poucos recursos. A única coisa que pesa aqui é o banco de dados.