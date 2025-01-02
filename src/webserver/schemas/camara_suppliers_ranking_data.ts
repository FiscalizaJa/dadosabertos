const schema = {
    $id: "camara_suppliers_ranking_data",
    type: "object",
    patternProperties: {
        '^\\d{4}$': {
            type: "array",
            items: {
                type: "object",
                properties: {
                    year: {
                        type: "number",
                        description: "Ano de ocorrência das despesas dos deputados no ranking."
                    },
                    months: {
                        type: "array",
                        items: {
                            type: "number",
                            description: "Meses de ocorrência das despesas contabilizadas do deputado."
                        }
                    },
                    total: {
                        type: "number",
                        description: "Total gasto pelo deputado em contratações do fornecedor."
                    },
                    parlamentarian_name: {
                        type: "string",
                        description: "Nome do Deputado."
                    },
                    parlamentarian_id: {
                        type: "string",
                        description: "ID do Deputado."
                    }
                }
            }
        }
    }
}

export default schema