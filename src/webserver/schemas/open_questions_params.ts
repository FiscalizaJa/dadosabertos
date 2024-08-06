const schema = {
    $id: "open_questions_params",
    type: "object",
    properties: {
        id: {
            type: "number",
            description: "ID da questão"
        }
    },
    required: ["id"]
}

export default schema