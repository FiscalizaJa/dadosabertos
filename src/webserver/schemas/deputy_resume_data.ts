const schema = {
    $id: "deputy_resume_data",
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
        }
    }
}

export default schema