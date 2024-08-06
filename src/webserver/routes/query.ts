import { RouteOptions } from "fastify";
import QueryController from "../controllers/QueryController";

const routes: RouteOptions[] = [
    {
        method: "POST",
        url: "/query/expenses",
        handler: QueryController.CreateQueryExpenses,
        config: {
            useGuard: true
        },
        schema: {
            summary: "Criar uma consulta",
            description: "Cria uma consulta completa no banco de dados do FiscalizaJá e retorna o ID do resultado. Os dados não ficam disponíveis imediatamente, invés disso, a operação é enviada para uma fila, criada para ter controle sobre o fluxo de solicitações enviadas para o banco de dados, assim, podemos servir muitas consultas sem risco de sobrecarga. Para saber quando o resultado está disponível, usa-se o ID para conectar no endpoint websocket, que enviará uma mensagem avisando que o processamento foi concluído.",
            tags: ["Full Query"],
            body: {
                $ref: "full_query_body"
            },
            headers: {
                $ref: "authorization_headers"
            },
            querystring: {
                $ref: "full_query_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            schema: {
                                $ref: "full_query_data"
                            }
                        }
                    },  
                },
                429: {
                    type: "object",
                    content: {
                        "application/json": {
                            description: "Retornado apenas quando o usuário tenta realizar mais de uma consulta por vez.",
                            schema: {
                                error: {
                                    type: "string"
                                },
                                code: {
                                    type: "string"
                                }
                            }
                        }
                    }
                },
                400: {
                    type: "object",
                    content: {
                        "application/json": {
                            schema: {
                                error: {
                                    type: "string"
                                },
                                code: {
                                    type: "string"
                                },
                                message: {
                                    type: "string"
                                }
                            }
                        }
                    }
                }
            },
        }
    },
    {
        method: "GET",
        url: "/query/expenses/:job",
        handler: QueryController.GetQueryExpenses,
        wsHandler: QueryController.ListenJobCompletions,
        schema: {
            summary: "Obter resultados de uma consulta",
            description: "Obtém resultados de uma consulta no banco de dados do FiscalizaJá. Estes ficam disponíveis por tempo limitado no banco de dados, para economizar memória em nosso servidor.",
            tags: ["Full Query"],
            params: {
                $ref: "full_query_job_params"
            },
            querystring: {
                $ref: "full_query_job_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            schema: {
                                data: {
                                    $ref: "full_query_job_data"
                                }
                            }
                        }
                    },  
                },
                400: {
                    type: "object",
                    content: {
                        "application/json": {
                            schema: {
                                error: {
                                    type: "string"
                                },
                                code: {
                                    type: "string"
                                }
                            }
                        }
                    }
                }
            }
        }
    },
    {
        method: "GET",
        url: "/query/expenses/:job/view",
        handler: QueryController.ViewJob,
        config: {
            useGuard: true
        },
        schema: {
            summary: "Marcar visualização em um resultado.",
            description: "Os resultados de uma consulta ficam disponíveis no banco de dados enquanto há pessoas os vendo, são deletados após não serem vistos por ninguém por pouco mais de 1 hora.",
            tags: ["Full Query"],
            params: {
                $ref: "full_query_job_params"
            },
            headers: {
                $ref: "authorization_headers"
            }
        }
    }
]

export default routes