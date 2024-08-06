const schema = {
    $id: "all_senators_querystring",
    type: "object",
    properties: {
        itens: {
            type: "number",
            minimum: 1,
            description: "Número de itens por página"
        },
        page: {
            type: "number",
            minimum: 1,
            description: "Página dos resultados"
        },
        orderby: {
            type: "string",
            enum: ["id", "name", "full_name", "gender", "party", "birth_date", "birth_uf", "alternate_type"],
            default: "name",
            description: "Propriedade usada para ordernar os itens"
        },
        order: {
            type: "string",
            enum: ["asc", "desc"],
            default: "asc",
            description: "Ordem dos itens."
        }
    }
}

export default schema