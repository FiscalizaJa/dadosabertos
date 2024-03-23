import type { FastifyInstance } from "fastify";

import fs from "fs/promises";
import path from "node:path";

export default async function LoadPlugins(app: FastifyInstance) {
    const files = await fs.readdir("./src/webserver/plugins")
    
    for(const file of files) {
        const filename = path.parse(file).name
        const metadata = await import(`./plugins/${filename}`)

        app.register(metadata.default, metadata.options)
    }

    return { pluginsLoaded: files.length }
}