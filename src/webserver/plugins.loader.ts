import type { FastifyInstance } from "fastify";

import fs from "fs/promises";
import path from "node:path";

export default async function LoadPlugins(app: FastifyInstance) {
    const files = await fs.readdir("./src/webserver/plugins")
    
    const dependencies = {} // plugins that depends from others to start
    const ready = []

    for(const file of files) {
        const filename = path.parse(file).name
        const metadata = await import(`./plugins/${filename}`)

        let options = metadata.options

        if(metadata.depends) {           
            let includeAll = true
            for(const depend of metadata.depends) {
                if(!ready.includes(depend)) {
                    includeAll = false
                    break;
                }
            }

            if(!includeAll) {
                dependencies[filename] = {
                    metadata: metadata
                }
                continue; // do not register, all plugins in "depends" need to be ready before the plugin can be registered
            }
        }

        if(typeof metadata.options === "function") {
            options = metadata.options(app)
        } // if options need to be dynamic (ex: use fastify instance)

        await app.register(metadata.default, metadata.options)
        ready.push(filename)
    }

    let dependents_plugins = Object.keys(dependencies)
    let index = 0
    let lastIndex = dependents_plugins.length - 1

    while(Object.keys(dependencies).length > 0) {
        if(index > lastIndex) {
            index = 0 // linear check
        }

        const plugin = dependents_plugins[index]
        const meta = dependencies[plugin]

        let includeAll = true

        for(const pl of meta.metadata.depends) {
            if(!ready.includes(pl)) {
                includeAll = false
                break
            }
        }

        if(includeAll) {
            let options = meta.metadata.options
            if(typeof meta.metadata.options === "function") {
                options = meta.metadata.options(app)
            } // if options need to be dynamic (ex: use fastify instance)
    
            await app.register(meta.metadata.default, meta.metadata.options)
            ready.push(plugin)

            delete dependencies[plugin]
            dependents_plugins = Object.keys(dependencies)
            lastIndex = dependents_plugins.length - 1
        }

        index += 1
    }

    return { pluginsLoaded: files.length }
}

function findDependency(dependencies: any, dependency_to_find: string) {
    const keys = Object.keys(dependencies)

    const dependencies_reach = []

    for(const dependency of keys) {
        if(dependencies[dependency].find(d => d === dependency_to_find)) {
            dependencies_reach.push(dependency)
        }
    }

    return dependencies_reach
}