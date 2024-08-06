const schema = {
    $id: "full_query_job_series_data_partial",
    type: "object",
    description: "Dados úteis para criação de gráficos, precisam ser incluidos adicionalmente pela querystring \"include_series\"",
    properties: {
        yearly: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    year: {
                        type: "number",
                        description: "Ano dos gastos."
                    },
                    total: {
                        type: "number",
                        description: "Total gasto no ano."
                    },
                    average: {
                        type: "number",
                        description: "Média dos gastos no ano."
                    }
                }
            }
        }
    }
}

export default schema