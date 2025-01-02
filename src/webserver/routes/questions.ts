import { RouteOptions } from "fastify";
import QuestionsController from "../controllers/QuestionsController";

/*const routes: RouteOptions[] = [
    {
        method: "POST",
        url: "/questions",
        handler: QuestionsController.CreateQuestion,
        config: {
            useGuard: true
        },
        schema: {
            description: "Cria um novo questionamento no FiscalizaJá Open Questions.",
            summary: "Criar questionamento",
            tags: ["Open Questions"],
            headers: {
                $ref: "authorization_headers"
            },
            body: {
                $ref: "open_questions_body"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                $ref: "open_questions_question_data"
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
        url: "/questions",
        handler: QuestionsController.GetQuestions,
        schema: {
            summary: "Obter questionamentos",
            description: "Obtém questionamentos através de uma lista de \"subject_id\".\nO formato esperado é \"type-id\", exemplo: \`senator_expense-2226501\`.",
            tags: ["Open Questions"],
            querystring: {
                $ref: "open_questions_querystring"
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
                                        $ref: "open_questions_data"
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
        method: "POST",
        url: "/questions/:id/votes",
        handler: QuestionsController.CreateQuestionVote,
        config: {
            useGuard: true
        },
        schema: {
            summary: "Votar em uma questão",
            description: "Cria um voto numa questão, indicando se a mesma é relevante ou não.",
            tags: ["Open Questions"],
            params: {
                $ref: "open_questions_params"
            },
            body: {
                $ref: "open_questions_vote_body"
            },
            headers: {
                $ref: "authorization_headers"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                $ref: "open_questions_question_vote_data"
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
]*/
// Por enquanto inviavel

const routes = []

export default routes