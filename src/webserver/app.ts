import fastify from "fastify";
import LoadPlugins from "./plugins.loader";
import LoadRoutes from "./routes.loader";

import logger from "../logger";
import LoadSchemas from "./schemas.loader";

import update_camara_expenses from "../services/cronjobs/update_camara_expenses";
import update_senado_expenses from "../services/cronjobs/update_senado_expenses";
import clear_non_viewed_results from "../services/cronjobs/clear_non_viewed_results";

async function wrap(listen: boolean = true) {
    const app = fastify()

    const plugins_data = await LoadPlugins(app)
    logger.info(`Loaded ${plugins_data.pluginsLoaded} plugins`)

    const routes_data = await LoadRoutes(app)
    logger.info(`Registered ${routes_data.routesLoaded} routes`)

    const schemas_data = await LoadSchemas(app)
    logger.info(`Registered ${schemas_data.schemasLoaded} schemas`)

    if(listen) {
        update_camara_expenses.start()
        update_senado_expenses.start()
        clear_non_viewed_results.start()

        global.jobs_callback = {}

        app.listen({
            port: Number(process.env.PORT) || 3000,
            host: process.env.HOST || "127.0.0.1"
        }).then((address) => {
            logger.info(`Server running on address ${address}`)
        }).catch(e => logger.error(e))
    }

    return app
}

if (require.main === module) {
    wrap()
} else {
    console.log("WARNING: Webserver instance imported as module.")
}

export default wrap