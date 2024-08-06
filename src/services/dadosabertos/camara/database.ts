import postgres, { Sql } from "postgres";
import dotenv from "dotenv";

dotenv.config()

const database = postgres(process.env.CAMARA_DATABASE_URL!, {
    transform: {
        undefined: null
    },
    debug: true
})

export const prepareDB = async function() {
    await database`
        CREATE TABLE IF NOT EXISTS deputy (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            full_name TEXT NOT NULL,
            gender VARCHAR(2) NOT NULL,
            party TEXT,
            cpf TEXT,
            birth_date TEXT NOT NULL,
            birth_uf TEXT
        )
    `

    await database`
        CREATE TABLE IF NOT EXISTS office (
            id SERIAL PRIMARY KEY,
            name TEXT,
            building TEXT,
            room TEXT,
            floor TEXT,
            phone TEXT,
            email TEXT,
            deputy_id INTEGER NOT NULL,
            CONSTRAINT fk_deputy_office FOREIGN KEY(deputy_id) REFERENCES deputy(id)
        )
    `

    await database`
        CREATE TABLE IF NOT EXISTS deputy_links (
            id SERIAL PRIMARY KEY,
            url TEXT NOT NULL,
            type TEXT NOT NULL,
            deputy_id INTEGER NOT NULL,
            CONSTRAINT fk_deputy_link FOREIGN KEY(deputy_id) REFERENCES deputy(id)
        )
    `

    await database`
        CREATE TABLE IF NOT EXISTS expense (
            id SERIAL PRIMARY KEY,
            difid TEXT UNIQUE NOT NULL,
            name_parlamentarian TEXT,
            wallet TEXT,
            subquota INTEGER,
            number_specification_subquota INTEGER,
            detail_specification TEXT,
            supplier TEXT,
            identifier TEXT,
            number TEXT,
            type_document TEXT,
            emission_date TIMESTAMPTZ,
            value_document DECIMAL(10,2),
            value_gloss DECIMAL(10,2),
            liquid_value DECIMAL(10,2),
            month INTEGER,
            year INTEGER,
            parcel INTEGER,
            passenger TEXT,
            section TEXT,
            lot TEXT,
            reimbursement DECIMAL(10, 2),
            payment_date_refund TEXT,
            refund DECIMAL(10, 2),
            document_id INTEGER,
            url_document TEXT,
            insert_date TIMESTAMPTZ,
            deputy_id INTEGER NOT NULL,
            CONSTRAINT fk_deputy_expense FOREIGN KEY(deputy_id) REFERENCES deputy(id)
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
            deputy_name TEXT,
            deputy_id INTEGER,
            total DECIMAL(10, 2),
            CONSTRAINT idx_expenses_totals_unique UNIQUE (year, month, supplier, deputy_name, deputy_id, total)
        )
    ` // sem necessidade de uma relação, são valores gerados automaticamente por uma query sql.

    await database`
        CREATE INDEX IF NOT EXISTS idx_deputy_office ON office (deputy_id)
    `

    await database`
        CREATE INDEX IF NOT EXISTS idx_expense ON expense (subquota, number_specification_subquota, identifier, month, year, document_id)
    `

    await database`
        CREATE INDEX IF NOT EXISTS idx_suppliers ON supplier (identifier)
    `

    await database`
        CREATE INDEX IF NOT EXISTS idx_suppliers_ts ON supplier USING GIN (name_vector)
    `

    await database`
        CREATE INDEX IF NOT EXISTS idx_expenses_total ON expenses_total (year, month, deputy_id)
    `
}

export default database