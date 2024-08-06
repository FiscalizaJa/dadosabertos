const schema = {
    $id: "senator_expenses_resume_querystring",
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
        }
    }
}

export default schema