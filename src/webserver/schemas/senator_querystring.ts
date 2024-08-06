const schema = {
    $id: "senator_querystring",
    type: "object",
    properties: {
        year: {
            type: "array",
            maxItems: 4,
            items: {
                type: "integer",
                minimum: 2009,
                maximum: new Date().getFullYear()
            },
            description: "Ano(s) de ocorrência das despesas"
        },
        month: {
            type: "array",
            maxItems: 12,
            items: {
                type: "integer",
                minimum: 1,
                maximum: 12
            },
            description: "Mês(es) de ocorrência das despesas"
        },
        supplier: {
            type: "string",
            maxLength: 100,
            description: "CPF, CNPJ ou nome completo do fornecedor de ocorrência das despesas"
        },
        itens: {
            type: "integer",
            minimum: 1,
            description: "Número de itens por página"
        },
        page: {
            type: "integer",
            minimum: 1,
            description: "Página dos resultados"
        }
    }
}

export default schema