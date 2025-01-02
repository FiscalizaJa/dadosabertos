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
        },
        id: {
            type: "array",
            maxItems: 230,
            items: {
                type: "number",
                description: "IDs dos senadores a serem enviados (envia todos se omitido)."
            }
        },
        searchTerm: {
            type: "string",
            description: "Termo para pesquisar os parlamentares (somente por nome).",
            maxLength: 100
        },
        birth_uf: {
            type: "string",
            description: "UF de nascimento dos Senadores.",
            maxLength: 100
        },
        party: {
            type: "string",
            description: "Partido dos Senadores.",
            maxLength: 100
        }
    }
}

export default schema