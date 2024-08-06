import type { FastifyRequest, FastifyReply } from "fastify";
import queue from "../../services/full_query/queue/Queue";
import AuthQueryHandler from "../../services/auth/queryHandler";
import CamaraQueryHandler from "../../services/dadosabertos/camara/queryHandler";
import SenadoQueryHandler from "../../services/dadosabertos/senado/queryHandler";
import FullQueryHandler from "../../services/full_query/queryHandler";
import OpenQuestionsQueryHanlder from "../../services/open_questions/queryHandler";

const auth = new AuthQueryHandler()
const camara = new CamaraQueryHandler()
const senado = new SenadoQueryHandler()
const fullquery = new FullQueryHandler()
const open_questions = new OpenQuestionsQueryHanlder()

async function SendHelloWorld(req: FastifyRequest, res: FastifyReply) {
    const workers = await queue.getWorkers()
    const stats = await Promise.all([
        auth.getStat(),
        camara.getStat(),
        senado.getStat(),
        fullquery.getStat(),
        open_questions.getStat()
    ])

    const auth_stats = stats[0]
    const camara_stats = stats[1]
    const senado_stats = stats[2]
    const fullquery_stats = stats[3] as any
    const open_questions_stats = stats[4]

    res.status(200).send({
        hello: "world!",
        message: "Bem-vindo aos dados abertos do FiscalizaJá. Você está no endpoint principal, aqui há alguns dados sobre o estado da API. Caso queira ver a documentação, vá para /docs ou /docs/swagger.",
        health: {
            auth: auth_stats,
            camara: camara_stats,
            senado: senado_stats,
            full_query: {
                ...fullquery_stats,
                workers_online: workers.length
            },
            open_questions: open_questions_stats
        }
    })
}

export default {
    SendHelloWorld
}