const schema = {
    $id: "camara_suppliers_search_data",
    type: "array",
    items: {
        type: "object",
        properties: {
            identifier: {
                type: "string",
                description: "CNPJ ou CPF do fornecedor encontrado."
            },
            names: {
                type: "array",
                items: {
                    type: "string",
                    description: "Nomes encontrados para o CNPJ ou CPF do fornecedor."
                }
            }
        }
    }
}

export default schema