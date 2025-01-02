const schema = {
    $id: "auth_user_clipped_data",
    type: "object",
    properties: {
        id: {
            type: "number",
            description: "ID do usuário."
        },
        email: {
            type: "string",
            description: "Email do usuário."
        },
        name: {
            type: "string",
            description: "Nome do usuário."
        }
    }
}

export default schema