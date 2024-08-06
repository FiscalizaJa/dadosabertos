import { RouteOptions } from "fastify";
import SenadoSuppliersController from "../controllers/SenadoSuppliersController";

const routes: RouteOptions[] = [
    {
        method: "GET",
        url: "/senado/suppliers/:cnpj",
        handler: SenadoSuppliersController.GetSupplierTotals,
        schema: {
            description: "Gastos totais contratando um fornecedor específico. Contabiliza de todos os Senadores, podendo ser chamado de \"gastos do Senado\".",
            summary: "Gastos contratando um fornecedor",
            tags: ["Fornecedores do Senado"],
            params: {
                $ref: "senado_suppliers_params_cnpj"
            },
            querystring: {
                $ref: "senado_suppliers_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                data: {
                                    $ref: "senado_suppliers_data"
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
        url: "/senado/suppliers/:cnpj/ranking",
        handler: SenadoSuppliersController.GetSupplierTotalsRanking,
        schema: {
            description: "Retorna um ranking para cada ano selecionado, selecionando os Senadores que mais gastaram nos meses selecionados para o fornecedor em específico.",
            summary: "Ranking de Senadores que mais gastaram com um fornecedor",
            tags: ["Fornecedores do Senado"],
            params: {
                $ref: "senado_suppliers_params_cnpj"
            },
            querystring: {
                $ref: "senado_suppliers_ranking_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                data: {
                                    $ref: "senado_suppliers_ranking_data"
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
        url: "/senado/suppliers/search",
        handler: SenadoSuppliersController.SearchSupplier,
        schema: {
            description: "Pesquisa o nome da empresa ou pessoa na base de dados e retorna quais são os resultados mais próximos juntamente com CNPJ/CPF.",
            summary: "Pesquisa de fornecedores no Senado Federal",
            tags: ["Fornecedores do Senado"],
            querystring: {
                $ref: "senado_suppliers_search_querystring"
            },
            response: {
                200: {
                    type: "object",
                    content: {
                        "application/json": {
                            default: true,
                            schema: {
                                data: {
                                    $ref: "senado_suppliers_search_data"
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