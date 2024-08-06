import { Queue, QueueEvents } from "bullmq";
import ioredis from "ioredis";
import dotenv from "dotenv";

dotenv.config()

const queue = new Queue("full_query", {
    connection: new ioredis(process.env.FISCALIZAJA_REDIS_URL, { maxRetriesPerRequest: null })
})

const events = new QueueEvents("full_query", {
    connection: new ioredis(process.env.FISCALIZAJA_REDIS_URL, { maxRetriesPerRequest: null })
})

events.on("completed", async (job) => {
    const callbacks = global.jobs_callback[job.jobId]
    if(!callbacks) {
        return;
    }
    for(const callback of callbacks) {
        callback()
    }
    
    delete global.jobs_callback[job.jobId]
})

export default queue