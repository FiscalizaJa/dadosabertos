const schema = {
    $id: "full_query_job_data",
    type: "object",
    description: "Alguns valores estarão ausentes, devido ao fato das casas não servirem os mesmos dados.",
    properties: {
        camara: {
            $ref: "full_query_job_data_partial_camara"
        },
        senado: {
            $ref: "full_query_job_data_partial_senado"
        }
    }
}

export default schema