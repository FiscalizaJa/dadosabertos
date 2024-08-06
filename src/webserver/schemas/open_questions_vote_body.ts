const schema = {
    $id: "open_questions_vote_body",
    type: "object",
    additionalProperties: false,
    properties: {
        vote_type: {
            type: "number",
            description: "Tipo do voto.\n\n`0` = positivo, `1` = negativo.",
            enum: [0, 1]
        }
    },
    required: ["vote_type"]
}

export default schema