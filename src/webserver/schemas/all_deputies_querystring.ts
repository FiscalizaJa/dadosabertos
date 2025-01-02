import { FastifySchema } from "fastify";

const schema = {
    $id: "all_deputies_querystring",
    type: "object",
    properties: {
        itens: {
            type: "number",
            minimum: 1,
            description: "Itens por página."
        },
        page: {
            type: "number",
            minimum: 1,
            description: "Página dos itens."
        },
        orderby: {
            type: "string",
            enum: ["id", "name", "full_name", "gender", "party", "cpf", "birth_date", "birth_uf"],
            default: "name",
            description: "Propriedade usada para ordenar os resultados."
        },
        order: {
            type: "string",
            enum: ["asc", "desc"],
            default: "asc",
            description: "Ordem dos resultados."
        },
        id: {
            type: "array",
            maxItems: 512,
            items: {
                type: "number",
                description: "IDs dos deputados a serem enviados (envia todos se omitido)."
            }
        },
        searchTerm: {
            type: "string",
            description: "Termo para pesquisar os parlamentares (somente por nome ou cpf).",
            maxLength: 100
        },
        birth_uf: {
            type: "string",
            description: "UF de nascimento dos Deputados Federais.",
            maxLength: 100
        },
        party: {
            type: "string",
            description: "Partido dos Deputados Federais.",
            maxLength: 100
        }
    },
}

export default schema