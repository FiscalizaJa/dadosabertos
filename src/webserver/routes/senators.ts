import { RouteOptions } from "fastify";
import SenatorsController from "../controllers/SenadoController";

const routes: RouteOptions[] = [
    {
        method: "GET",
        url: "/senado/senators",
        handler: SenatorsController.GetAllSenators,
        schema: {
            description: "Todos os Senadores em exercício atualmente no Senado Federal.",
            summary: "Senadores em exercício",
            tags: ["Senado Federal"],
            querystring: {
                $ref: "all_senators_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            schema: {
                                data: {
                                    type: "array",
                                    items: {
                                        $ref: "senator_resume_data"
                                    }
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
        url: "/senado/senators/:id",
        handler: SenatorsController.GetSenator,
        schema: {
            description: "Informações detalhadas de um Senador Federal, acompanha endereço, números de telefone e email para contato com gabinete.",
            summary: "Informações do Senador",
            tags: ["Senado Federal"],
            params: {
                $ref: "senator_params"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            schema: {
                                data: {
                                    $ref: "senator_complete_data"
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
        method: "get",
        url: "/senado/senators/:id/expenses",
        handler: SenatorsController.GetSenatorExpenses,
        schema: {
            description: "Lista as despesas do Senador, incluindo nome de fornecedores contratados.",
            summary: "Despesas do Senador",
            tags: ["Senado Federal"],
            params: {
                $ref: "senator_params"
            },
            querystring: {
                $ref: "senator_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            schema: {
                                data: {
                                    $ref: "senator_expenses_data"
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
        url: "/senado/senators/:id/expenses/resume",
        handler: SenatorsController.GetSenatorExpensesResumeByCategory,
        schema: {
            description: "Resumo das despesas do Senador, separando gasto mensal no ano e por tipo de despesa. Estes dados são úteis para construir gráficos e entender melhor como o Senador está usando a cota parlamentar.",
            summary: "Resumo das despesas do Senador",
            tags: ["Senado Federal"],
            params: {
                $ref: "senator_params"
            },
            querystring: {
                $ref: "senator_expenses_resume_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            schema: {
                                data: {
                                    $ref: "senator_expenses_resume_data"
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
    }
]

export default routes