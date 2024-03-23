import fastify from "fastify";
import LoadPlugins from "./plugins.loader";
import LoadRoutes from "./routes.loader";

import logger from "../logger";

const app = fastify()

async function wrap() {
    const plugins_data = await LoadPlugins(app)
    logger.info(`Loaded ${plugins_data.pluginsLoaded} plugins`)

    const routes_data = await LoadRoutes(app)
    logger.info(`Registered ${routes_data.routesLoaded} routes`)

    app.listen({
        port: Number(process.env.PORT) || 3000,
        host: process.env.HOST || "127.0.0.1"
    }).then((address) => {
        logger.info(`Server running on address ${address}`)
    }).catch(e => logger.error(e))
}

wrap()