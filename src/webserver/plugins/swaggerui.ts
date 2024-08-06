import swagger, { FastifySwaggerUiOptions } from "@fastify/swagger-ui";

export const depends = ["swagger"]

export const options: FastifySwaggerUiOptions = {
    routePrefix: "/docs/swagger"
}

export default swagger