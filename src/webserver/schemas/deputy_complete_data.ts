const schema = {
    $id: "deputy_complete_data",
    type: "object",
    properties: {
        id: {
            type: "number",
            description: "ID do Deputado."
        },
        name: {
            type: "string",
            description: "Nome eleitoral do Deputado."
        },
        full_name: {
            type: "string",
            description: "Nome completo do Deputado."
        },
        gender: {
            type: "string",
            description: "Sexo do Deputado(a)."
        },
        party: {
            type: "string",
            description: "Partido político do Deputado."
        },
        cpf: {
            type: "string",
            description: "CPF do Deputado (sim, é um dado público)."
        },
        birth_date: {
            type: "string",
            description: "Data de nascimento do Deputado."
        },
        birth_uf: {
            type: "string",
            description: "UF de nascimento do Deputado."
        },
        office: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "number",
                        description: "Número do gabinete."
                    },
                    building: {
                        type: "number",
                        description: "Número do prédio onde se localiza o gabinete."
                    },
                    room: {
                        type: "number",
                        description: "Sala do prédio em que se encontra o gabinete."
                    },
                    floor: {
                        type: "number",
                        description: "Andara do prédio em que se encontra o gabinete."
                    },
                    phone: {
                        type: "string",
                        description: "Número de telefone do gabinete."
                    },
                    email: {
                        type: "string",
                        description: "Email de contato do gabinete."
                    }
                }
            }
        }
    }
}

export default schema