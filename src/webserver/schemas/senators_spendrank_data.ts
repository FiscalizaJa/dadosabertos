const schema = {
    $id: "senators_spendrank_data",
    type: "object",
    patternProperties: {
        '^\\d{4}$': {
            type: "array",
            maxItems: 30,
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
                    },
                    per_category: {
                        type: "array",
                        description: "Gastos por categoria",
                        items: {
                            type: "object",
                            properties: {
                                subquota: {
                                    type: "number",
                                    description: "Subcota para o tipo da despesa. Referência disponível em /senado/references/expense_type."
                                },
                                total: {
                                    type: "number",
                                    description: "Valor total gasto na categoria"
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

export default schema