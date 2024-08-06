import scalar from "@scalar/fastify-api-reference";
import { FastifyInstance } from "fastify";

export const depends = ["swagger"]

export const options = {
    routePrefix: "/docs",
    configuration: {
        theme: "bluePlanet",
        metaData: {
            title: "Documentação da API do FiscalizaJá",
            description: "Bem-vindo a documentação da API do FiscalizaJá. Aqui estão todas descrições sobre os endpoints, bem como seus parâmetros e querystrings."
        }
    }
}

export default scalar