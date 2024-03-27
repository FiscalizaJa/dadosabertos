import postgres from "postgres";
import dotenv from "dotenv";

dotenv.config()

const database = postgres(process.env.CAMARA_DATABASE_URL, {
    transform: {
        undefined: null
    }
})

export const prepareDB = async function() {
    await database`
        CREATE TABLE IF NOT EXISTS deputy (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            full_name TEXT NOT NULL,
            sex VARCHAR(2) NOT NULL,
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
            emission_date TEXT,
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
        CREATE INDEX IF NOT EXISTS idx_deputy_office ON office (deputy_id)
    `

    await database`
        CREATE INDEX IF NOT EXISTS idx_expense ON expense (subquota, number_specification_subquota, identifier, month, year, document_id)
    `
}

// CONTINUAR: ajustar banco de dados, e fazer o sistema de download dos dados.

export default database