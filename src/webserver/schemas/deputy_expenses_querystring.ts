const schema = {
    $id: "deputy_expenses_querystring",
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
            description: "Ano(s) de ocorrência das despesas."
        },
        month: {
            type: "array",
            maxItems: 12,
            items: {
                type: "integer",
                minimum: 1,
                maximum: 12
            },
            description: "Mês(es) de ocorrência das despesas."
        },
        supplier: {
            type: "string",
            maxLength: 100,
            description: "Fornecedor (nome ou cnpj) contratado nas despesas."
        },
        itens: {
            type: "integer",
            minimum: 1,
            description: "Itens por página."
        },
        page: {
            type: "integer",
            minimum: 1,
            description: "Página dos itens."
        }
    }
}

export default schema