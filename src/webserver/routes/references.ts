import { RouteOptions } from "fastify";
import ReferencesController from "../controllers/ReferencesController";

const routes: RouteOptions[] = [
    {
        method: "GET",
        url: "/camara/references/expense_type",
        handler: ReferencesController.GetCamaraExpensesTypesReference,
        schema: {
            description: "Referência para o campo número do tipo de despesa nas despesas de deputados",
            summary: "'expense_type' em despesas dos deputados",
            tags: ["Referências"]
        }
    },
    {
        method: "GET",
        url: "/camara/references/parties",
        handler: ReferencesController.GetCamaraParties,
        schema: {
            description: "Referência com a lista de siglas dos partidos na Câmara Dos Deputados",
            summary: "Todas as siglas dos partidos na Câmara dos Deputados",
            tags: ["Referências"]
        }   
    },
    {
        method: "GET",
        url: "/senado/references/alternate_type",
        handler: ReferencesController.GetSenadoAlternateTypeReference,
        schema: {
            description: "Referência para os tipos de suplentes de Senadores (titular, primeiro, segundo e terceiro suplente).",
            summary: "Tipos de titularidade de Senadores",
            tags: ["Referências"]
        }
    },
    {
        method: "GET",
        url: "/senado/references/document_type",
        handler: ReferencesController.GetSenadoDocumentTypeReference,
        schema: {
            description: "Referência para os tipos de documentos presente das despesas de Senadores",
            summary: "Tipo de documento em despesas de Senadores",
            tags: ["Referências"]
        }
    },
    {
        method: "GET",
        url: "/senado/references/expense_type",
        handler: ReferencesController.GetSenadoExpenseTypeReference,
        schema: {
            description: "Referência para os tipos de despesa dos Senadores",
            summary: "Tipos de despesa dos Senadores",
            tags: ["Referências"]
        }
    },
    {
        method: "GET",
        url: "/senado/references/parties",
        handler: ReferencesController.GetSenadoParties,
        schema: {
            description: "Referência com a lista de siglas dos partidos no Senado",
            summary: "Todas as siglas dos partidos no Senado",
            tags: ["Referências"]
        }   
    },
]

export default routes