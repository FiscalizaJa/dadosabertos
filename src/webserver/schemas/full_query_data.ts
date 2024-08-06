const schema = {
    $id: "full_query_data",
    type: "object",
    properties: {
        message: {
            type: "string",
        },
        job_id: {
            type: "string",
            description: "ID do resultado, para saber quando está disponível, conecte no endpoint websocket utilizando este ID."
        }
    }
}

export default schema