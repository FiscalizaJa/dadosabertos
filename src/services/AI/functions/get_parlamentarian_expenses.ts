import CamaraQueryHandler from "../../dadosabertos/camara/queryHandler";
import SenadoQueryHandler from "../../dadosabertos/senado/queryHandler";

import senado_expense_types from "../../dadosabertos/senado/expense_type_reference.json";
import camara_expense_types from "../../dadosabertos/camara/expense_type_reference.json";

import type { GPTFunctionMeta } from "../../../interfaces/GPTMessage";

const camara = new CamaraQueryHandler()
const senado = new SenadoQueryHandler()

export default async function get_parlamentarian_expenses({ parlamentarian_id, parlamentarian_type, year, months }, meta: GPTFunctionMeta) {
    if(!year || !months) {
        return "Parâmetros inválidos."
    } else {

        let expenses_data;
        const types = parlamentarian_type === "deputado" ? camara_expense_types : senado_expense_types as any

        if(parlamentarian_type === "deputado") {
            const expenses = await camara.getDeputyExpenses(parlamentarian_id, {
                itens: 1000,
                year: [year],
                month: months
            })

            expenses_data = expenses
        } else if(parlamentarian_type === "senador") {
            const expenses = await senado.getSenatorExpenses(parlamentarian_id, {
                itens: 1000,
                year: [year],
                month: [months]
            })

            expenses_data = expenses
        } else {
            return "Tipo de parlamentar inválido."
        }

        for(const expenseIndex in expenses_data) {
            const expense = expenses_data[expenseIndex]
            if(parlamentarian_type === "senador") {
                expenses_data[expenseIndex]["_type"] = types.types[expense.subquota]
            } else if(meta.house === "camara") {
                expense["_type"] = types.types[`${expense.subquota}:${expense.number_specification_subquota}`]
                expenses_data[expenseIndex]["_type"] = types.types[`${expense.subquota}:${expense.number_specification_subquota}`]
            }
        }

        return `
            **Despesas do ${parlamentarian_type}**

            ${JSON.stringify(expenses_data, undefined, 4)}
        `
    }
}