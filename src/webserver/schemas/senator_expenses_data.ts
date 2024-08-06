const schema = {
    $id: "senator_expenses_data",
    type: "object",
    properties: {
        suppliers: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Nome do fornecedor."
                    },
                    purchases: {
                        type: "number",
                        description: "Número de contratações do fornecedor."
                    },
                    total: {
                        type: "number",
                        description: "Total gasto com o fornecedor."
                    },
                    identifier: {
                        type: "string",
                        description: "CNPJ ou CPF do fornecedor."
                    }
                }
            }
        },
        expenses: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: {
                        type: "number",
                        description: "ID da despesa"
                    },
                    name_parlamentarian: {
                        type: "string",
                        description: "Nome do parlamentar."
                    },
                    subquota: {
                        type: "number",
                        description: "Número da subcota da despesa."
                    },
                    detail_specification: {
                        type: "string",
                        description: "Detalhes adicionais da despesa."
                    },
                    supplier: {
                        type: "string",
                        description: "Nome do fornecedor do serviço contratado."
                    },
                    identifier: {
                        type: "string",
                        description: "CNPJ ou CPF do fornecedor do serviço contratado."
                    },
                    type_document: {
                        type: "string",
                        description: "Tipo do documento."
                    },
                    emission_date: {
                        type: "string",
                        description: "Data de emissão do documento."
                    },
                    liquid_value: {
                        type: "number",
                        description: "Valor líquido."
                    },
                    month: {
                        type: "number",
                        description: "Mês de ocorrência da despesa."
                    },
                    year: {
                        type: "number",
                        description: "Ano de ocorrência da despesa."
                    },
                    document_id: {
                        type: "string",
                        description: "ID do documento."
                    },
                    insert_date: {
                        type: "string",
                        description: "Data em que a despesa foi inserida no banco de dados do FiscalizaJá"
                    },
                    senator_id: {
                        type: "number",
                        description: "ID do Senador autor da despesa."
                    }
                }
            }
        }
    }
}

export default schema