import swagger, { SwaggerOptions } from "@fastify/swagger";

export const options: SwaggerOptions = {
    openapi: {
        openapi: "3.0.0",
        info: {
            title: "Dados Abertos do FiscalizaJá",
            description: "Bem vindo à nova versão do serviço de dados do FiscalizaJá.\n\nTodos os dados são livres para qualquer pessoa ou entidade usar como bem entender.\n\nEstamos orgulhosos de entregar para a população um serviço de dados rápido, padronizado e estável 🙌",
            version: "1.0.0",
            summary: "Iniciativa de dados realmente abertos do FiscalizaJá."            
        },
        tags: [
            {
                name: "Câmara dos Deputados",
                description: "Endpoints relacionados à Câmara dos Deputados.\nApenas deputados em exercício são listados, por limitações financeiras."
            },
            {
                name: "Fornecedores da Câmara dos Deputados",
                description: "Endpoints relacionados à empresas/pessoas que forneceram algum serviço custeado pela cota parlamentar de um deputado federal."
            },
            {
                name: "Senado Federal",
                description: "Endpoints relacionados ao Senado Federal.\nApenas senadores em exercícios são listados, por limitações financeiras."
            },
            {
                name: "Fornecedores do Senado",
                description: "Endpoints relacionados à empresas/pessoas que forneceram algum serviço custeado pela cota parlamentar de um Senador."
            },
            {
                name: "Open Questions",
                description: "Open Questions é um serviço do FiscalizaJá destinado a permitir que cidadãos escrevam questionamentos específicos em despesas, deputados, senadores, etc e que essas apareçam em um lugar relevante e não caiam no esquecimento de um email escrito \"obrigado\"."
            },
            {
                name: "Full Query",
                description: "Full query é um serviço do FiscalizaJá que permite que usuários façam consultas personalizadas direto no banco de dados com as despesas salvas pelo FiscalizaJá. Com isso você pode obter informações normalmente achadas somente em matérias de jornais."
            },
            {
                name: "Referências",
                description: "Referências dos campos numéricos presente nos dados, detalhando o que cada número significa."
            }
        ]
    }
}

export default swagger