import sql from "./database";

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
                INSERT INTO query_result ${sql(write_data)}
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
                UPDATE query_result
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
                DELETE FROM query_result
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
        charts: string[] = []
    ) {
        return new Promise(async (resolve, reject) => {
            const expenses_items = Math.min((pagination.expenses.items || 1000), 1000)
            const expenses_offset = pagination.expenses.items * (pagination.expenses.page - 1)
            const expenses_page = pagination.expenses.page

            const suppliers_items = Math.min((pagination.suppliers.items || 1000), 1000)
            const suppliers_offset = pagination.suppliers.items * (pagination.suppliers.page - 1)
            const suppliers_page = pagination.suppliers.page

            const data = await sql`
                WITH info AS (
                    SELECT
                        id,
                        target,
                        made_at,
                        author_id
                    FROM query_result
                    WHERE
                        id = ${id}
                ),
                expenses_json AS (
                    SELECT
                        id,
                        jsonb_agg(expenses) AS expenses
                    FROM (
                        SELECT
                            id,
                            JSONB_ARRAY_ELEMENTS(expenses) AS expenses
                        FROM query_result
                        WHERE 
                            id = ${id}
                        LIMIT ${expenses_items} ${expenses_page > 1 ? sql`OFFSET ${expenses_offset}` : sql``}
                    ) subquery
                    GROUP BY id
                ),
                suppliers_json AS (
                    SELECT
                        id,
                        jsonb_agg(suppliers) AS suppliers
                    FROM (
                        SELECT
                            id,
                            JSONB_ARRAY_ELEMENTS(suppliers) AS suppliers
                        FROM query_result
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
                    FROM query_result
                    WHERE
                        id = ${id}
                )
                SELECT
                    info.id,
                    info.target,
                    info.made_at,
                    info.author_id,
                    expenses_json.expenses,
                    suppliers_json.suppliers,
                    insights_json.insights
                FROM
                    info
                    LEFT JOIN expenses_json ON info.id = expenses_json.id
                    LEFT JOIN suppliers_json ON info.id = suppliers_json.id
                    LEFT JOIN insights_json ON info.id = insights_json.id
            `.catch(e => {
                reject(e)
                return {}
            })

            const series = {}

            if(charts.includes("yearly")) {
                const data = await sql`
                    SELECT
                        JSONB_AGG(yearly_totals.obj) AS yearly_total
                    FROM (
                        SELECT
                            JSONB_BUILD_OBJECT(
                                'year', json_element->>'year',
                                'total', SUM((json_element->>'liquid_value')::DECIMAL(10, 2)),
                                'average', AVG((json_element->>'liquid_value')::DECIMAL(10, 2))
                            ) AS obj
                        FROM (
                            SELECT
                                JSONB_ARRAY_ELEMENTS(expenses) AS json_element
                            FROM query_result
                            WHERE
                                id = ${id}
                        ) AS expanded_json_elements
                        GROUP BY json_element->>'year'
                        ORDER BY json_element->>'year' DESC
                    ) AS yearly_totals
                `.catch(e => {
                    reject(e)
                    return []
                })

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