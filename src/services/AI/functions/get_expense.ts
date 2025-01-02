import CamaraQueryHandler from "../../dadosabertos/camara/queryHandler";
import SenadoQueryHandler from "../../dadosabertos/senado/queryHandler";

import senado_expense_types from "../../dadosabertos/senado/expense_type_reference.json";
import camara_expense_types from "../../dadosabertos/camara/expense_type_reference.json";

import type { GPTFunctionMeta } from "../../../interfaces/GPTMessage";

const camara = new CamaraQueryHandler()
const senado = new SenadoQueryHandler()

export default async function get_expense({ expense_id }, meta: GPTFunctionMeta) {
    if(!expense_id) {
        return "ID de despesa não fornecido."
    } else {
        expense_id = Number(expense_id)

        if(isNaN(expense_id)) {
            return "O ID da despesa deve ser numérico."
        }

        const house = meta.house === "senado" ? senado : camara
        const types: any = meta.house === "senado" ? senado_expense_types : camara_expense_types

        const expense = await house.getSpecificExpense(expense_id) as any

        if(!expense) {
            return "Despesa não encontrada"
        } else {
            let properties_doc = ""

            const keys = Object.keys(types.schema)
    
            for(const key of keys) {
                const schema = types.schema[key]
                properties_doc += `- ${key}: ${schema.description}\n`
            }
            
            if(meta.house === "senado") {
                expense["_type"] = types.types[expense.subquota]
            } else if(meta.house === "camara") {
                expense["_type"] = types.types[`${expense.subquota}:${expense.number_specification_subquota}`]
            }

            return `
                **Dados da despesa ${expense_id}**

                Dados em JSON:
                ${JSON.stringify(expense, undefined, 4)}
            `
        }
    }
}