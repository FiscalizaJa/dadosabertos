import type { FastifyInstance } from "fastify";

import fs from "node:fs/promises";
import path from "node:path";

export default async function LoadSchemas(app: FastifyInstance) {
    const files = await fs.readdir("./src/webserver/schemas")

    let totalSchemas = 0

    for(const file of files) {
        const filename = path.parse(file).name
        const metadata = await import(`./schemas/${filename}`)

       app.addSchema(metadata.default)
       totalSchemas += 1
    }

    return { schemasLoaded: totalSchemas }
}