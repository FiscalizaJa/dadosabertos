# 🔎 FiscalizaJá: Uma forma diferente de fiscalizar.
Seja bem vindo aos dados abertos do FiscalizaJá. Uma iniciativa de código aberto que visa facilitar que a população audite os gastos públicos de parlamentares do Brasil com suas cotas.

Eu, Victor Reis David, desenvolvedor do FiscalizaJá, acredito que as plataformas atuais (principalmente oficiais) não tiram todo o potencial dos dados, o que quer dizer que, preferem maneiras muito textuais e pouco visuais para representar os dados, o que agrega pouco para que pessoas não-técnicas possam auditar com facilidade. É para isso que criei o FiscalizaJá, para que **você** possa saber como os seus deputados e senadores (e futuramente o gov.br!) estão usando o dinheiro de impostos de quem trabalha e produz para a sociedade desse país.

Eu, particularmente, não concordo com a alta carga tributária que temos, então, considere isso também como protesto. Se eles podem aumentar impostos sem nos consultar, então podemos fortalecer a fiscalização em cima deles sem nenhum tipo de satisfação, é nosso direito e devemos fazer valer. Esse projeto é de código aberto para que não abra margem para dúvidas sobre a veracidade dos dados. Qualquer pessoa pode analisar e inclusive, contribuir com o desenvolvimento do projeto.

## 📌 Principais recursos do FiscalizaJá
- Visualização dos gastos dos parlamentares em uma UI simples, intuitiva e fluída, mostrando gastos parecido com um extrato bancário, pensada em ser compreensível para pessoas não-técnicas.
- Diversos gráficos para compreensão visual dos dados, ao invés de abordagens mais textuais como plataformas oficiais.
- "FiscalizaJá Full Query": Recurso que permite aos usuários criarem suas próprias consultas no banco de dados de despesas do fiscalizajá, permitindo que entusiastas e jornalistas façam investigações mais profundas.
- *(para o futuro)*: Permitir que usuários recebam emails diariamente com o gasto no dia anterior de parlamentares escolhidos.

*(notas dispensáveis mas não insignificantes)*
- O design da visualização da lista de despesas do parlamentar foi inspirado no layout do extrato bancário do **PicPay**, simples, direto e fácil de entender.
- A homepage do frontend tem uma leve inspiração no layout do **Radar do Congresso, da UOL**.


# 🔧 Stack
- Node.js
    - Backend:
        - Fastify
        - BullMQ
        - Postgres.js
    - Frontend:
        - Astro
        - React
        - Sass
    - Bancos de dados:
        - PostgreSQL
        - Redis
        - Meilisearch (motor de pesquisa)