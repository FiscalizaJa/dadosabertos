const schema = {
    $id: "gpt_inference_body",
    additionalProperties: false,
    type: "object",
    properties: {
        content: {
            type: "string",
            description: "Resposta do FiscalizaBot."
        }
    },
    required: ["content"]
}

export default schema