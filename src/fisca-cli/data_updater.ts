import select, { Separator } from "@inquirer/select";
import logger from "../logger";
import dotenv from "dotenv";

import camara_loader from "../services/dadosabertos/camara/loader";
import senado_loader from "../services/dadosabertos/senado/loader";
import { syncAll } from "../services/meilisearch/loader";

dotenv.config()

export default function execute() {
    const values = ["deputies", "senators", "all"]

    select({
        message: "Qual banco de dados você quer atualizar?:",
        choices: [
            {
                name: "Câmara dos Deputados",
                description: "Banco de dados relacionado à câmara dos deputados.",
                value: "deputies"
            },
            {
                name: "Senado Federal",
                description: "Banco de dados relacionado ao Senado Federal.",
                value: "senators"
            },
            {
                name: "Motor de pesquisa",
                description: "Sincronizar os dados do motor de pesquisa com todos os bancos de dados.",
                value: "search"
            }
        ]
    }).then(async (answer) => {
        await first_quest(answer)
    })
    
    async function first_quest(db: string) {
        switch(db) {
            case "deputies":
                select({
                    message: "Quais dados você quer atualizar?",
                    choices: [
                        {
                            name: "Deputados",
                            description: "Deputados em exercicio na camara dos deputados.",
                            value: "deputies"
                        },
                        {
                            name: "Despesas com a cota parlamentar",
                            description: "Reembolsos solicitados por deputados em exercicio fazendo uso da cota parlamentar.",
                            value: "deputies_expenses"
                        }
                    ]
                }).then((answer) => {
                    second_quest(answer)
                })
                break
            case "senators":
                select({
                    message: "Quais dados você quer atualizar?",
                    choices: [
                        {
                            name: "Senadores",
                            description: "Senadores em exercicio no Senado Federal.",
                            value: "senators"
                        },
                        {
                            name: "Despesas com a cota parlamentar",
                            description: "Reembolsos solicitados por senadores em exercicio fazendo uso da cota parlamentar.",
                            value: "senators_expenses"
                        }
                    ]
                }).then((answer) => {
                    second_quest(answer)
                })
            break
            case "search":
                await syncAll()
                process.exit()
            break
        }
    }

    async function second_quest(answer: string) {
        switch(answer) {
            case "deputies":
                await camara_loader.saveDeputies()
                break
            case "deputies_expenses":
                await camara_loader.downloadExpensesStartingFromYear(2009)
                break
            case "senators":
                await senado_loader.save_senators()
                break
            case "senators_expenses":
                await senado_loader.downloadExpensesStartingFromYear(2010)
                break
        }
    }
}