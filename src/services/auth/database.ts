import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config()

const database = postgres(process.env.AUTH_DATABASE_URL!, {
    transform: {
        undefined: null
    }
})

export const prepareDB = async function() {
    await database`
        CREATE TABLE IF NOT EXISTS profile (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            name TEXT NOT NULL,
            avatar_url TEXT,
            activated BOOLEAN NOT NULL,
            refresh_token TEXT NOT NULL
        )
    ` // refresh_token só é retornado no primeiro login do usuário na aplicação, por isso, ele deve ficar guardado de forma persistente
    await database`
        CREATE TABLE IF NOT EXISTS session (
            id SERIAL PRIMARY KEY,
            access_token TEXT UNIQUE NOT NULL,
            mask_token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMPTZ NOT NULL,

            user_id TEXT NOT NULL,
            CONSTRAINT fk_user_session FOREIGN KEY(user_id) REFERENCES profile(id)
        )
    `
}

export default database