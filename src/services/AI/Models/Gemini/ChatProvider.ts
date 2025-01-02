import dotenv from "dotenv";
import genai, { SchemaType } from "@google/generative-ai";
import loadFunctions from "../../functions.loader";
import CamaraQueryHandler from "../../../dadosabertos/camara/queryHandler";
import SenadoQueryHandler from "../../../dadosabertos/senado/queryHandler";
import AuthQueryHandler from "../../../auth/queryHandler";

import type { GPTFunctionMeta, GPTMessage } from "../../../../interfaces/GPTMessage";

dotenv.config()

const senado = new SenadoQueryHandler()
const camara = new CamaraQueryHandler()
const auth = new AuthQueryHandler()

enum ParlamentarianType {
    Senator = "senador",
    Deputy = "deputado"
}

export {
    ParlamentarianType
}

class GeminiChatProvider {
    public functions: { [key: string]: (...args: unknown[]) => unknown }
    
    private client = new genai.GoogleGenerativeAI(process.env.GEMINI_API_KEY)

    async createRawModel(options: genai.ModelParams): Promise<genai.GenerativeModel> {
        return await this.client.getGenerativeModel(options)
    }
}

export default GeminiChatProvider