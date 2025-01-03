import database from "../postgres/Connection";

export const prepareDB = async function() {
    await database`
        CREATE TABLE IF NOT EXISTS full_query_query_result (
            id INTEGER PRIMARY KEY,
            target TEXT NOT NULL,
            made_at TIMESTAMPTZ NOT NULL,
            last_view TIMESTAMPTZ NOT NULL,
            author_id TEXT NOT NULL,
            expenses TEXT UNIQUE,
            insights JSONB,
            suppliers JSONB
        )
    `

    await database`
        CREATE INDEX IF NOT EXISTS idx_full_query_suppliers ON full_query_query_result USING GIN (suppliers);
    `.simple()
}

export default database