import type { FastifyRequest, FastifyReply } from "fastify";
import QueryHandler from "../../services/dadosabertos/camara/queryHandler";

import type { ParlamentarianListQuerystring } from "../../interfaces/ParlamentarianListQuerystring";
import { ExpensesFilters } from "../../interfaces/ExpensesFilters";
import type { ExpensesResumeFilter } from "../../interfaces/ExpensesResumeFilter";

const deputiesQueryHandler = new QueryHandler()

async function GetAllDeputies(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as ParlamentarianListQuerystring
    const deputies = await deputiesQueryHandler.getDeputies(query)

    res.status(200).send({ data: deputies })
}

async function GetDeputy(req: FastifyRequest, res: FastifyReply) {
    const params = req.params as { id: number }
    const data = await deputiesQueryHandler.getDeputy(params.id)

    return {
        data
    }
}

async function GetDeputyExpenses(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as ExpensesFilters
    const params = req.params as { id: number }

    const promises = await Promise.all([
        deputiesQueryHandler.getDeputyExpenses(params.id, query),
        deputiesQueryHandler.getDeputyExpensesSuppliers(params.id, { month: query.month, year: query.year })
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

async function getDeputyExpensesResumeByCategory(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as ExpensesResumeFilter
    const params = req.params as { id: number }

    const categories = await deputiesQueryHandler.getDeputyExpensesResumeByCategory(params.id, query)
    const monthly: any = await deputiesQueryHandler.getDeputyExpensesResumeByMonth(params.id, query)

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
            categories: categories,
            monthly: organized_monthly_data
        }
    }
}

export default {
    GetAllDeputies,
    GetDeputy,
    GetDeputyExpenses,
    getDeputyExpensesResumeByCategory
}