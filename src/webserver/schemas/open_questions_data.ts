const schema = {
    $id: "open_questions_data",
    type: "object",
    properties: {
        id: {
            type: "number",
            description: "ID da questão"
        },
        subject_id: {
            type: "string",
            description: "subject_id da questão. Basicamente o assunto."
        },
        content: {
            type: "string",
            description: "Conteúdo do questionamento."
        },
        user_id: {
            type: "string",
            description: "ID do usuário que fez o questionamento."
        },
        total_votes: {
            type: "number",
            description: "Número total de votos na questão. Valores negativos denunciam que o questionamento não é relevante."
        }
    }
}

export default schema