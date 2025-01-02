import type { FastifyRequest, FastifyReply } from "fastify";
import QueryHandler from "../../services/dadosabertos/senado/queryHandler";

import type { ParlamentarianListQuerystring } from "../../interfaces/ParlamentarianListQuerystring";
import { ExpensesFilters } from "../../interfaces/ExpensesFilters";
import type { ExpensesResumeFilter } from "../../interfaces/ExpensesResumeFilter";
import GlobalRedisConnection from "../../services/redis/ReusableConnection";

const senatorsQueryHandler = new QueryHandler()

async function GetAllSenators(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as ParlamentarianListQuerystring
    const deputies = await senatorsQueryHandler.getSenators(query)

    res.status(200).send(deputies)
}

async function GetSenator(req: FastifyRequest, res: FastifyReply) {
    const params = req.params as { id: number }
    const data = await senatorsQueryHandler.getSenator(params.id) as any

    if(data && !data.bio) {
        const KEY = `generating-bio-senado-${data.id}`

        const isGeneratingBios = await GlobalRedisConnection.get(KEY)

        if(!isGeneratingBios) {
            await GlobalRedisConnection.set(KEY, Date.now(), "EX", 500) // 5 minutes limit
            senatorsQueryHandler.getSenatorBio(params.id, data).then(async () => {
                GlobalRedisConnection.del(KEY)
            })
        }

        data.bio = "[generating]"
    }

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

async function SpendRanking(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as ExpensesResumeFilter
    
    const data = await senatorsQueryHandler.spendRanking(query) as any
    
    const organized_data = {}

    for(const d of data) {
        if(!organized_data[d.year]) {
            organized_data[d.year] = []
        }

        organized_data[d.year].push({
            year: d.year,
            months: d.months,
            total: d.total,
            parlamentarian_name: d.senator_name,
            parlamentarian_id: d.senator_id,
            per_category: d.per_category
        })
    }

    return {
        data: organized_data
    }
}

export default {
    GetAllSenators,
    GetSenator,
    GetSenatorExpenses,
    GetSenatorExpensesResumeByCategory,

    SpendRanking
}