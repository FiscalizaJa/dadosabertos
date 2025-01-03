import sql from "./database";
import type { User } from "../../interfaces/User";
import { Except } from "type-fest";
import postgres from "postgres";

class QueryHandler {
    static TOKEN_LENGTH = 10
    static REFRESH_TOKEN_TTL = 1296000

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

    public activateAccountByActivationToken(activation_token: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await sql`
                UPDATE users
                SET 
                    activated = TRUE,
                    activation_token = NULL
                WHERE
                    activation_token = ${activation_token}
                RETURNING id

            `.then((data) => (data?.length || 0) > 0).catch(e => reject(e))
        })
    }
    public createUserInDatabase(userData: Except<User, "id">) {
        const columns = ["email", "name", "password", "activated", "activation_token"]
        return new Promise((resolve, reject) => {
            sql.begin(async transaction => {
                const data = await transaction`
                    INSERT INTO users
                        ${transaction(userData as any, columns)}
                `

                return data
            }).then((data) => {
                resolve(data)
            }).catch(e => {
                reject(e)
            })
        })
    }

    public getUserInfoFromDatabaseById(id: string): Promise<User> {
        return new Promise(async (resolve, reject) => {
            const data: postgres.RowList<User[]> = await sql`
                SELECT 
                    id, 
                    email, 
                    name,
                    password,
                    activated
                FROM users
                WHERE id = ${id}    
            `

            return resolve(data[0] || null)
        })
    }

    public getUserInfoFromDatabaseByEmail(email: string): Promise<User> {
        return new Promise(async (resolve, reject) => {
            const data: postgres.RowList<User[]> = await sql`
                SELECT 
                    id, 
                    email, 
                    name,
                    password,
                    activated
                FROM users
                WHERE email = ${email}    
            `

            return resolve(data[0] || null)
        })
    }
}

export default QueryHandler