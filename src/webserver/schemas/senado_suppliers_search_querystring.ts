const schema = {
    $id: "senado_suppliers_search_querystring",
    type: "object",
    properties: {
        query: {
            type: "string",
            maxLength: 150,
            description: "Nome a ser pesquisado."
        }
    },
    required: ["query"]
}

export default schema