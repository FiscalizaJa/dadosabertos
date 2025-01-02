import type { FastifyRequest, FastifyReply } from "fastify";

import camara_expenses_types_reference from "../../services/dadosabertos/camara/expense_type_reference.json";
import senado_alternate_type from "../../services/dadosabertos/senado/alternate_type_reference.json";
import senado_document_type from "../../services/dadosabertos/senado/document_type_reference.json";
import senado_expense_type_reference from "../../services/dadosabertos/senado/expense_type_reference.json";

import CamaraQueryHandler from "../../services/dadosabertos/camara/queryHandler";
import SenadoQueryHandler from "../../services/dadosabertos/senado/queryHandler";

const camara = new CamaraQueryHandler()
const senado = new SenadoQueryHandler()

async function GetCamaraExpensesTypesReference() {
    const keys = Object.keys(camara_expenses_types_reference)
    const expenses_reference = []

    for(const key of keys) {
        const type = camara_expenses_types_reference[key]
        const splitted_key = key.split(":")

        expenses_reference.push({
            subquota: splitted_key[0],
            number_specification_subquota: splitted_key[1],
            type: type
        })
    }

    return {
        reference: expenses_reference,
        conversion: camara_expenses_types_reference
    }
}

async function GetCamaraParties() {
    const parties = await camara.getParties()

    return {
        data: parties
    }
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
    const keys = Object.keys(senado_expense_type_reference.types)
    const expenses_reference = []

    for(const key of keys) {
        const type = senado_expense_type_reference.types[key]

        expenses_reference.push({
            subquota: key,
            type: type
        })
    }

    return {
        reference: expenses_reference,
        conversion: senado_expense_type_reference.types
    }
}

async function GetSenadoParties() {
    const parties = await senado.getParties()

    return {
        data: parties
    }
}

export default {
    GetCamaraExpensesTypesReference,
    GetCamaraParties,
    GetSenadoAlternateTypeReference,
    GetSenadoDocumentTypeReference,
    GetSenadoExpenseTypeReference,
    GetSenadoParties
}