const schema = {
    $id: "camara_suppliers_ranking_querystring",
    type: "object",
    properties: {
        year: {
            type: "array",
            maxItems: 13,
            items: {
                type: "integer",
                minimum: 2009,
                maximum: new Date().getFullYear()
            },
            description: "Ano(s) selecionados para fazer o ranking. Note é um por ano."
        },
        month: {
            type: "array",
            maxItems: 13,
            items: {
                type: "integer",
                minimum: 1,
                maximum: 12
            },
            description: "Mês(es) de ocorrência das despesas contabilizadas na construção do ranking."
        }
    }
}

export default schema