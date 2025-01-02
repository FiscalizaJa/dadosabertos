const schema = {
    $id: "all_parlamentarians_metadata",
    type: "object",
    properties: {
        items: {
            type: "number",
            description: "Número de registros encontrados, independente da paginação."
        }
    }
}

export default schema