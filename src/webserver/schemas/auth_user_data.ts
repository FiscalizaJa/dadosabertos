const schema = {
    $id: "auth_user_data",
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
        },
        password: {
            type: "string",
            description: "Hash da senha do usuário"
        }
    }
}

export default schema