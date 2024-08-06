const schema = {
    $id: "full_query_job_params",
    type: "object",
    properties: {
        job: {
            type: "string",
            description: "ID do resultado enviado pelo endpoint POST."
        }
    },
    required: ["job"]
}

export default schema