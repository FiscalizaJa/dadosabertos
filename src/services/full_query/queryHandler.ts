import sql from "./database";
import CamaraQueryHandler from "../dadosabertos/camara/queryHandler";
import SenadoQueryHandler from "../dadosabertos/senado/queryHandler";

const camara = new CamaraQueryHandler()
const senado = new SenadoQueryHandler()

enum HouseExpenses {
    Camara = 1,
    Senado
}

class QueryHandler {
    static CHART_LIST = ["yearly"]
    constructor() {}

    public getStat() {
        return new Promise((resolve, reject) => {
            sql`
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

    saveResult(data: { expenses: any, insights: any, suppliers: any, id: number }, info: { target: string, author_id: string }) {
        return new Promise((resolve, reject) => {
            const write_data = {
                id: data.id,
                target: info.target,
                made_at: new Date(),
                last_view: new Date(),
                author_id: info.author_id,
                expenses: data.expenses,
                insights: data.insights,
                suppliers: data.suppliers
            }

            sql`
                INSERT INTO full_query_query_result ${sql(write_data)}
            `.then(() => {
                resolve(true)
            }).catch((e) => {
                console.error(e)
                reject(e)
            })
        })
    }

    viewResult(id: number) {
        return new Promise((resolve, reject) => {
            sql`
                UPDATE full_query_query_result
                SET
                    last_view = ${new Date()}
                WHERE
                    id = ${id}
            `.then(() => {
                resolve(true)
            }).catch(e => {
                reject(e)
            })
        })
    }

    deleteOldResults() {
        return new Promise((resolve, reject) => {
            sql`
                DELETE FROM full_query_query_result
                WHERE
                    last_view < NOW() - INTERVAL '1 hour'
            `.then(() => {
                resolve(true)
            }).catch(e => {
                reject(e)
            })
        })
    }

    getResultById(
        id: number,
        pagination: {
            expenses: {
                items: number,
                page: number
            },
            suppliers: {
                items: number,
                page: number
            }
        },
        charts: string[] = [],
        house: HouseExpenses
    ) {
        return new Promise(async (resolve, reject) => {
            const expenses_items = Math.min((pagination.expenses.items || 1000), 1000)
            const expenses_page = pagination.expenses.page

            const suppliers_items = Math.min((pagination.suppliers.items || 1000), 1000)
            const suppliers_offset = pagination.suppliers.items * (pagination.suppliers.page - 1)
            const suppliers_page = pagination.suppliers.page

            const query_metadata = await sql<{ expenses: number[] }[]>`
                SELECT
                    expenses,
                    target
                FROM full_query_query_result
                WHERE
                    id = ${id}
            `.catch(e => {
                reject(e)
                return null
            })

            if(!query_metadata) {
                return;
            }

            let expenses_json = []
            switch(query_metadata[0].target) {
                case "camara":
                    expenses_json = await camara.getExpensesByHitId(query_metadata[0].expenses, expenses_page, expenses_items) as any[]
                case "senado":
                    expenses_json = await senado.getExpensesByHitId(query_metadata[0].expenses, expenses_page, expenses_items) as any[]
            }

            //const expenses_json = house === HouseExpenses.Camara ? await camara.getExpensesByIds(ids, expenses_page, expenses_items) : senado.getExpensesByIds(ids, expenses_page, expenses_items)

            const data = await sql`
                WITH info AS (
                    SELECT
                        id,
                        target,
                        made_at,
                        author_id
                    FROM full_query_query_result
                    WHERE
                        id = ${id}
                ),
                suppliers_json AS (
                    SELECT
                        id,
                        jsonb_agg(suppliers) AS suppliers
                    FROM (
                        SELECT
                            id,
                            JSONB_ARRAY_ELEMENTS(suppliers) AS suppliers
                        FROM full_query_query_result
                        WHERE
                            id = ${id}
                        LIMIT ${suppliers_items} ${suppliers_page > 1 ? sql`OFFSET ${suppliers_offset}` : sql``}
                    ) subquery
                    GROUP BY id
                ),
                insights_json AS (
                    SELECT
                        id,
                        insights
                    FROM full_query_query_result
                    WHERE
                        id = ${id}
                )
                SELECT
                    info.id,
                    info.target,
                    info.made_at,
                    info.author_id,
                    suppliers_json.suppliers,
                    insights_json.insights
                FROM
                    info
                    LEFT JOIN suppliers_json ON info.id = suppliers_json.id
                    LEFT JOIN insights_json ON info.id = insights_json.id
            `.catch(e => {
                reject(e)
                return {}
            })

            if(data[0]) {
                data[0].expenses = expenses_json
            }

            const series = {}

            if(charts.includes("yearly")) {
                const data = query_metadata[0].target === "camara" ? await camara.getYearlySeriesFromHitId(query_metadata[0].expenses) : await senado.getYearlySeriesFromHitId(query_metadata[0].expenses)

                Object.defineProperty(series, "yearly", {
                    value: data[0]?.yearly_total || null,
                    enumerable: true,
                    configurable: true,
                    writable: true
                })
            }

            resolve(data[0] ? {...data[0], series} : null)
        })
    }
}

export default QueryHandler
export {
    HouseExpenses
}