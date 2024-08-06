import type { FastifyRequest, FastifyReply } from "fastify";
import QueryHandler from "../../services/dadosabertos/senado/queryHandler";

import type { ParlamentarianListQuerystring } from "../../interfaces/ParlamentarianListQuerystring";
import { ExpensesFilters } from "../../interfaces/ExpensesFilters";
import type { ExpensesResumeFilter } from "../../interfaces/ExpensesResumeFilter";

const senatorsQueryHandler = new QueryHandler()

async function GetAllSenators(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as ParlamentarianListQuerystring
    const deputies = await senatorsQueryHandler.getSenators(query)

    res.status(200).send({ data: deputies })
}

async function GetSenator(req: FastifyRequest, res: FastifyReply) {
    const params = req.params as { id: number }
    const data = await senatorsQueryHandler.getSenator(params.id)

    return {
        data
    }
}

async function GetSenatorExpenses(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as ExpensesFilters
    const params = req.params as { id: number }

    const promises = await Promise.all([
        senatorsQueryHandler.getSenatorExpenses(params.id, query),
        senatorsQueryHandler.getSenatorExpensesSuppliers(params.id, { month: query.month, year: query.year })
    ])

    const expenses = promises[0]
    const suppliers = promises[1]


    return {
        data: {
            suppliers,
            expenses
        }
    }
}

async function GetSenatorExpensesResumeByCategory(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as ExpensesResumeFilter
    const params = req.params as { id: number }

    const categories = await senatorsQueryHandler.getSenatorExpensesResumeByCategory(params.id, query)
    const monthly: any = await senatorsQueryHandler.getSenatorExpensesResumeByMonth(params.id, query)

    const organized_monthly_data = {}

    for(const m_data of monthly) {
        if(!organized_monthly_data[m_data.year]) {
            organized_monthly_data[m_data.year] = []
        }

        organized_monthly_data[m_data.year].push({
            month: m_data.month,
            total: m_data.total
        })
    }

    return {
        data: {
            categories,
            monthly: organized_monthly_data
        }
    }
}

export default {
    GetAllSenators,
    GetSenator,
    GetSenatorExpenses,
    GetSenatorExpensesResumeByCategory
}