const schema = {
    $id: "gpt_inference_data",
    additionalProperties: true,
    type: "object",
    properties: {
        content: {
            type: "string",
            maxLength: 1300,
            description: "Conteúdo da sua mensagem para o FiscalizaBot."
        }
    },
    required: ["content"]
}

export default schema