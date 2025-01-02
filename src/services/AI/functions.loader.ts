import fs from "fs/promises";
import path from "node:path"

export default async function loadFunctions() {
    const files = await fs.readdir("./src/services/AI/functions")
    
    const functions: {[key: string]: () => unknown} = {}

    for(const file of files) {
        const filename = path.parse(file)
        
        if(![".js", ".ts"].includes(filename.ext)) {
            continue;
        } else {
            const importing = await import(`./functions/${filename.name}`)
            functions[filename.name] = importing.default
        }
    }

    return functions
}