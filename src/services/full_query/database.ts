import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config()

const database = postgres(process.env.FULL_QUERY_DATABASE_URL!, {
    transform: {
        undefined: null
    }
})

export const prepareDB = async function() {
    await database`
        CREATE TABLE IF NOT EXISTS query_result (
            id INTEGER PRIMARY KEY,
            target TEXT NOT NULL,
            made_at TIMESTAMPTZ NOT NULL,
            last_view TIMESTAMPTZ NOT NULL,
            author_id TEXT NOT NULL,
            expenses JSONB,
            insights JSONB,
            suppliers JSONB
        )
    `

    await database`
        CREATE INDEX IF NOT EXISTS idx_expenses ON query_result USING GIN (expenses);
        CREATE INDEX IF NOT EXISTS idx_suppliers ON query_result USING GIN (suppliers);
    `.simple()
}

export default database