const schema = {
    $id: "full_query_querystring",
    type: "object",
    properties: {
        target: {
            type: "string",
            enum: ["camara", "senado"]
        }
    },
    required: ["target"]
}

export default schema