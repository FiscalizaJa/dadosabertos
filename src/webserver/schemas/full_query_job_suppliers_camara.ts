const schema = {
    $id: "full_query_job_suppliers_camara",
    type: "array",
    items: {
        type: "object",
        properties: {
            name: {
                type: "string",
                description: "Nome do fornecedor."
            },
            identifier: {
                type: "string",
                description: "CNPJ ou CPF do fornecedor."
            },
            purchases: {
                type: "number",
                description: "Número de contratações do fornecedor."
            },
            total: {
                type: "number",
                description: "Total gasto com o fornecedor."
            },
            year: {
                type: "number",
                description: "Ano das despesas com o fornecedor"
            },
            months: {
                type: "array",
                items: {
                    type: "number"
                },
                description: "Meses encontrados para as despesas com o fornecedor."
            },
            spending: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        deputy_id: {
                            type: "number",
                            description: "ID do deputado."
                        },
                        deputy_name: {
                            type: "string",
                            description: "Nome do deputado."
                        },
                        spent: {
                            type: "number",
                            description: "Total gasto por ele com o fornecedor."
                        }
                    }
                }
            }
        }
    }
}

export default schema