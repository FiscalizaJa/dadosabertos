import cron from "node-cron";
import loader from "../dadosabertos/senado/loader";
import config from "./config.json";

const EXPRESSION = config.update_senado_expenses.cron_expression

const task = cron.schedule(EXPRESSION, () => {
    const year = new Date().getFullYear() - 1
    loader.downloadExpensesStartingFromYear(year)
}, {
    scheduled: false,
    timezone: "America/Sao_Paulo",
    runOnInit: false
})

export default task