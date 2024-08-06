const schema = {
    $id: "open_questions_querystring",
    type: "object",
    properties: {
        subject_id: {
            type: "array",
            maxItems: 150,
            description: "Lista de `subject_id` a serem obtidos.",
            items: {
                type: "string"
            }
        }
    },
    required: ["subject_id"]
}

export default schema