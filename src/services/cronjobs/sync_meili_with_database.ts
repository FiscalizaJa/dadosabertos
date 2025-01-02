import cron from "node-cron";
import { syncAll } from "../meilisearch/loader";
import config from "./config.json";

const EXPRESSION = config.sync_meili_with_database.cron_expression

const task = cron.schedule(EXPRESSION, async () => {
    syncAll()
}, {
    scheduled: false,
    timezone: "America/Sao_Paulo",
    runOnInit: false
})

export default task