import sql from "./database";
import genToken from "../../utils/genToken";
import axios from "axios";
import logger from "../../logger";
import type { User } from "../../interfaces/User";

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

    private createSession(access_token: string, expires_at: Date, maskToken: string, user_id: string) {
        return new Promise(async (resolve, reject) => {
            const data = {access_token, expires_at, mask_token: maskToken, user_id}

            await sql`
                INSERT INTO session
                    ${sql(data)}
            `

            resolve(true)
        })
    }

    public findMaskTokenForAccessToken(access_token: string) {
        return new Promise(async (resolve, reject) => {
            const data = await sql`
                SELECT
                    id,
                    mask_token
                FROM session
                WHERE access_token = ${access_token}
            `

            if(data.length > 1) {
                logger.warn("MORE THAN 1 access_token RETURNED FROM mask_token")
            }

            resolve(data[0])
        })
    }

    public createMaskTokenFromAccessToken(access_token: string, refresh_token: string, id: string, expires_at: Date) {
        return new Promise(async (resolve, reject) => {
            const maskToken = genToken("hex", QueryHandler.TOKEN_LENGTH, id)
            await this.createSession(access_token, expires_at, maskToken, id)

            if(refresh_token.length) {
                await sql`
                    UPDATE profile
                        SET refresh_token = ${refresh_token}
                    WHERE id = ${id}
                `
            }

            resolve(maskToken)
        })
    }

    public createUserInDatabase(userData: User & { activated: boolean, refresh_token: string }) {
        const columns = ["id", "email", "name", "avatar_url", "activated", "refresh_token"]
        return new Promise((resolve, reject) => {
            sql.begin(async transaction => {
                const data = await transaction`
                    INSERT INTO profile
                        ${transaction(userData as any, columns)}
                    ON CONFLICT (id) DO UPDATE SET
                        email = EXCLUDED.email,
                        name = EXCLUDED.name,
                        avatar_url = EXCLUDED.avatar_url
                    RETURNING id
                `
                const wrong_ids = data.find(d => d.id != userData.id)

                if(wrong_ids && wrong_ids.length > 0) {
                    throw new Error("wrong_account_updated")
                    // lançar um erro faz o postgres.js dar rollback automaticamente (:
                } else {
                    return data
                }
            }).then((data) => {
                resolve(data)
            }).catch(e => {
                reject(e)
            })
            /**
             * por que "activated" e "refresh_token" não são atualizados?
             * Os dois são propriedades sensíveis que podem ser colocados no momento da criação da conta, mas nunca serão atualizados nessa etapa.
             * Isso é para garantir a integridade do sistema, visto que apenas uma única função pode atualizar esses valores.
             * Resumindo, eles podem ser criados pela etapa para criar a conta do usuário, mas não serão atualizados dinamicamente a cada login, isso é trabalho de outra função específica que será chamada apenas quando necessário.
             */

            /**
             * A cláusula ON CONFLICT apenas vai agir sobre o campo "id" para evitar uma possível atualização indesejada de contas com o mesmo email.
             * Embora duas contas ter o mesmo email seja algo com uma chance baixíssima, é bom estar preparado para tudo. Se isso acontecer aqui, o PostgreSQL vai retornar um erro e não atualizará informações das outras contas com email duplicado.
             */
        })
    }

    public getCompleteSessionFromMaskToken(maskToken: string) {
        return new Promise(async (resolve, reject) => {
            const data = await sql`
                SELECT *
                FROM session
                WHERE mask_token = ${maskToken}
            `

            resolve(data[0] || null)
        })
    }

    public updateMaskTokenAccessToken(maskToken: string, new_access_token: string, expires_at: Date) {
        return new Promise(async (resolve, reject) => {
            await sql`
                UPDATE session
                    SET 
                        access_token = ${new_access_token},
                        expires_at = ${expires_at}
                WHERE mask_token = ${maskToken}
            `
            resolve(true)
        })
    }

    public getAccessTokenFromMaskToken(maskToken: string): Promise<string | null> {
        return new Promise(async (resolve, reject) => {
            const access_token = await sql`
                SELECT
                    access_token
                FROM session
                WHERE mask_token = ${maskToken}
            `
            resolve(access_token[0]?.access_token)
        })
    }

    public getUserInfoFromDatabaseByMaskToken(mask_token: string): Promise<{ data: User, expired: boolean }> {
        return new Promise(async (resolve, reject) => {
            const userid = await sql`
                SELECT
                    user_id,
                    expires_at
                FROM session
                WHERE mask_token = ${mask_token}
                LIMIT 1
            `

            if(!userid || !userid.length) {
                return reject({
                    error: "Usuário não encontrado",
                    code: "user_notfound"
                })
            }

            const data = await sql`
                SELECT 
                    id, 
                    email, 
                    name, 
                    avatar_url 
                FROM profile
                WHERE id = ${userid[0].user_id}    
            `

            return resolve({
                data: data[0] || null,
                expired: new Date() > userid[0]?.expires_at
            })
        })
    }

    public getUserInfoFromDatabaseById(id: string) {
        return new Promise(async (resolve, reject) => {
            const data = await sql`
                SELECT 
                    id, 
                    email, 
                    name, 
                    avatar_url 
                FROM profile
                WHERE id = ${id}    
            `

            return resolve(data[0] || null)
        })
    }

    public getUserRefreshTokenFromDatabaseByid(id: string) {
        return new Promise(async (resolve, reject) => {
            const data = await sql`
                SELECT
                    id,
                    refresh_token
                FROM profile
                WHERE
                    id = ${id}
            `

            return resolve(data[0] || null)
        })
    }

    public deleteMaskToken(maskToken: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await sql`
                DELETE FROM session
                WHERE mask_token = ${maskToken}
            `
            resolve(true)
        })
    }

    public getFreshUserInfoFromMaskToken(maskToken: string) {
        return new Promise(async (resolve, reject) => {
            const access_token = await this.getAccessTokenFromMaskToken(maskToken)
            if(!access_token) {
                return reject("Token inválido")
            }

            axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': "application/json",
                    'User-Agent': "FiscalizaJa Dados Abertos"
                }
            }).then(res => {
                resolve(res.data)
            }).catch(e => {
                reject(e)
            })
        })
    }

    public getFreshUserInfoFromAccess_token(access_token: string) {
        return new Promise(async (resolve, reject) => {
            axios.get("https://www.googleapis.com/oauth2/v2/userinfo", {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                    'Content-Type': "application/json",
                    'User-Agent': "FiscalizaJa Dados Abertos"
                }
            }).then(res => {
                resolve(res.data)
            }).catch(e => {
                reject(e)
            })
        })
    }
}

export default QueryHandler