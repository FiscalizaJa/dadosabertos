import type { FastifyInstance } from "fastify";

import fs from "node:fs/promises";
import path from "node:path";

export default async function LoadRoutes(app: FastifyInstance) {
    const files = await fs.readdir("./src/webserver/routes")

    let totalRoutes = 0

    for(const file of files) {
        const filename = path.parse(file).name
        const metadata = await import(`./routes/${filename}`)

        await app.register((app, _, done) => {
            for(const route of metadata.default) {
                app.route(route)
                totalRoutes += 1
                console.log("ola")
            }
            done()
        }, {
            prefix: metadata.prefix || "/"
        })
    }

    return { routesLoaded: totalRoutes }
}