import type { FastifyRequest, FastifyReply } from "fastify";

async function SendHelloWorld(req: FastifyRequest, res: FastifyReply) {
    res.status(200).send({
        hello: "world!",
        message: "Bem-vindo aos dados abertos do FiscalizaJá. Você está no endpoint principal, não tem nada aqui, mas pode ver tudo na documentação em /docs"
    })
}

export default {
    SendHelloWorld
}