import { z } from "zod";

const QuestionSchema = z.object({
    content: z.string().max(550),
    subject_id: z.string(),
    user_id: z.string()
})

const VoteSchema = z.object({
    vote_type: z.number().int().max(1),
    user_id: z.string(),
    question_id: z.string()
})

type Question = z.infer<typeof QuestionSchema>
type Vote = z.infer<typeof VoteSchema>

export type {
    Question,
    Vote
}

export default {
    QuestionSchema,
    VoteSchema
}