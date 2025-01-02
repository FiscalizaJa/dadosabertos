import type { FastifyRequest, FastifyReply } from "fastify";
import QueryHandler from "../../services/dadosabertos/camara/queryHandler";

import type { ParlamentarianListQuerystring } from "../../interfaces/ParlamentarianListQuerystring";
import { ExpensesFilters } from "../../interfaces/ExpensesFilters";
import type { ExpensesResumeFilter } from "../../interfaces/ExpensesResumeFilter";

import GlobalRedisConnection from "../../services/redis/ReusableConnection";

const deputiesQueryHandler = new QueryHandler()
const GENERATING_TIMEOUT = 500

async function GetAllDeputies(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as ParlamentarianListQuerystring
    const deputies = await deputiesQueryHandler.getDeputies(query)

    res.status(200).send(deputies)
}

async function GetDeputy(req: FastifyRequest, res: FastifyReply) {
    const params = req.params as { id: number }
    const data = await deputiesQueryHandler.getDeputy(params.id) as any

    if(data && !data.bio) {
        const KEY = `generating-bio-${data.id}`

        const isGeneratingBios = await GlobalRedisConnection.get(KEY)

        if(!isGeneratingBios) {
            await GlobalRedisConnection.set(KEY, Date.now(), "EX", GENERATING_TIMEOUT) // 5 minutes limit
            deputiesQueryHandler.getDeputyBio(params.id, data).then(() => {
                GlobalRedisConnection.del(KEY)
            })
        }

        data.bio = "[generating]"
    }

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

    const expenses = promises[0] as any
    const suppliers = promises[1]


    return {
        data: {
            suppliers,
            expenses: expenses.data
        },
        metadata: expenses.metadata
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

async function SpendRanking(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as ExpensesResumeFilter
    
    const data = await deputiesQueryHandler.spendRanking(query) as any
    
    const organized_data = {}

    for(const d of data) {
        if(!organized_data[d.year]) {
            organized_data[d.year] = []
        }

        organized_data[d.year].push({
            year: d.year,
            months: d.months,
            total: d.total,
            parlamentarian_name: d.deputy_name,
            parlamentarian_id: d.deputy_id,
            per_category: d.per_category
        })
    }

    return {
        data: organized_data
    }
}

export default {
    GetAllDeputies,
    GetDeputy,
    GetDeputyExpenses,
    getDeputyExpensesResumeByCategory,

    SpendRanking
}