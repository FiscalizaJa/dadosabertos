import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config()

const database = postgres(process.env.SENADO_DATABASE_URL!, {
    transform: {
        undefined: null
    }
})

export const prepareDB = async function() {
    await database`
        CREATE TABLE IF NOT EXISTS senator (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            full_name TEXT NOT NULL,
            gender VARCHAR(2) NOT NULL,
            party TEXT,
            cpf TEXT,
            birth_date TEXT,
            birth_uf TEXT,
            holder_id INTEGER,
            alternate_type INTEGER,
            acting BOOLEAN
        )
    ` // holder_id e alternate_type é presente apenas quando o Senador é suplente

    await database`
        CREATE TABLE IF NOT EXISTS office (
            id SERIAL PRIMARY KEY,
            phone TEXT[],
            address TEXT,
            email TEXT,
            senator_id INTEGER UNIQUE,
            CONSTRAINT fk_senator_office FOREIGN KEY(senator_id) REFERENCES senator(id)
        )
    ` // Muitos Senadores têm mais de um número de telefone, por isso o campo phone aqui é um array.

    await database`
        CREATE TABLE IF NOT EXISTS expense (
            id INTEGER PRIMARY KEY,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            name_parlamentarian TEXT,
            document_id TEXT,
            type_document INTEGER,
            subquota INTEGER,
            detail_specification TEXT,
            supplier TEXT,
            identifier TEXT,
            emission_date DATE,
            liquid_value DECIMAL(10, 2),
            insert_date DATE,
            senator_id INTEGER,
            CONSTRAINT fk_senator_expense FOREIGN KEY (senator_id) REFERENCES senator(id)
        )
    `

    await database`
        CREATE TABLE IF NOT EXISTS supplier (
            id SERIAL PRIMARY KEY,
            identifier TEXT,
            name TEXT UNIQUE,
            name_vector TSVECTOR GENERATED ALWAYS AS (to_tsvector('portuguese', name)) STORED
        )
    `

    await database`
        CREATE TABLE IF NOT EXISTS expenses_total (
            id SERIAL PRIMARY KEY,
            year INTEGER,
            month INTEGER,
            supplier TEXT,
            senator_name TEXT,
            senator_id INTEGER,
            total DECIMAL(10, 2),
            CONSTRAINT idx_expenses_totals_unique UNIQUE (year, month, supplier, senator_name, senator_id, total)
        )
    `

    await database`
        CREATE INDEX IF NOT EXISTS idx_senator_expense ON expense (year, month, senator_id, subquota)
    `

    await database`
        CREATE INDEX IF NOT EXISTS idx_suppliers_ts ON supplier USING GIN (name_vector)
    `
}

// CONTINUAR: estudar como funcionam os dados do Senado para salvar as despesas no mesmo formato da câmara.

export default database