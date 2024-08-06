# 🔎 FiscalizaJá: Uma forma diferente de fiscalizar.
Seja bem vindo ao **FiscalizaJá**, um projeto open source que nasceu da vontade de *escancarar* gastos de parlamentares brasileiros. Meu objetivo primário é permitir que todos tenham fácil acesso aos dados sobre gastos de parlamentares da Câmara Dos Deputados e Senado Federal.

Mas não é só isso, FiscalizaJá também permite fácil acesso a dados que poucos têm o conhecimento necessário para reunir e mostrar, o que o torna um grande aliado para jornalistas, entusiastas e blogueiros que estão produzindo conteúdos sobre gasto de dinheiro público de parlamentares. Tudo isso de forma gratuita e sem bloqueios.

## 📌 Principais recursos do FiscalizaJá
- Fácil acesso às despesas com a cota parlamentar de deputados federais e senadores em exercício.
    - Opções de filtro por ano/mês e nome/cnpj de fornecedor.
    - Link de acesso direto para o comprovante das despesas (apenas câmara dos deputados).
- Filtro avançado para despesas de deputados e senadores.
    - Este recurso realiza uma consulta em toda a base de dados do FiscalizaJá, retornando o total em R$ encontrado, valor médio, ranking de parlamentares que mais gastaram no total, fornecedores mais contratados e ranking de parlamentares que mais gastaram com cada fornecedor.
    - É um recurso poderoso pois dá acesso a informações que hoje existem somente em matérias de jornais e blogs duvidosos.
- Questionamentos abertos de pessoas em despesas dentro da plataforma, permitindo que dúvidas possam ser respondidas.

# 🔧 Stack
- Node.js
    - Backend:
        - Fastify
        - BullMQ
        - Postgres.js
        - Axios
    - Frontend:
        - Astro
        - React
        - Sass
    - Bancos de dados:
        - PostgreSQL
        - Redis