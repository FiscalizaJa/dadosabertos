import postgres from "postgres";

const database = postgres({
    host: process.env.CAMARA_DATABASE_URL,
    transform: {
        undefined: null
    }
})

export const prepareDB = async function() {
    await database`
        CREATE TABLE deputy (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            full_name TEXT NOT NULL,
            sex VARCHAR(2) NOT NULL,
            initial_legislature INTEGER,
            final_legislature INTEGER,
            birth_date TEXT NOT NULL,
            death_date TEXT,
            birth_uf TEXT,
            birth_county TEXT
        )
    `

    await database`
        CREATE TABLE deputy_links (
            id SERIAL PRIMARY KEY,
            url TEXT NOT NULL,
            type TEXT NOT NULL,
            deputy_id INTEGER NOT NULL,
            CONSTRAINT fk_deputy_link FOREIGN KEY(deputy_id) REFERENCES deputy(id)
        )
    `

    await database`
        CREATE TABLE expenses (
            id SERIAL PRIMARY KEY,
            difid TEXT UNIQUE NOT NULL,
            name_parlamentarian TEXT,
            cpf TEXT,
            wallet INTEGER,
            party TEXT,
            subquota INTEGER,
            detail_specification TEXT,
            supplier TEXT,
            identifier TEXT,
            number INTEGER,
            type INTEGER,
            emission_date TEXT,
            value_document DECIMAL(10, 2),
            value_gloss DECIMAL (10, 2),
            liquid_value DECIMAL(10, 2),
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

            deputy_id INTEGER NOT NULL,
            CONSTRAINT fk_deputy_expense FOREIGN KEY(deputy_id) REFERENCES(id)
        )
    ` // precisamos do partido (party) porque nos dados sobre os deputados... NÃO VEM O PARTIDO DO DEPUTADO. Então nós pegamos o partido daqui (:
}

// CONTINUAR: ajustar banco de dados, e fazer o sistema de download dos dados.

export default database