import { RouteOptions } from "fastify";
import CamaraSuppliersController from "../controllers/CamaraSuppliersController";

const routes: RouteOptions[] = [
    {
        method: "GET",
        url: "/camara/suppliers/:cnpj",
        handler: CamaraSuppliersController.GetSupplierTotals,
        schema: {
            description: "Gastos totais contratando um fornecedor específico. Contabiliza de todos os deputados, podendo ser chamado de \"gastos da câmara\".",
            summary: "Gastos contratando um fornecedor",
            tags: ["Fornecedores da Câmara dos Deputados"],
            params: {
                $ref: "camara_suppliers_params_cnpj"
            },
            querystring: {
                $ref: "camara_suppliers_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                data: {
                                    $ref: "camara_suppliers_data"
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
        url: "/camara/suppliers/:cnpj/ranking",
        handler: CamaraSuppliersController.GetSupplierTotalsRanking,
        schema: {
            description: "Retorna um ranking para cada ano selecionado, selecionando os deputados que mais gastaram nos meses selecionados para o fornecedor em específico.",
            summary: "Ranking de deputados que mais gastaram com um fornecedor.",
            tags: ["Fornecedores da Câmara dos Deputados"],
            params: {
                $ref: "camara_suppliers_params_cnpj"
            },
            querystring: {
                $ref: "camara_suppliers_ranking_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                data: {
                                    $ref: "camara_suppliers_ranking_data"
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
        url: "/camara/suppliers/search",
        handler: CamaraSuppliersController.SearchSupplier,
        schema: {
            description: "Pesquisa o nome da empresa ou pessoa na base de dados e retorna quais são os resultados mais próximos juntamente com CNPJ/CPF.",
            summary: "Pesquisa fornecedores na câmara dos deputados",
            tags: ["Fornecedores da Câmara dos Deputados"],
            querystring: {
                $ref: "camara_suppliers_search_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                data: {
                                    $ref: "camara_suppliers_search_data"
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

// CONTINUAR: ranking de deputados que mais gastaram com um fornecedor.

export default routes