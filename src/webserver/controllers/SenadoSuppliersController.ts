import type { FastifyRequest, FastifyReply } from "fastify";
import type { SuppliersTotals } from "../../interfaces/SuppliersTotals";

import QueryHandler from "../../services/dadosabertos/senado/queryHandler";

const senatorsQueryHandler = new QueryHandler()

async function GetSupplierTotals(req: FastifyRequest, res: FastifyReply) {
    const params = req.params as { cnpj: string }
    const query = req.query as SuppliersTotals

    const data = await senatorsQueryHandler.getSuppliersTotals(params.cnpj, query)

    return {
        data
    }
}

async function GetSupplierTotalsRanking(req: FastifyRequest, res: FastifyReply) {
    const params = req.params as { cnpj: string }
    const query = req.query as SuppliersTotals & { year: number[] }

    const data = await senatorsQueryHandler.getSupplierTotalsRanking(params.cnpj, query) as any

    const organized_data = {}

    for(const d of data) {
        if(!organized_data[d.year]) {
            organized_data[d.year] = []
        }

        organized_data[d.year].push({
            year: d.year,
            months: d.months,
            total: d.total,
            senator_name: d.senator_name,
            senator_id: d.senator_id
        })
    }

    return {
        data: organized_data
    }
}

async function SearchSupplier(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as { query: string }

    const data = await senatorsQueryHandler.searchSupplier(query.query)

    return {
        data
    }
}

export default {
    GetSupplierTotals,
    GetSupplierTotalsRanking,
    SearchSupplier
}