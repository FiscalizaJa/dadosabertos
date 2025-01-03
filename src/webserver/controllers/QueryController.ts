import type { FastifyRequest, FastifyReply } from "fastify";

import { FullQuery } from "../../interfaces/FullQuery";
import Queue from "../../services/full_query/queue/Queue";
import { WebSocket } from "@fastify/websocket";
import CamaraQueryHandler from "../../services/dadosabertos/camara/queryHandler";
import SenadoQueryHandler from "../../services/dadosabertos/senado/queryHandler";
import FullQueryHanlder, { HouseExpenses } from "../../services/full_query/queryHandler";

const fullquery = new FullQueryHanlder();

async function CreateQueryExpenses(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as { target: string }
    const body = req.body as FullQuery[]
    const user = req.user

    const invalid_properties = body.map(q => {
        if(q.property !== undefined) {
            if(query.target === "camara") {
                return CamaraQueryHandler.EXPENSE_KEYS.includes(q.property) ? null : q.property
            } else if(query.target === "senado") {
                return SenadoQueryHandler.EXPENSES_KEYS.includes(q.property) ? null : q.property
            }
        } else {
            return null
        }
    }).filter(q => q)

    if(invalid_properties.length > 0) {
        return res.status(400).send({
            error: `Propriedade(s) inválidas: ${invalid_properties.join(",")}`,
            code: "invalid_props"
        })
    }

    const workers = await Queue.getWorkers()

    if(workers.length <= 0) {
        return res.status(503).send({
            error: "No momento, nossos servidores não podem processar nenhuma consulta, tente novamente mais tarde.",
            code: "no_workers_available"
        })
    }

    const jobs = await Queue.getJobs(['active', 'waiting'])

    let already_have_query = false

    for (const job of jobs) {
        const user_id = job.name.split("-")[2]
        if(user_id === user.id) {
            already_have_query = true
            break;
        }
    }

    if(already_have_query) {
        return res.status(429).send({
            error: "Existe uma consulta sua em processamento ou na fila, por favor, aguarde.",
            code: "too_many_queries"
        })
    }

    const job_data = await Queue.add(`process-query-${user.id}`,
    { 
        target: [query.target],
        query: body,
        info: {
            author_id: user.id
        }
    },
    {
        attempts: 0
    })

    return {
        message: "Consulta criada no banco de dados.",
        job_id: job_data.id
    }
}

async function GetQueryExpenses(req: FastifyRequest, res: FastifyReply) {
    const params = req.params as { job: string }
    const query = req.query as {
        expenses_items: number,
        expenses_page: number,
        suppliers_items: number,
        suppliers_page: number,
        include_series: string[],
        target: string
    }

    const target = query.target.toLowerCase() === "camara" ? HouseExpenses.Camara : HouseExpenses.Senado

    const query_result = await fullquery.getResultById(Number(params.job), {
        expenses: {
            items: query.expenses_items,
            page: query.expenses_page
        },
        suppliers: {
            items: query.suppliers_items,
            page: query.suppliers_page
        }
    }, query.include_series || [], target) as any

    if(!query_result) {
        return res.status(404).send({
            data: null
        })
    } // CONTINUAR O SERIES

    return res.status(200).send({
        data: {
            [query_result.target]: {
                insights: query_result.insights,
                suppliers: query_result.suppliers,
                expenses: query_result.expenses,
                series: query_result.series
            }
        }
    })
}

async function ListenJobCompletions(socket: WebSocket, req: FastifyRequest) {
    const params = req.params as { job: string }
    const job = await Queue.getJob(params.job)

    if(!job) {
        socket.send("Unknown job")
        return socket.terminate()
    }

    const state = await job.getState()
    if(state !== "waiting") {
        if(state === "completed") {
            socket.send("Completed")
            return socket.terminate()
        } else if (state === "delayed") {
            socket.send("Delayed")
        } else if (state === "active") {
            socket.send("Processing")
        } else {
            socket.send("Unknown job")
            return socket.terminate()
        }
    }

    if(!global.jobs_callback[params.job]) {
        global.jobs_callback[params.job] = []
    }

    const callback = () => {
        socket.send("Completed")
        socket.terminate()
    }

    global.jobs_callback[params.job].push(callback)
}

async function ViewJob(req: FastifyRequest, res: FastifyReply) {
    const user = req.user
    const params: { job: number } = req.params as any

    if(!user) {
        return res.status(401).send({
            error: "Você precisa estar logado para marcar um resultado como visto.",
            code: "unhautorized"
        })
    }

    await fullquery.viewResult(params.job).then(() => {
        return res.status(200).send({
            message: "OK"
        })
    }).catch(e => {
        return res.status(422).send({
            message: "Resultado não existe.",
            error: "not_found"
        })
    })
}

export default {
    CreateQueryExpenses,
    GetQueryExpenses,
    ListenJobCompletions,
    ViewJob
}