const schema = {
    $id: "senator_resume_data",
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
        }
    }
}

export default schema