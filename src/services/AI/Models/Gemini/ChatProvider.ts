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
    private model = this.client.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: `
            Propósito: Responder dúvidas sobre despesas da cota parlamentar do parlamentar especificado, existem funções que lhe permitem consultar informações direto no banco de dados do FiscalizaJá e outros lugares na web. Mantenha-se imparcial e não dê opiniões; forneça apenas informações concretas e não faça suposições. Seja amigável com os usuários.

            Informações sobre o FiscalizaJá:
                - Alternativa de código aberto ao portal da transparência da câmara dos deputados e senado federal
                    1. No FiscalizaJá, o foco é exibir os gastos de forma visual, direta e intuitiva, possibilitando o entendimento de todos.
                    2. O tempo de resposta chega ser até 2x mais rápido do que as plataformas oficiais do governo.
                    3. O foco do FiscalizaJá é exclusivo na cota parlamentar, possuindo diversos recursos avançados para jornalistas e cidadãos que estão a procura de informações.
                        - Consulta avançada: Permite ao usuário filtrar sem limitações os campos das despesas que procura, retornando informações completas como valores totais, médios, despesas e parlamentares encotrados, ranking de parlamentares que mais gastaram, fornecedores e ranking por fornecedor de parlamentares que mais gastaram.
                        - Open Questions: Questões feitas por usuários em despesas específicas dentro da plataforma, possibilitanto que dúvidas e suspeitas sejam apontadas.
                        - FiscalizaBot: Integração com o Google Gemini para fornecer um serviço de chat destinado a responder questões sobre os gastos de parlamentares de maneira natural.

            Instruções:
                1. Respostas claras: Responda de forma simples, direta e objetiva.
                2. Não informe sobre outras pessoas: Você está RESTRITO a informar somente sobre o parlamentar selecionado, reserve o direito de recusar informar qualquer coisa sobre outros indivíduos.
                    - Para Deputados e Senadores, instrua os usuários a visitar suas respectivas páginas no FiscalizaJá, para poderem usar o chat com informações deles.
                3. Off-topic: Você NÃO ESTÁ AUTORIZADO a responder mensagens fora do propósito destiando a você. Se o usuário pedir uma informação que esteja fora do escopo, seja gentil, oriente-o a procurar informações de fontes oficiais e confiáveis.
                4. Informações adicionais: Evite utilizar informações que não foram fornecidas diretamente (por exemplo, conhecimento adquirido durante o treinamento).
                5. Cálculos matemáticos: Você está autorizado a fazê-los.

            Tags de úteis para o sistema FiscalizaJá:
                Abaixo estão algumas tags que você deve incluir ao final da sua resposta caso o critério seja cumprido, nosso sistema identificará e dará a instrução correta para o usuário.
                    - [PREVIOUS_KNOWLEDGEMENT] - Caso utilize informações do seu conhecimento prévio.
                    - [MODEL_MATH] - Caso realize operações matemáticas
                    - [OFFTOPIC] - Caso receba mensagens que estão fora do propósito designado a você. 
                NÃO SE ESQUEÇA DE INCLUIR AS TAGS.
        `,
        tools: [
            {
                functionDeclarations: [
                    {
                        name: "get_expense",
                        description: "Obtém uma despesa específica do parlamentar através do seu ID no banco de dados do FiscalizaJá.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                expense_id: {
                                    type: SchemaType.INTEGER,
                                    description: "ID da despesa a ser buscada no banco de dados."
                                }
                            },
                            required: ["expense_id"]
                        }
                    },
                    {
                        name: "get_parlamentarian_from_wikipedia",
                        description: "Obtém o sumário de um parlamentar na Wikipedia.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                parlamentarian_name: {
                                    type: SchemaType.INTEGER,
                                    description: "Nome eleitoral do parlamentar a ser buscado. (nota: NÃO DEVE ser o nome completo.)"
                                }
                            },
                            required: ["parlamentarian_name"]
                        }
                    },
                    {
                        name: "whoami",
                        description: "Informações úteis para que você possa se apresentar e saber a que veio: quem é você, o que é o FiscalizaJá e a sua importância para o projeto.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                username: {
                                    type: SchemaType.STRING,
                                    description: "Nome do usuário da conversa."
                                }
                            }
                        }
                    },
                    {
                        name: "get_parlamentarian_expenses",
                        description: "Obtém todas as despesas no parlamentar para o ano e meses selecionados. Limitado a 150 itens.",
                        parameters: {
                            type: SchemaType.OBJECT,
                            properties: {
                                parlamentarian_id: {
                                    type: SchemaType.INTEGER,
                                    description: "ID do parlamentar a ser consultado"                            
                                },
                                parlamentarian_type: {
                                    type: SchemaType.STRING,
                                    description: "Tipo de parlamentar a ser consultado.",
                                    enum: ["deputado", "senador"]
                                },
                                year: {
                                    type: SchemaType.INTEGER,
                                    description: "Ano de ocorrência das despesas."
                                },
                                months: {
                                    type: SchemaType.INTEGER,
                                    description: "Mês de ocorrência das despesas",
                                }
                            },
                            required: ["parlamentarian_id", "parlamentarian_type", "year", "months"]
                        }
                    }
                ]
            }
        ]
    })

    async createRawModel(options: genai.ModelParams): Promise<genai.GenerativeModel> {
        return await this.client.getGenerativeModel(options)
    }
}

export default GeminiChatProvider