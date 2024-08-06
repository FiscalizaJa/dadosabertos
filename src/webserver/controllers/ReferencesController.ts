import type { FastifyRequest, FastifyReply } from "fastify";

import camara_expenses_types_reference from "../../services/dadosabertos/camara/expense_type_reference.json";
import senado_alternate_type from "../../services/dadosabertos/senado/alternate_type_reference.json";
import senado_document_type from "../../services/dadosabertos/senado/document_type_reference.json";
import senado_expense_type_reference from "../../services/dadosabertos/senado/expense_type_reference.json";

async function GetCamaraExpensesTypesReference() {
    const keys = Object.keys(camara_expenses_types_reference)
    const expenses_reference = []

    for(const key of keys) {
        const type = camara_expenses_types_reference[key].type
        const splitted_key = key.split(":")

        expenses_reference.push({
            subquota: splitted_key[0],
            number_specification_subquota: splitted_key[1],
            type: type
        })
    }

    return expenses_reference
}

async function GetSenadoAlternateTypeReference() {
    return {
        types: senado_alternate_type
    }
}

async function GetSenadoDocumentTypeReference() {
    return senado_document_type.types
}

async function GetSenadoExpenseTypeReference() {
    return senado_expense_type_reference.types
}

export default {
    GetCamaraExpensesTypesReference,
    GetSenadoAlternateTypeReference,
    GetSenadoDocumentTypeReference,
    GetSenadoExpenseTypeReference
}