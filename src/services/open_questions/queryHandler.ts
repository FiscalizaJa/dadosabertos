import type { Question } from "../../interfaces/Question";
import sql from "./database";

class QueryHandler {
    constructor() {}

    public getStat() {
        return new Promise((resolve, reject) => {
            sql`
                SELECT (
                    SELECT
                        COUNT(*)
                    FROM pg_stat_activity
                    WHERE
                        state = 'active'
                )::NUMERIC - 1 AS active_queries;
            `.then(data => resolve(data[0])).catch(e => {
                resolve({ active_queries: -1 })
            })
        })
    }

    public createQuestion(questionData: Question) {
        return new Promise((resolve, reject) => {
            sql`
                INSERT INTO question ${sql(questionData)}
            `.then(() => resolve(true)).catch(e => reject(e))
        })
    }

    public createQuestionVote(question_id: number, vote_type: number, user_id: string) {
        return new Promise((resolve, reject) => {
            const insertion_data = {
                question_id,
                vote_type,
                user_id
            }

            sql`
                INSERT INTO vote ${sql(insertion_data)}
                ON CONFLICT (user_id, question_id) DO
                    UPDATE 
                    SET vote_type = ${vote_type}
            `.then(() => resolve(true)).catch(e => reject(e))
        })
    }

    public getQuestionsInSubject(subject_ids: string[]) {
        return new Promise((resolve, reject) => {
            sql`
                SELECT
                    q.id,
                    q.subject_id,
                    q.content,
                    q.user_id,
                    COALESCE(v.positive, 0) - COALESCE(v.negative, 0) as total_votes
                FROM question q
                LEFT JOIN (
                    SELECT
                        v.question_id,
                        COUNT(*) FILTER (WHERE vote_type = 0) AS positive,
                        COUNT(*) FILTER (WHERE vote_type = 1) AS negative
                    FROM vote v
                    GROUP BY v.question_id
                ) v ON q.id = v.question_id
                WHERE q.subject_id IN ${sql(subject_ids)}
            `.then(data => {
                return resolve(data)
            }).catch(e => reject(e))
        })
    }

    public getQuestionVoteCount(question_id: number) {
        return new Promise((resolve, reject) => {
            sql`
                SELECT
                    COUNT(*) AS positive,
                    COUNT(*) FILTER (WHERE vote_type = 1) AS negative
                FROM vote
                WHERE question_id = ${question_id}
            `.then(data => {
                const positive = data[0]?.positive || 0
                const negative = data[0]?.negative || 0

                return {
                    positive,
                    negative,
                    total: positive - negative
                }
            }).catch(e => reject(e))
        })
    }
}

export default QueryHandler