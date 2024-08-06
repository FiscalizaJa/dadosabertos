import type { User } from "./interfaces/User"

declare module "fastify" {
    interface FastifyInstance {
        googleOauth2: any,
        blockingOperations: number
    }
    interface FastifyRequest {
        user?: User,
        invalid_ws?: boolean
    }
    interface FastifyContextConfig {
        useGuard?: boolean
    }
}

type callback = () => void
declare global {
    var jobs_callback: { [key: string]: callback[] }
}

export default undefined