const schema = {
    $id: "full_query_job_insights",
    type: "object",
    properties: {
        total: {
            type: "number",
            description: "Total em R$ gasto."
        },
        average: {
            type: "number",
            description: "Gasto médio em R$."
        },
        count: {
            type: "number",
            description: "Número total de despesas encontradas"
        },
        standard_deviation: {
            type: "number",
            description: "Desvio padrão no valor das despesas."
        }
    }
}

export default schema