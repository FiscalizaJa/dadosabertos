const schema = {
    $id: "senado_suppliers_ranking_data",
    type: "object",
    patternProperties: {
        '^\\d{4}$': {
            type: "array",
            items: {
                type: "object",
                properties: {
                    year: {
                        type: "number",
                        description: "Ano de ocorrência das despesas dos Senadores no ranking."
                    },
                    months: {
                        type: "array",
                        items: {
                            type: "number",
                            description: "Meses de ocorrência das despesas contabilizadas do Senador."
                        }
                    },
                    total: {
                        type: "number",
                        description: "Total gasto pelo Senador em contratações do fornecedor."
                    },
                    senator_name: {
                        type: "string",
                        description: "Nome do Senador."
                    },
                    senator_id: {
                        type: "string",
                        description: "ID do Senador."
                    }
                }
            }
        }
    }
}

export default schema