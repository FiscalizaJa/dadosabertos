import { RouteOptions } from "fastify";
import DeputiesController from "../controllers/CamaraController";

const routes: RouteOptions[] = [
    {
        method: "GET",
        url: "/camara/deputies",
        handler: DeputiesController.GetAllDeputies,
        schema: {
            description: "Deputados federais em exercício. Nota: o projeto cobre apenas os parlamentares em exercício em todos os orgãos, por limitações financeiras, não podemos baixar tudo o que queríamos.",
            summary: "Deputados federais em exercício.",
            tags: ["Câmara dos Deputados"],
            querystring: {
                $ref: "all_deputies_querystring"
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
                                        $ref: "deputy_resume_data"
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
        url: "/camara/deputies/:id",
        handler: DeputiesController.GetDeputy,
        schema: {
            description: "Informações detalhadas de um deputado, incluindo contato e gabinete.",
            summary: "Informações do deputado",
            tags: ["Câmara dos Deputados"],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "number",
                        description: "ID do deputado."
                    }
                }
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                data: {
                                    $ref: "deputy_complete_data"
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
        url: "/camara/deputies/:id/expenses",
        handler: DeputiesController.GetDeputyExpenses,
        schema: {
            description: "Lista de despesas do deputado, listando inclusive os fornecedores contratados para o mês e ano selecionados.",
            summary: "Despesas do deputado",
            tags: ["Câmara dos Deputados"],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "number",
                        description: "ID do deputado."
                    }
                }
            },
            querystring: {
                $ref: "deputy_expenses_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                data: {
                                    $ref: "deputy_expenses_data"
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
        url: "/camara/deputies/:id/expenses/resume",
        handler: DeputiesController.getDeputyExpensesResumeByCategory,
        schema: {
            description: "Resumo das despesas do deputado, separando gasto mensal no ano e por tipo de despesa. Estes dados são úteis para construir gráficos e entender melhor como o deputado está usando a cota parlamentar.",
            summary: "Resumo das despesas do deputado",
            tags: ["Câmara dos Deputados"],
            params: {
                type: "object",
                properties: {
                    id: {
                        type: "number",
                        description: "ID do deputado."
                    }
                }
            },
            querystring: {
                $ref: "deputy_expense_resume_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                data: {
                                    $ref: "deputy_expenses_resume_data"
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