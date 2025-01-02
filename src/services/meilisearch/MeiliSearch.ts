import MeiliSearch from "meilisearch";
import dotenv from "dotenv";

dotenv.config()

const client = new MeiliSearch({
    host: process.env.MEILI_HOST,
    apiKey: process.env.MEILI_API_KEY
})

export default client