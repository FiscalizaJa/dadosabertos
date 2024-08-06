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
        }
    },
}

export default schema