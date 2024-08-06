import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config()

const database = postgres(process.env.OPEN_QUESTIONS_DATABASE_URL!, {
    transform: {
        undefined: null
    }
})

export const prepareDB = async function() {
    await database`
        CREATE TABLE IF NOT EXISTS question (
            id SERIAL PRIMARY KEY,
            subject_id TEXT NOT NULL,
            content VARCHAR(550),
            user_id TEXT NOT NULL,

            CONSTRAINT idx_questions_unique UNIQUE (subject_id, user_id)
        )
    `

    await database`
        CREATE TABLE IF NOT EXISTS vote (
            id SERIAL PRIMARY KEY,
            vote_type INTEGER NOT NULL,

            user_id TEXT NOT NULL,
            question_id INTEGER NOT NULL,
            CONSTRAINT fk_question_vote FOREIGN KEY(question_id) REFERENCES question(id),
            CONSTRAINT idx_questions_votes_unique UNIQUE (user_id, question_id)
        )
    `
}

export default database