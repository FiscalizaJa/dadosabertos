import database from "./database";

import type { ParlamentarianListQuerystring } from "../../../interfaces/ParlamentarianListQuerystring";
import type { ExpensesFilters } from "../../../interfaces/ExpensesFilters";
import type { ExpensesSuppliersFilters } from "../../../interfaces/ExpensesSuppliersFilters";
import type { ExpensesResumeFilter } from "../../../interfaces/ExpensesResumeFilter";
import type { SuppliersTotals } from "../../../interfaces/SuppliersTotals";
import type { FullQuery } from "../../../interfaces/FullQuery";

/**
 * Query handler is a class that own all functions to write queries in database
 */
class QueryHandler {
    static MAX_SENATORS = 512
    static MAX_EXPENSES = 100
    static EXPENSES_KEYS = ["id", "year", "month", "name_parlamentarian", "document_id", "type_document", "subquota", "detail_specification", "supplier", "identifier", "emission_date", "liquid_value", "insert_date", "senator_id"]

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

    getSenators(filter: ParlamentarianListQuerystring = { itens: QueryHandler.MAX_SENATORS, orderby: "name", order: "asc", page: 1}) {
        return new Promise(async (resolve, reject) => {
            filter.itens = Math.min(filter.itens || QueryHandler.MAX_SENATORS, QueryHandler.MAX_SENATORS)
            
            const offset = (filter.page) * filter.itens
    
            const data = await database`
                SELECT * FROM senator
                ORDER BY ${database(filter.orderby)} ${filter.order === "desc" ? database`desc` : database`asc`}
                LIMIT ${filter.itens}
                ${filter.page > 1 ? database`OFFSET ${offset}` : database``}
            `.catch((error) => {
                reject(error)
            })

            resolve(data)
        })
    }

    getSenator(id: number) {
        return new Promise(async (resolve, reject) => {
            const promises = await Promise.all([
                database`
                    SELECT id, name, full_name, gender, party, birth_date, birth_uf, alternate_type, holder_id FROM senator
                    WHERE id = ${id}
                `,
                database`
                    SELECT phone, address, email FROM office
                    WHERE senator_id = ${id}
                `,
            ]).catch(e => reject(e))

            const senator_infos = promises[0]
            const office = promises[1]

            resolve({
                ...senator_infos[0],
                office,
            })
        })
    }

    getSenatorExpenses(id: number, filter: ExpensesFilters) {
        return new Promise(async (resolve, reject) => {
            const date = new Date()

            filter.itens = Math.min(filter.itens || 100, 100)
            filter.year = filter.year || [date.getFullYear()]
            filter.month = filter.month || [(date.getMonth() + 1)]

            const offset = (filter.page * filter.itens) - 1

            const data = await database`
                SELECT * 
                FROM expense 
                WHERE 
                    senator_id = ${id} 
                    AND year IN ${database(filter.year)} AND month IN ${database(filter.month)}
                LIMIT ${filter.itens}
                ${filter.page > 1 ? database`OFFSET ${offset}` : database``}
            `.catch(e => {
                reject(e)
            })

            resolve(data)
        })
    }

    getSpecificExpense(id: number) {
        return new Promise(async (resolve, reject) => {
            const data = await database`
                SELECT *
                FROM expense
                WHERE id = ${id}
            `.catch(e => reject(e))

            resolve(data[0] || null)
        })
    }

    getSenatorExpensesSuppliers(id: number, filter: ExpensesSuppliersFilters) {
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
                FROM expense
                WHERE 
                    senator_id = ${id}
                    AND year IN ${database(filter.year)}
                    AND month IN ${database(filter.month)}
                GROUP BY name, identifier
            `.catch(e => {
                reject(e)
            })

            resolve(data)
        })
    }

    getSenatorExpensesResumeByCategory(id: number, filter: ExpensesResumeFilter) {
        return new Promise(async (resolve, reject) => {
            const date = new Date()

            filter.year = filter.year || [date.getFullYear()]
            filter.month = filter.month || [date.getMonth() + 1]

            const data = await database`
                SELECT 
                    SUM(liquid_value) as total,
                    subquota
                FROM expense
                WHERE 
                    senator_id = ${id}
                    AND year IN ${database(filter.year)}
                    AND month IN ${database(filter.month)}
                GROUP BY subquota
            `.catch(e => {
                reject(e)
            })

            resolve(data)
        })
    }

    getSenatorExpensesResumeByMonth(id: number, filter: ExpensesResumeFilter) {
        return new Promise(async (resolve, reject) => {
            const date = new Date()

            filter.year = filter.year || [date.getFullYear()]
    
            const data = await database`
                SELECT
                    year,
                    month,
                    SUM(liquid_value) AS total
                FROM expense
                WHERE
                    senator_id = ${id}
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
                FROM expenses_total
                WHERE
                    supplier IN ${database(names)}
                    AND month in ${database(filter.month)}
                    ${filter.deputy_id ? database`AND senator_id = ${filter.deputy_id}` : database``}
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
                    senator_name,
                    senator_id
                FROM (
                    SELECT
                        year,
                        month,
                        total,
                        senator_name,
                        senator_id,
                        ROW_NUMBER() OVER (PARTITION BY year ORDER BY total DESC) as rn
                    FROM expenses_total
                    WHERE
                        supplier IN ${database(names)}
                        AND month IN ${database(filter.month)}
                        AND year IN ${database(filter.year)}
                    GROUP BY year, month, total, senator_name, senator_id
                ) subquery
                WHERE rn <= 30
                GROUP BY year, senator_name, senator_id
                ORDER BY total DESC;
            `
            resolve(data)
        })
    }

    getNamesFromIdentifier(identifier: string): Promise<string[]> {
        return new Promise(async (resolve, reject) => {
            const data = await database`
                SELECT name FROM supplier
                WHERE identifier = ${identifier}
            `

            resolve(data.map(d => d.name))
        })
    }

    searchSupplier(query: string) {
        return new Promise(async (resolve, reject) => {
            const data = await database`
                SELECT 
                    MAX(identifier) AS identifier,
                    ARRAY_AGG(name) AS names
                FROM supplier
                WHERE name_vector @@ plainto_tsquery('portuguese', ${query})
                GROUP BY identifier
                LIMIT 15
            `

            resolve(data)
        })
    }

    fullQuery(full_query: FullQuery, limit: number = 150) {
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
            
            const data = await database`
                SELECT * 
                FROM expense
                WHERE
                    ${conditions.flatMap((x, i) => separate_indexes.includes(i) ? [database`${database.unsafe(x as any)}`] : x)}
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
                        'senator_id', senator_id,
                        'senator_name', senator_name,
                        'spent', senator_total
                    )) AS spending
                FROM (
                    SELECT
                        year,
                        month,
                        liquid_value,
                        SUM(liquid_value) AS senator_total,
                        senator_id,
                        name_parlamentarian AS senator_name,
                        supplier AS name,
                        identifier
                    FROM expense
                    WHERE
                        ${conditions.flatMap((x, i) => separate_indexes.includes(i) ? [database`${database.unsafe(x as any)}`] : x)}
                    GROUP BY year, month, liquid_value, senator_id, senator_name, name, identifier
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
                FROM expense
                WHERE
                    ${conditions.flatMap((x, i) => separate_indexes.includes(i) ? [database`${database.unsafe(x as any)}`] : x)}
            `

            const yearly_series = await database`
                SELECT
                    year,
                    SUM(liquid_value) AS total,
                    AVG(liquid_value) AS average,
                    COUNT(*) AS count
                FROM expense
                WHERE
                    ${conditions.flatMap((x, i) => separate_indexes.includes(i) ? [database`${database.unsafe(x as any)}`] : x)}
                GROUP BY year
            `

            if(Array.isArray(suppliers_ranking)) {
                for(const index in suppliers_ranking) {
                    /**
                     * Isso é para corrigir os objetos duplicados, juntando os valores deles para formar o total.
                     * Dá pra fazer direto pelo Postgres? Dá, mas faltou habilidade minha em SQL pra conseguir.
                     */
                    const spents = suppliers_ranking[index]["spending"]
                    const newSpending = []

                    for(const spent of spents) {
                        const currentSpent = newSpending.find(s => s.senator_id == spent.senator_id)

                        if(currentSpent) {
                            const currentSpentIndex = newSpending.findIndex(s => s.senator_id === spent.senator_id)
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
                expenses: data,
                suppliers: suppliers_ranking,
                insights: insights[0] || {},
                yearly_series: yearly_series
            })
        })
    }
}

export default QueryHandler