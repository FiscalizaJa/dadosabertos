const schema = {
    $id: "deputy_expenses_data",
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
                    wallet: {
                        type: "string",
                        description: "Número da carteira do parlamentar."
                    },
                    subquota: {
                        type: "number",
                        description: "Número da subcota da despesa."
                    },
                    number_specification_subquota: {
                        type: "number",
                        description: "Número de especificação da subcota da despesa."
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
                    number: {
                        type: "string",
                        description: "Número do documento."
                    },
                    type_document: {
                        type: "string",
                        description: "Tipo do documento."
                    },
                    emission_date: {
                        type: "string",
                        description: "Data de emissão do documento."
                    },
                    value_document: {
                        type: "string",
                        description: "Valor do documento."
                    },
                    value_gloss: {
                        type: "string",
                        description: "Valor da glosa."
                    },
                    liquid_value: {
                        type: "string",
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
                    parcel: {
                        type: "number",
                        description: "Valor pago na parcela, se o pagamento for parcelado."
                    },
                    passenger: {
                        type: "string",
                        description: "Nome dos passageiros abordo (aplica somente se for passagem aérea)."
                    },
                    section: {
                        type: "string",
                        description: "Trechos que constam no bilhete aéreo (aplica somente se for passagem aérea)"
                    },
                    lot: {
                        type: "string",
                        description: "Lote da despesa."
                    },
                    reimbursement: {
                        type: "number",
                        description: "Valor do reembolso, se o valor foi devolvido para a câmara."
                    },
                    payment_date_refund: {
                        type: "number"
                    },
                    refund: {
                        type: "number"
                    },
                    document_id: {
                        type: "string",
                        description: "ID do documento."
                    },
                    url_document: {
                        type: "string",
                        description: "URL do documento."
                    },
                    insert_date: {
                        type: "string",
                        description: "Data em que a despesa foi inserida no banco de dados do FiscalizaJá"
                    },
                    deputy_id: {
                        type: "number",
                        description: "ID do deputado autor da despesa."
                    }
                }
            }
        }
    }
}

export default schema