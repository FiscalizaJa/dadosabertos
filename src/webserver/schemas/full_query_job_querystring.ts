import FullQueryHandler from "../../services/full_query/queryHandler";

const schema = {
    $id: "full_query_job_querystring",
    type: "object",
    properties: {
        expenses_items: {
            type: "number",
            description: "Número de itens retornados por página nas despesas.",
            maximum: 1000,
            default: 150
        },
        expenses_page: {
            type: "number",
            description: "Página dos itens nas despesas.",
            minimum: 1,
            default: 1
        },
        suppliers_items: {
            type: "number",
            description: "Número de itens retornados por página nos fornecedores",
            maximum: 1000,
            default: 150
        },
        suppliers_page: {
            type: "number",
            description: "Página dos itens nos fornecedores.",
            minimum: 1,
            default: 1
        },
        include_series: {
            type: "array",
            description: "Dados de séries a ser incluídos, úteis para construção de gráficos.",
            items: {
                type: "string",
                enum: FullQueryHandler.CHART_LIST
            }
        }
    }
}

export default schema