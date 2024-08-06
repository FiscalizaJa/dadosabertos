const schema = {
    $id: "authorization_headers",
    type: "object",
    properties: {
        authorization: {
            type: "string",
            description: "Token de acesso do FiscalizaJá, obtido através do login com Google.",
        }
    },
    required: ["authorization"]
}

export default schema