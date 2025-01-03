import select, { Separator } from "@inquirer/select";
import logger from "../logger";
import dotenv from "dotenv";

dotenv.config()

export default function execute() {
    const values = ["deputies", "senators", "all"]

    select({
        message: "Qual banco de dados você quer preparar?:",
        choices: [
            {
                name: "Câmara dos Deputados",
                description: "Banco de dados relacionado à câmara dos deputados",
                value: "deputies"
            },
            {
                name: "Senado Federal",
                description: "Banco de dados relacionado ao Senado Federal.",
                value: "senators"
            },
            {
                name: "Auth",
                description: "Banco de dados relacionado às sessões de login.",
                value: "auth"
            },
            {
                name: "FiscalizaJá Full Query",
                description: "Banco de dados relacionado ao FiscalizaJá Full Query",
                value: "full_query"
            },
            {
                name: "Todos",
                description: "Todos os bancos de dados.",
                value: "all"
            }
        ]
    }).then(async (answer) => {
        logger.info("Iniciando preparacao do banco de dados...") // Por que cargas da água não funciona com caracteres utf-8 ?
    
        prepare(answer)
    })
    
    async function prepare(db: string) {
        switch(db) {
            case "deputies":
                logger.info("Preparando banco de dados: Camara dos deputados")
    
                const deputies_db = await import("../services/dadosabertos/camara/database")
                await deputies_db.prepareDB().then(() => {
                    logger.info("Preparacao concluida.")
                    deputies_db.default.end()
                }).catch(e => {
                    logger.error(`Nao foi possivel concluir a preparacao`)
                    logger.error(e)
                    process.exit()
                })
            break
            case "senators":
                logger.info("Preparando banco de dados: Senado Federal")
    
                const senado_db = await import("../services/dadosabertos/senado/database")
    
                await senado_db.prepareDB().then(() => {
                    logger.info("Preparacao concluida.")
                    senado_db.default.end()
                }).catch(e => {
                    logger.error(`Nao foi possivel concluir a preparacao`)
                    logger.error(e)
                    process.exit()
                })
            break
            case "auth":
                const auth_db = await import("../services/auth/database");

                await auth_db.prepareDB().then(() => {
                    logger.info("Preparacao concluida")
                    auth_db.default.end()
                }).catch((e) => {
                    logger.error("Nao foi possivel concluir a preparacao")
                    logger.error(e)
                })
            break
            case "full_query":
                const full_query_db = await import("../services/full_query/database")
                full_query_db.prepareDB().then(() => {
                    logger.info("Preparacao concluida")
                    full_query_db.default.end()
                }).catch((e) => {
                    logger.error("Nao foi possivel concluir a preparacao")
                    logger.error(e)
                }) 
            break
        }
    }
}