import postgres, { Sql } from "postgres";
import dotenv from "dotenv";

dotenv.config()

const database = postgres(process.env.POSTGRES_DATABASE_URI!, {
    transform: {
        undefined: null
    },
    debug: process.env.DATABASE_DEBUG_MODE == "1" || false
})

function NewConnection(): postgres.Sql<{}> {
    const new_database = postgres(process.env.POSTGRES_DATABASE_URI!, {
        transform: {
            undefined: null
        },
        debug: process.env.DATABASE_DEBUG_MODE == "1" || false
    })

    return new_database
}

export default database
export {
    NewConnection
}