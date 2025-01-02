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
        bio: {
            type: "string",
            description: "Biografia do Deputado. (gerado por IA)"
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
        links: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    url: {
                        type: "string",
                        description: "URL do link associado.",
                    },
                    type: {
                        type: "string",
                        description: "Tipo do link associado.",
                    }
                }
            }
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
                        type: "string",
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