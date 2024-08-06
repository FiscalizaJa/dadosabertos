import type { FastifyRequest, FastifyReply } from "fastify";
import Auth from "../../services/auth/queryHandler";
import Questions from "../../services/open_questions/queryHandler";
import Senado from "../../services/dadosabertos/senado/queryHandler";
import Camara from "../../services/dadosabertos/camara/queryHandler";

import { Question } from "../../interfaces/Question";

const questions = new Questions()
const senado = new Senado()
const camara = new Camara()

const ACCEPTED_ID_TYPES = ["senator_expense", "deputy_expense"]

async function CreateQuestion(req: FastifyRequest, res: FastifyReply) {
    const user = req.user    
    const body = req.body as Question
    body.user_id = user.id

    const type_id = body.subject_id.split("-")[0]

    if(!type_id || !ACCEPTED_ID_TYPES.includes(type_id)) {
        return res.status(400).send({
            error: `Tipo de ID inválido. Tipos aceitos: ${ACCEPTED_ID_TYPES.join(", ")}`,
            code: "invalid_id_type"
        })
    }

    const subject_id = body.subject_id.split("-")[1]

    let expense_data = null

    if(type_id === "senator_expense") {
        expense_data = await senado.getSpecificExpense(Number(subject_id) || -1)
    } else if (type_id === "deputy_expense") {
        expense_data = await camara.getSpecificExpense(Number(subject_id || -1))
    }

    if(!expense_data) {
        return res.status(400).send({
            error: "subject_id não encontrado.",
            code: "subject_notfound"
        })
    }

    await questions.createQuestion(body).then(result => {
        if(result === true) {
            return res.status(201).send({
                message: "Questionamento criado."
            })
        }
    }).catch(error => {
        if(error.code === "23505") {
            return res.status(400).send({
                error: "Você já fez um questionamento no post.",
                code: "already_has_question"
            })
        }
    })
}

async function GetQuestions(req: FastifyRequest, res: FastifyReply) {
    const query = req.query as { subject_id: string[] }

    const valid_ids = []
    for(const subject_id of query.subject_id) {
        const type_id = subject_id.split("-")[0]

        if(!type_id || !ACCEPTED_ID_TYPES.includes(type_id)) {
            continue
        }
    
        valid_ids.push(subject_id)
    }

    const all_questions = await questions.getQuestionsInSubject(valid_ids)
    return {
        data: all_questions
    }
}

function CreateQuestionVote(req: FastifyRequest, res: FastifyReply) {
    const user = req.user
    const body = req.body as { vote_type: number }
    const params = req.params as { id: number }

    questions.createQuestionVote(params.id, body.vote_type, user.id).then((data) => {
        if(data === true) {
            return res.status(201).send({
                message: "Voto criado."
            })
        }
    }).catch(error => {
        if(error.code === "23503") {
            return res.status(404).send({
                error: "Questionamento não encontrado",
                code: "question_notfound"
            })
        } else {
            console.error(error)
            return res.status(400).send({
                error: "Aconteceu um erro inesperado ao completar a request",
                code: "unexpected_error"
            })
        }
    })
}

export default {
    CreateQuestion,
    GetQuestions,
    CreateQuestionVote
}