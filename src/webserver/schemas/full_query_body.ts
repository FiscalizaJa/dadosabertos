const schema = {
    $id: "full_query_body",
    type: "array",
    items: {
        type: "object",
        additionalProperties: false,
        description: "Após um filtro \"MINOR\", \"MORE\" ou \"EQUAL\", o próximo obrigatoriamente tem que ser \"AND\" ou \"OR\".",
        properties: {
            operator: {
                type: "string",
                enum: ["MINOR", "MORE", "EQUAL", "AND", "OR"],
                description: "Operador utilizado no filtro."
            },
            property: {
                type: "string",
                description: "Propriedade utilizada no filtro."
            },
            value: {
                type: "string",
                description: "Valor utilizado no filtro."
            }
        }
    }
}

export default schema