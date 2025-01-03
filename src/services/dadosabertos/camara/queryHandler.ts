import database from "./database";

import type { ParlamentarianListQuerystring } from "../../../interfaces/ParlamentarianListQuerystring";
import type { ExpensesFilters } from "../../../interfaces/ExpensesFilters";
import type { ExpensesSuppliersFilters } from "../../../interfaces/ExpensesSuppliersFilters";
import type { ExpensesResumeFilter } from "../../../interfaces/ExpensesResumeFilter";
import type { SuppliersTotals } from "../../../interfaces/SuppliersTotals";
import { FullQuery } from "../../../interfaces/FullQuery";
import MeiliClient from "../../meilisearch/MeiliSearch";

import crypto from "crypto";
import { SearchParlamentarian } from "../../../interfaces/SearchParlametarian";
import { SearchSupplier } from "../../../interfaces/SearchSupplier";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
import wikipedia from "wikipedia";
import ConvertSpacesToUnderscores from "../../../utils/ConvertSpacesToUnderscore";

wikipedia.setLang("pt")

/**
 * Query handler is a class that own all functions to write queries in database
 */
class QueryHandler {
    static MAX_DEPUTIES = 512
    static MAX_EXPENSES = 100

    static EXPENSE_KEYS = ["name_parlamentarian", "wallet", "subquota", "number_specification_subquota", "detail_specification", "supplier", "identifier", "number", "type_document", "emission_date", "value_document", "value_gloss", "liquid_value", "month", "year", "parcel", "passenger", "section", "lot", "reimbursement", "payment_date_refund", "refund", "document_id", "url_document", "insert_date", "deputy_id"];
    static FULL_QUERY_ERROR_LIST = {
        '42883': "Você selecionou um operador inválido para o tipo de argumento fornecido. Certifique-se de usar operadores de comparação \"MORE\" e \"MINOR\" somente para campos e valores númericos."
    }

    constructor() {

    }

    public getStat() {
        return new Promise((resolve, reject) => {
            database`
                SELECT (
                    SELECT
                        COUNT(*)
                    FROM pg_stat_activity
                    WHERE
                        state = 'active'
                )::NUMERIC - 1 AS active_queries;
            `.then(data => resolve(data[0])).catch(e => {
                resolve({ active_queries: -1 })
            })
        })
    }

    getAllDeputiesWithoutFiltersGenerator(batchSize: number) {
        const data = database`
            SELECT *
            FROM camara_deputy
        `.cursor(batchSize)

        return data
    }

    getExpensesByHitId(hitId: string, page: number, itens: number) {
        return new Promise(async (resolve, reject) => {
            const OFFSET = itens * (page - 1)
            const data = await database`
                WITH hits AS (
                    SELECT
                        UNNEST(hits) as hit
                    FROM camara_expenses_query_hits
                    WHERE
                        id = ${hitId}
                    LIMIT ${itens} ${page > 1 ? database`OFFSET ${OFFSET}` : database``}
                )
                SELECT *
                FROM
                    camara_expense
                WHERE
                    id in (SELECT hit FROM hits)
            `.catch(e => {
                reject(e)
                return null
            })

            if(data) {
                resolve(data)
            }
        })
    }

    getParties() {
        return new Promise(async (resolve, reject) => {
            const data = await database`
                SELECT
                    ARRAY_AGG(DISTINCT party) as parties
                FROM camara_deputy
            `.catch(e => reject(e))
        
            resolve(data[0].parties)
        })
    }

    getDeputies(filter: ParlamentarianListQuerystring = { itens: QueryHandler.MAX_DEPUTIES, orderby: "name", order: "asc", page: 1}) {
        return new Promise(async (resolve, reject) => {
            filter.itens = Math.min(filter.itens || QueryHandler.MAX_DEPUTIES, QueryHandler.MAX_DEPUTIES)
            
            const offset = (filter.page - 1) * filter.itens

            if(filter.searchTerm && !filter.id?.length) {
                const index = MeiliClient.index("deputies")
                const data = await index.search<SearchParlamentarian>(filter.searchTerm)

                const ids = data.hits.map(hit => hit.id)
                
                filter.id = ids

                if(!ids.length) {
                    return resolve([])
                }
            }

            const queries = await Promise.all([
                database`
                    SELECT
                        *
                    FROM camara_deputy
                        ${filter.id ? database`WHERE id IN ${database(filter.id)}` : database``}
                        ${filter.birth_uf ? database`${filter.id ? database.unsafe(`AND`) : database`WHERE`} birth_uf = ${filter.birth_uf}` : database``}
                        ${filter.party ? database`${filter.birth_uf ? database.unsafe(`AND`) : database`WHERE`} party = ${filter.party}` : database``}
                    ORDER BY ${database(filter.orderby)} ${filter.order === "desc" ? database`desc` : database`asc`}
                    LIMIT ${filter.itens}
                    ${filter.page > 1 ? database`OFFSET ${offset}` : database``}
                `,
                database`
                    SELECT
                        COUNT(*) AS items
                    FROM camara_deputy
                        ${filter.id ? database`WHERE id IN ${database(filter.id)}` : database``}
                        ${filter.birth_uf ? database`${filter.id ? database.unsafe(`AND`) : database`WHERE`} birth_uf = ${filter.birth_uf}` : database``}
                        ${filter.party ? database`${filter.birth_uf ? database.unsafe(`AND`) : database`WHERE`} party = ${filter.party}` : database``}
                `
            ])

            const data = queries[0]
            const metadata = queries[1]

            resolve({
                data,
                metadata: metadata[0]
            })
        })
    }

    getDeputy(id: number) {
        return new Promise(async (resolve, reject) => {
            const promises = await Promise.all([
                database`
                    SELECT * FROM camara_deputy
                    WHERE id = ${id}
                `,
                database`
                    SELECT name, building, room, floor, phone, email FROM camara_deputy_office
                    WHERE deputy_id = ${id}
                `,
                database`
                    SELECT url, type FROM camara_deputy_links
                    WHERE deputy_id = ${id}
                `
            ])

            const deputy_infos = promises[0]
            const office = promises[1]
            const links = promises[2]

            resolve({
                ...deputy_infos[0],
                office,
                links
            })
        })
    }

    getDeputyBio(id: number, deputy_data?: any): Promise<string> {
        return new Promise(async (resolve, reject) => {
            const deputy = deputy_data || await this.getDeputy(id) as any

            if(!deputy) {
                return reject("Deputy not found")
            }

            const ChatProvider = await import("../../AI/ChatProvider");
            const chatProvider = new ChatProvider.default(ChatProvider.Provider.Gemini)

            let bio = deputy.bio

            const model = await chatProvider.client.createRawModel({
                model: "gemini-1.5-pro",
                systemInstruction: `
                    Resuma este artigo sobre o parlamentar e destaque pontos principais como os temas em que atua, seu trajeto e qualificações. Não mencione situações controvérsias ou polêmicas ao qual o mesmo tenha se envolvido. Mantenha-se imparcial.
                    O texto deve ser compacto e direto, então tente manter algo próximo de 3 linhas.
                    Caso o conteúdo dê muito peso para controvérsias e polêmicas, dificultando um resumo imparcial, deixe "[biased_content]" no final.
                `,
                safetySettings: [
                    {
                        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    },
                    {
                        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                        threshold: HarmBlockThreshold.BLOCK_NONE
                    }
                ]
            })

            const selectedArticle = deputy.links.find(l => l.type === "Wikipedia")?.url

            if(!selectedArticle) {
                bio = "[none]"
            }

            const page = await wikipedia.page(selectedArticle).catch(e => null)

            if(!page) {
                bio = "[none]"
            }

            if(bio !== "[none]" && bio !== "[wrong_article]") {
                const summary = await page.content({ fields: ["content"] })
                const AISummary = await model.generateContent(summary).catch(e => null)

                if(!AISummary) {
                    bio = "[none]"
                } else {
                    bio = AISummary?.response?.text()
                    if(bio) {
                        bio += " [ai_generated]"
                    }
                }
            }
            
            await database`
                UPDATE camara_deputy SET bio = ${bio} WHERE id = ${id}
            `
        
            resolve(bio)
        })
    }

    getDeputyExpenses(id: number, filter: ExpensesFilters) {
        return new Promise(async (resolve, reject) => {
            const date = new Date()

            filter.itens = Math.min(filter.itens || 100, 100)
            filter.year = filter.year || [date.getFullYear()]
            filter.month = filter.month || [(date.getMonth() + 1)]

            const offset = (filter.page * filter.itens) - 1

            const queries = await Promise.all([
                database`
                    SELECT ${database(QueryHandler.EXPENSE_KEYS)}
                    FROM camara_expense 
                    WHERE 
                        deputy_id = ${id} 
                        AND year IN ${database(filter.year)} AND month IN ${database(filter.month)}
                    LIMIT ${filter.itens}
                    ${filter.page > 1 ? database`OFFSET ${offset}` : database``}
                `,
                database`
                    SELECT
                        COUNT(*) AS items
                    FROM camara_expense 
                    WHERE 
                        deputy_id = ${id} 
                        AND year IN ${database(filter.year)} AND month IN ${database(filter.month)}
                    LIMIT ${filter.itens}
                `
            ]).catch(e => {
                reject(e)
            })

            resolve({
                data: queries[0],
                metadata: queries[1][0]
            })
        })
    }

    getDeputyExpensesSuppliers(id: number, filter: ExpensesSuppliersFilters) {
        return new Promise(async (resolve, reject) => {
            const date = new Date()

            filter.year = filter.year || [date.getFullYear()]
            filter.month = filter.month || [(date.getMonth() + 1)]

            const data = await database`
                SELECT 
                    supplier as name, 
                    COUNT(*) AS purchases, 
                    SUM(liquid_value) AS total, 
                    identifier
                FROM camara_expense
                WHERE 
                    deputy_id = ${id}
                    AND year IN ${database(filter.year)}
                    AND month IN ${database(filter.month)}
                GROUP BY name, identifier
            `.catch(e => {
                reject(e)
            })

            resolve(data)
        })
    }

    getDeputyExpensesResumeByCategory(id: number, filter: ExpensesResumeFilter) {
        return new Promise(async (resolve, reject) => {
            const date = new Date()

            filter.year = filter.year || [date.getFullYear()]
            filter.month = filter.month || [date.getMonth() + 1]

            const data = await database`
                SELECT 
                    SUM(liquid_value) as total,
                    subquota,
                    number_specification_subquota
                FROM camara_expense
                WHERE 
                    deputy_id = ${id}
                    AND year IN ${database(filter.year)}
                    AND month IN ${database(filter.month)}
                GROUP BY subquota, number_specification_subquota
            `.catch(e => {
                reject(e)
            })

            resolve(data)
        })
    }

    getDeputyExpensesResumeByMonth(id: number, filter: ExpensesResumeFilter) {
        return new Promise(async (resolve, reject) => {
            const date = new Date()

            filter.year = filter.year || [date.getFullYear()]
    
            const data = await database`
                SELECT
                    year,
                    month,
                    SUM(liquid_value) AS total
                FROM camara_expense
                WHERE
                    deputy_id = ${id}
                    AND year IN ${database(filter.year)}
                GROUP BY year, month
            `

            resolve(data)
        })
    }

    getSuppliersTotals(identifier: string, filter: SuppliersTotals) {
        return new Promise(async (resolve, reject) => {
            const date = new Date()
            
            const names = await this.getNamesFromIdentifier(identifier)
            
            filter.month = filter.month || [(date.getMonth() + 1)]

            const data = await database`
                SELECT
                    year,
                    ARRAY_AGG(DISTINCT month) AS months,
                    SUM(total) AS total
                FROM camara_expenses_total
                WHERE
                    supplier IN ${database(names)}
                    AND month in ${database(filter.month)}
                    ${filter.deputy_id ? database`AND deputy_id = ${filter.deputy_id}` : database``}
                GROUP BY year
            `.catch(e => {
                reject(e)
            })

            resolve({
                names,
                data
            })
        })
    }

    getSupplierTotalsRanking(identifier: string, filter: SuppliersTotals & { year: number[] }) {
        return new Promise(async (resolve, reject) => {
            const date = new Date()

            const names = await this.getNamesFromIdentifier(identifier)
            
            filter.year = filter.year || [date.getFullYear()]
            filter.month = filter.month || [(date.getMonth() + 1)]

            const data = await database`
                SELECT
                    year,
                    ARRAY_AGG(DISTINCT month) as months,
                    SUM(total) AS total,
                    deputy_name,
                    deputy_id
                FROM (
                    SELECT
                        year,
                        month,
                        total,
                        deputy_name,
                        deputy_id,
                        ROW_NUMBER() OVER (PARTITION BY year ORDER BY total DESC) as rn
                    FROM camara_expenses_total
                    WHERE
                        supplier IN ${database(names)}
                        AND month IN ${database(filter.month)}
                        AND year IN ${database(filter.year)}
                    GROUP BY year, month, total, deputy_name, deputy_id
                ) subquery
                WHERE rn <= 30
                GROUP BY year, deputy_name, deputy_id
                ORDER BY total DESC;
            `
            resolve(data)
        })
    }

    getNamesFromIdentifier(identifier: string): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            const data = await database`
                SELECT name FROM camara_supplier
                WHERE identifier = ${identifier}
            `

            resolve(data.map(d => d.name))
        })
    }

    getSpecificExpense(id: number) {
        return new Promise(async (resolve, reject) => {
            const data = await database`
                SELECT ${database(QueryHandler.EXPENSE_KEYS)}
                FROM camara_expense
                WHERE id = ${id}
            `

            resolve(data[0] || null)
        })
    }

    getAllSuppliersWithoutFiltersGenerator(batchSize: number) {
        const data = database`
            SELECT *
            FROM camara_supplier
        `.cursor(batchSize)

        return data
    }

    searchSupplier(query: string) {
        return new Promise(async (resolve, reject) => {
            // LEGACY SEARCH
            /*const data = await database`
                SELECT 
                    MAX(identifier) AS identifier,
                    ARRAY_AGG(name) AS names
                FROM supplier
                WHERE name_vector @@ plainto_tsquery('portuguese', ${query})
                GROUP BY identifier
                LIMIT 15
            `*/

            const index = MeiliClient.index("camara_suppliers")
            const preparedData: { identifier: string, names: string[] }[] = []
            const data = await index.search<SearchSupplier>(query)

            const identifiersToName: Record<string, string[]> = {}

            for(const hit of data.hits) {
                if(!identifiersToName[hit.identifier]) {
                    identifiersToName[hit.identifier] = []
                }

                identifiersToName[hit.identifier].push(hit.name)
            }

            const identifiers = Object.keys(identifiersToName)
            
            for(const identifier of identifiers) {
                preparedData.push({
                    identifier: identifier,
                    names: identifiersToName[identifier]
                })
            }

            resolve(preparedData.slice(0, 15))
        })
    }

    spendRanking(filter: ExpensesResumeFilter) {
        return new Promise(async (resolve, reject) => {
            const date = new Date()

            filter.year = filter.year || [date.getFullYear()]
            filter.month = filter.month || [(date.getMonth() + 1)]

            const data = await database`
                WITH ranked_expenses AS (
                    SELECT
                        year,
                        month,
                        total,
                        deputy_name,
                        deputy_id
                    FROM camara_expenses_total
                    WHERE
                        month IN ${database(filter.month)}
                        AND year IN ${database(filter.year)}
                )
                SELECT
                    year,
                    ARRAY_AGG(DISTINCT month) as months,
                    SUM(total) AS total,
                    deputy_name,
                    deputy_id
                FROM ranked_expenses
                GROUP BY year, deputy_name, deputy_id
                ORDER BY total DESC;
            `

            const ids = data.map(d => d.deputy_id)

            const per_category = await database`
                SELECT
                    deputy_id,
                    year,
                    JSON_AGG(
                        JSON_BUILD_OBJECT(
                            'subquota', subquota,
                            'number_specification_subquota', number_specification_subquota,
                            'total', total
                        )
                    ) AS totals
                FROM (
                    SELECT
                        deputy_id,
                        year,
                        subquota,
                        number_specification_subquota,
                        SUM(liquid_value) AS total
                    FROM camara_expense
                    WHERE
                        month IN ${database(filter.month)}
                        AND year IN ${database(filter.year)}
                        AND deputy_id IN ${database(ids)}
                    GROUP BY deputy_id, year, subquota, number_specification_subquota
                ) AS grouped_expenses
                GROUP BY deputy_id, year;
            `

            const spend_per_category: Record<string, any> = {}

            for(const spend of per_category) {
                spend_per_category[`${spend.deputy_id}-${spend.year}`] = spend.totals
            }

            for(const index in data) {
                const value = data[index]

                data[index].per_category = spend_per_category[`${value.deputy_id}-${value.year}`]
            }

            resolve(data)
        })
    }

    fullQuery(full_query: FullQuery[], limit: number = 150) {
        const conversions = {
            "MINOR": "<",
            "MORE": ">",
            "EQUAL": "=",
        }

        return new Promise(async (resolve, reject) => {
            const conditions = full_query.map(query => {
                if(!["AND", "OR"].includes(query.operator)) {
                    const value = isNaN(parseInt(query.value)) ? String(query.value) : Number(query.value) 
                    return database`${database(query.property)} ${database.unsafe(conversions[query.operator])} ${value}`
                } else {
                    return query.operator
                }
            }) as any

            const separate_indexes = full_query.map((query, i) => {
                if(["AND", "OR"].includes(query.operator)) {
                    return i
                } else {
                    return undefined
                }
            }).filter(q => q !== undefined)
            
            const hitsId = crypto.randomBytes(16).toString("hex")
            
            const d = await database`
                INSERT INTO camara_expenses_query_hits (id, hits)
                VALUES (
                    ${hitsId}, 
                    (SELECT ARRAY(SELECT id FROM camara_expense WHERE ${conditions.flatMap((x, i) => separate_indexes.includes(i) ? [database`${database.unsafe(x as any)}`] : x)} ))
                );
            `.catch(e => {
                console.error(e)
                return {
                    error: QueryHandler.FULL_QUERY_ERROR_LIST[e.code] || "Erro desconhecido."
                }
            })

            const suppliers_ranking = await database`
                SELECT
                    name,
                    identifier,
                    SUM(liquid_value) AS total,
                    year,
                    COUNT(*) as purchases,
                    ARRAY_AGG(DISTINCT month) AS months,
                    JSON_AGG(JSON_BUILD_OBJECT(
                        'deputy_id', deputy_id,
                        'deputy_name', deputy_name,
                        'spent', deputy_total
                    )) AS spending
                FROM (
                    SELECT
                        year,
                        month,
                        liquid_value,
                        SUM(liquid_value) AS deputy_total,
                        deputy_id,
                        name_parlamentarian AS deputy_name,
                        supplier AS name,
                        identifier
                    FROM camara_expense
                    WHERE
                        ${conditions.flatMap((x, i) => separate_indexes.includes(i) ? [database`${database.unsafe(x as any)}`] : x)}
                    GROUP BY year, month, liquid_value, deputy_id, deputy_name, name, identifier
                ) subquery
                GROUP BY year, name, identifier
                ORDER BY total DESC
            `.catch(e => {
                console.error(e)
                return {
                    error: QueryHandler.FULL_QUERY_ERROR_LIST[e.code] || "Erro desconhecido."
                }
            })

            const insights = await database`
                SELECT
                    SUM(liquid_value) AS total,
                    AVG(liquid_value) AS average,
                    COUNT(*) AS count,
                    STDDEV_SAMP(liquid_value) AS standard_deviation
                FROM camara_expense
                WHERE
                    ${conditions.flatMap((x, i) => separate_indexes.includes(i) ? [database`${database.unsafe(x as any)}`] : x)}
            `

            const yearly_series = await database`
                SELECT
                    year,
                    SUM(liquid_value) AS total,
                    AVG(liquid_value) AS average,
                    COUNT(*) AS count
                FROM camara_expense
                WHERE
                    ${conditions.flatMap((x, i) => separate_indexes.includes(i) ? [database`${database.unsafe(x as any)}`] : x)}
                GROUP BY year
            `

            if(Array.isArray(suppliers_ranking)) {
                for(const index in suppliers_ranking) {
                    /**
                     * Isso é para corrigir os objetos duplicados, juntando os valores deles para formar o total.
                     * Dá pra fazer direto pelo Postgres? Dá, mas faltou habilidade minha em SQL pra conseguir.
                     * Amaria se alguém conseguisse fazer isso direto na query SQL (:
                     */
                    const spents = suppliers_ranking[index]["spending"]
                    const newSpending = []

                    for(const spent of spents) {
                        const currentSpent = newSpending.find(s => s.deputy_id == spent.deputy_id)

                        if(currentSpent) {
                            const currentSpentIndex = newSpending.findIndex(s => s.deputy_id === spent.deputy_id)
                            const newSpent = {
                                ...currentSpent,
                                spent: currentSpent.spent + spent.spent
                            }

                            newSpending[currentSpentIndex] = newSpent
                        } else {
                            newSpending.push(spent)
                        }
                    }
                    suppliers_ranking[index]["spending"] = newSpending
                }

                for(const index in suppliers_ranking) {
                    const value = suppliers_ranking[index]["spending"]
                    const sortedValue = value.sort((a, b) => b.spent - a.spent)
                    suppliers_ranking[index]["spending"] = sortedValue
                }
            }
            
            resolve({
                expenses: hitsId,
                suppliers: suppliers_ranking,
                insights: insights[0] || {},
                yearly_series: yearly_series
            })
        })
    }

    getYearlySeriesFromHitId(hitId: string) {
        return new Promise(async (resolve, reject) => {
            const data = await database`
                WITH hits AS (
                    SELECT
                        UNNEST(hits) as hit
                    FROM camara_expenses_query_hits
                    WHERE
                        id = ${hitId}
                )
                SELECT
                    year,
                    SUM(liquid_value) AS total,
                    AVERAGE(liquid_value) AS average
                FROM
                    camara_expense
                WHERE
                    id IN (select hit from hits)
                GROUP BY year
                ORDER BY year DESC
            `.catch(e => {
                reject(e)
                return null
            })

            if(!data) {
                return
            }

            resolve(data)
        })
    }
}

export default QueryHandler