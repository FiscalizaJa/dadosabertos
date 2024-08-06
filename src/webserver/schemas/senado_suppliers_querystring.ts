const schema = {
    $id: "senado_suppliers_querystring",
    type: "object",
    properties: {
        month: {
            type: "array",
            maxItems: 13,
            items: {
                type: "integer",
                minimum: 1,
                maximum: 12
            },
            description: "Mês(es) de ocorrência das despesas."
        }
    }
}

export default schema