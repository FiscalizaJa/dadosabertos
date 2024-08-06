import select, { Separator } from "@inquirer/select";
import logger from "./src/logger";
import dotenv from "dotenv";

import db_preparer from "./src/fisca-cli/database_preparer";
import db_updater from "./src/fisca-cli/data_updater"

dotenv.config()

select({
    message: "O que você quer fazer?:",
    choices: [
        {
            name: "Preparar bancos de dados",
            description: "Preparar bancos de dados dos respectivos orgãos cobertos pelo fiscalizaja.",
            value: "prepare_db"
        },
        {
            name: "Atualizar bancos de dados",
            description: "Atualizar dados dos respectivos bancos de dados.",
            value: "update_data"
        },
        {
            name: "Todos",
            description: "Todos os bancos de dados.",
            value: "all"
        }
    ]
}).then(async (answer) => {
    execute(answer)
})

async function execute(db: string) {
    switch(db) {
        case "prepare_db":
            db_preparer()
        break
        case "update_data":
            db_updater()
        break;
    }
}