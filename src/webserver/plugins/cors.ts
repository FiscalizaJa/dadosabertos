import cors, { FastifyCorsOptions } from "@fastify/cors";

export const options: FastifyCorsOptions = {
    origin: "*",
    methods: "GET" // purpose of API is only serve data, don't modify or create
}

export default cors