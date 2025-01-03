import database from "../postgres/Connection";

export const prepareDB = async function() {
    await database`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            password TEXT NOT NULL,
            activated BOOLEAN DEFAULT false,
            activation_token TEXT
        )
    `

    /*await database`
        CREATE TABLE IF NOT EXISTS chat_history (
            id SERIAL PRIMARY KEY,
            user_id TEXT,
            parlamentarian_id TEXT,
            history JSONB,

            CONSTRAINT idx_chat_history UNIQUE(user_id, parlamentarian_id)
        )
    `*/
}

export default database