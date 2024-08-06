import circuitBreaker, { FastifyCircuitBreakerOptions } from "@fastify/circuit-breaker";

export const options: FastifyCircuitBreakerOptions = {
    threshold: 4,
    timeout: 15000,
    resetTimeout: 2000,
    onCircuitOpen: (req, res) => {
        res.statusCode = 500
        throw new Error("Internal server error")
    },
    onTimeout: (req, res) => {
        res.statusCode = 504
        return "Request timeout, pleasy try again later."
    }
}

export default circuitBreaker