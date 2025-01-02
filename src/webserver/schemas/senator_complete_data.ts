const schema = {
    $id: "senator_complete_data",
    type: "object",
    properties: {
        id: {
            type: "number",
            description: "ID do Senador."
        },
        name: {
            type: "string",
            description: "Nome eleitoral do Senador."
        },
        full_name: {
            type: "string",
            description: "Nome completo do Senador."
        },
        bio: {
            type: "string",
            description: "Biografia do Deputado. (gerado por IA)"
        },
        gender: {
            type: "string",
            description: "Sexo do Senador(a)."
        },
        party: {
            type: "string",
            description: "Partido político do Senador."
        },
        cpf: {
            type: "string",
            description: "CPF do Senador (sim, é um dado público)."
        },
        birth_date: {
            type: "string",
            description: "Data de nascimento do Senador."
        },
        birth_uf: {
            type: "string",
            description: "UF de nascimento do Senador."
        },
        holder_id: {
            type: "number",
            description: "ID do Senador titular, caso este seja suplente."
        },
        alternate_type: {
            type: "number",
            description: "Nível de suplência do Senador, caso seja suplente."
        },
        acting: {
            type: "boolean",
            description: "Indica se o Senador está em exercício."
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
            description: "",
            items: {
                type: "object",
                properties: {
                    phone: {
                        type: "string",
                        description: "Número de telefone do gabinete do Senador"
                    },
                    address: {
                        type: "string",
                        description: "Endereço do gabinete do Senador"
                    },
                    email: {
                        type: "string",
                        description: "Endereço de e-mail do gabinete do Senador."
                    }
                }
            }
        }
    }
}

export default schema