import select, { Separator } from "@inquirer/select";
import logger from "./src/logger";
import dotenv from "dotenv";

dotenv.config()

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
            logger.warn("Se houver ja tabelas com os mesmos nomes, a operacao ira falhar")

            const db = await import("./src/dadosabertos/camara/database")
            await db.prepareDB().then(() => {
                logger.info("Preparacao concluida.")
                db.default.end()
            }).catch(e => {
                logger.error(`Nao foi possivel concluir a preparacao`)
                logger.error(e)
                process.exit()
            })
        break
    }
}