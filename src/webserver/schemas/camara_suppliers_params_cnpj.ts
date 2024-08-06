const schema = {
    $id: "camara_suppliers_params_cnpj",
    type: "object",
    properties: {
        cnpj: {
            type: "string",
            maxLength: 150,
            description: "CNPJ ou CPF do fornecedor a ser consultado."
        }
    },
    required: ["cnpj"]
}

export default schema