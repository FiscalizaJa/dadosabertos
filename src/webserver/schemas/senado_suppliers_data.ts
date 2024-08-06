const schema = {
    $id: "senado_suppliers_data",
    type: "object",
    properties: {
        names: {
            type: "array",
            items: {
                type: "string",
            },
            description: "Nomes de fornecedores encontrados para o CNPJ ou CPF especificado."
        },
        data: {
            type: "array",
            description: "Dados dos gastos com o fornecedor, acompanha ano e meses contabilizados.",
            items: {
                type: "object",
                properties: {
                    year: {
                        type: "number",
                        pattern: "^\\d{4}$",
                        description: "Ano de ocorrência das despesas"
                    },
                    months: {
                        type: "array",
                        items: {
                            type: "number",
                            mininum: 1,
                            maximum: 12
                        },
                        description: "Meses de ocorrência das despesas"
                    },
                    total: {
                        type: "number",
                        description: "Total gasto com o fornecedor."
                    }
                }
            }
        }
    }
}

export default schema