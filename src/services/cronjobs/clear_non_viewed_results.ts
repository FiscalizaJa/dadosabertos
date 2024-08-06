import cron from "node-cron";
import FullQuery from "../full_query/queryHandler";
import config from "./config.json";

const fullquery = new FullQuery()

const EXPRESSION = config.clear_non_viewed_results.cron_expression

const task = cron.schedule(EXPRESSION, async () => {
    const result = await fullquery.deleteOldResults()
}, {
    scheduled: true,
    timezone: "America/Sao_Paulo",
    runOnInit: false
})

export default task