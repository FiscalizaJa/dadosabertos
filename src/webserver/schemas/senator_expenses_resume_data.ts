const schema = {
    $id: "senator_expenses_resume_data",
    type: "object",
    properties: {
        categories: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    total: {
                        type: "number",
                        description: "Total gasto na categoria"
                    },
                    subquota: {
                        type: "number",
                        description: "Subquota da categoria."
                    }
                }
            }
        },
        monthly: {
            type: "object",
            patternProperties: {
                '^\\d{4}$': {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            month: {
                                type: "number",
                                minimum: 1,
                                maximum: 12,
                                description: "Mês de ocorrência das despesas."
                            },
                            total: {
                                type: "number",
                                description: "Total gasto no mês"
                            }
                        }
                    }
                }
            }
        }
    }
}

export default schema