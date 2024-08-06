import { Worker } from "bullmq";
import ioredis from "ioredis";
import dotenv from "dotenv";
import { FullQuery } from "../../../interfaces/FullQuery";
import FullQueryHandler from "../queryHandler";

import CamaraHandler from "../../dadosabertos/camara/queryHandler";
import SenadoHandler from "../../dadosabertos/senado/queryHandler";

dotenv.config()

const camara = new CamaraHandler()
const senado = new SenadoHandler()
const fullquery = new FullQueryHandler()

const worker = new Worker("full_query", (job) => {
    return new Promise(async (resolve, reject) => {
        const data = job.data as { target: string[], info: { author_id: string, target: string }, query: FullQuery }
        const result = {
            camara: {},
            senado: {}
        } as any
        const percentage_per_result = 100 / data.target.length
    
        let progress = 0
    
        if(data.target.includes("camara")) {
            data.info.target = "camara"
            const query_return = await camara.fullQuery(data.query)
            result["camara"] = query_return
            
            result.camara.id = job.id
            progress += percentage_per_result
        }
    
        if(data.target.includes("senado")) {
            data.info.target = "senado"
            const query_return = await senado.fullQuery(data.query)
            result["senado"] = query_return
            
            result.senado.id = job.id
        }
        
        await fullquery.saveResult(result[data.info.target] as any, data.info)
        resolve(result)
    })
}, {
    connection: new ioredis(process.env.FISCALIZAJA_REDIS_URL, { maxRetriesPerRequest: null }),
    limiter: {
        duration: 2000,
        max: 2
    },
    removeOnComplete: {
        count: 0
    },
    removeOnFail: {
        age: 86400,
        count: 1000
    },
    concurrency: 2,
    autorun: false,
})

worker.run()

console.log("WORKER STARTED")