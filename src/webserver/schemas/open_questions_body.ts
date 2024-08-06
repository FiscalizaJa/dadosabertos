const schema = {
    $id: "open_questions_body",
    additionalProperties: false,
    type: "object",
    properties: {
        subject_id: {
            type: "string",
            description: "`subject_id` ao qual será feito o questionamento."
        },
        content: {
            type: "string",
            description: "Conteúdo do questionamento."
        }
    },
    required: ["subject_id", "content"]
}

export default schema