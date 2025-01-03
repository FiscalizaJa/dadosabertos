import database from "./database";
import Downloader from "./downloader";
import config from "./loader.config.json";
import sleep from "../../../utils/sleep";
import paginate from "../../../utils/paginate";
import logger from "../../../logger";
import alternate_types from "./alternate_type_reference.json";
import document_types from "./document_type_reference.json";
import expense_types from "./expense_type_reference.json";
import removeAccent from "../../../utils/removeAccent";
import WikipediaArticlesList from "./Wikipedia";

const downloader = new Downloader()
const wikipediArticles = new WikipediaArticlesList()

const CONCURRENT_SENATORS_FETCHES = config.senators.concurrenct_fetches
const DELAY_BETWEEN_FETCHES = config.senators.delay_between

const CONCURRENT_EXPENSES_TRANSACTIONS = config.expenses.transactions.concurrency
const EXPENSES_TRANSACTIONS_BATCH_SIZE = config.expenses.transactions.batch_size

async function save_senators() {
    const wikiLinks = await wikipediArticles.mountArticlesList()

    const senators_online_data = await downloader.agent.get(`https://legis.senado.leg.br/dadosabertos/arquivos/ListaParlamentarEmExercicio.json`)
    const senators_id = {}

    for(const data of senators_online_data.data.ListaParlamentarEmExercicio.Parlamentares.Parlamentar) {
        senators_id[data.IdentificacaoParlamentar.CodigoParlamentar] = data
    }

    for(const data of senators_online_data.data.ListaParlamentarEmExercicio.Parlamentares.Parlamentar) {
        if(data.Mandato.Suplentes?.Suplente?.length) {
            for(const suplente of data.Mandato.Suplentes.Suplente) {
                if(!senators_id[suplente.CodigoParlamentar]) {
                    senators_id[suplente.CodigoParlamentar] = {
                        IdentificacaoParlamentar: {
                            CodigoParlamentar: suplente.CodigoParlamentar,
                            NomeParlamentar: suplente.NomeParlamentar
                        },
                        Mandato: {
                            DescricaoParticipacao: suplente.DescricaoParticipacao,
                            EmExercicio: false,
                            Titular: {
                                CodigoParlamentar: data.IdentificacaoParlamentar.CodigoParlamentar
                            }
                        }
                    }
                }
            }
        }
    } // esse aqui é para vasculhar os suplentes que não estão em exercício

    const senators_data = [] // os dados convertidos serão salvos aqui, Senado,  seria bom se disponibilizassem um arquivo com todas as infos de senadores para download, e que não fossem incompletas igual o da câmara dos deputados que não serve pra nada.
    const offices = []
    const links = []

    let promises = []

    let remaining = Object.keys(senators_id).length

    logger.info(`Fetching senators directly from legis.senado.leg.br, this will take a moment...`)
    for(const id of Object.keys(senators_id)) {
        if(promises.length > CONCURRENT_SENATORS_FETCHES || remaining <= CONCURRENT_SENATORS_FETCHES) {
            const resolved_promises = await Promise.all(promises)

            for(const data of resolved_promises) {
                const online_data = senators_id[data.IdentificacaoParlamentar.CodigoParlamentar]

                senators_data.push(
                    {
                        id: data.IdentificacaoParlamentar.CodigoParlamentar,
                        name: data.IdentificacaoParlamentar.NomeParlamentar,
                        full_name: data.IdentificacaoParlamentar.NomeCompletoParlamentar,
                        gender: data.IdentificacaoParlamentar?.SexoParlamentar.toLowerCase() === "masculino" ? "M" : "F",
                        party: data.IdentificacaoParlamentar?.SiglaPartidoParlamentar,
                        birth_date: data.DadosBasicosParlamentar?.DataNascimento,
                        birth_uf: data.DadosBasicosParlamentar?.UfNaturalidade || data.DadosBasicosParlamentar?.UfParlamentar,
                        holder_id: online_data.Mandato.DescricaoParticipacao == "Titular" ? null : online_data.Mandato.Titular.CodigoParlamentar,
                        alternate_type: alternate_types[online_data.Mandato.DescricaoParticipacao],
                        acting: online_data.Mandato.EmExercicio === false ? false : true
                    }
                )

                offices.push({
                    phone: data.Telefones?.Telefone?.map(t => t.NumeroTelefone) || [],
                    address: data.DadosBasicosParlamentar?.EnderecoParlamentar,
                    email: online_data.IdentificacaoParlamentar.EmailParlamentar,
                    senator_id: data.IdentificacaoParlamentar.CodigoParlamentar
                })

                if(wikiLinks[data.IdentificacaoParlamentar.NomeParlamentar]) {
                    links.push({
                        url: wikiLinks[data.IdentificacaoParlamentar.NomeParlamentar],
                        type: "Wikipedia",
                        senator_id: data.IdentificacaoParlamentar.CodigoParlamentar
                    })
                }


            }

            promises = []
            await sleep(DELAY_BETWEEN_FETCHES)
        }

        promises.push(fetch_senator(Number(id)))
        remaining += 1
    }

    logger.info("Writing senators to database...")
    await database`
        INSERT INTO senado_senator ${database(senators_data)}
    `
    await database`
        INSERT INTO senado_senator_office ${database(offices)}
    `
    await database`
        INSERT INTO senado_senator_links ${database(links)}
    `
    logger.info("End")
}

async function fetch_senator(id: number) {
    const senator_data = await downloader.agent.get(`https://legis.senado.leg.br/dadosabertos/senador/${id}.json`)

    return senator_data.data?.DetalheParlamentar.Parlamentar
}

async function saveExpensesForYear(year: number) {
    logger.info(`Downloading expenses for year ${year} from https://adm.senado.leg.br`)
    await downloader.download_expenses(year)
    logger.info(`Download complete. Starting data writing`)

    const data = await import(`../../../../data/despesas-senado-${year}.json`) as any;

    let expenses = []

    const senators = await database`
        SELECT id, name FROM senado_senator
    `
    const senators_data = {}

    for(const senator of senators) {
        senators_data[senator.name.toLowerCase()] = senator.id
    }

    for(const plain_expense of data.default) {
        const senator_id = senators_data[plain_expense.nomeSenador.toLowerCase()]

        if(senator_id) {
            expenses.push({
                id: plain_expense.id,
                year: plain_expense.ano,
                month: plain_expense.mes,
                name_parlamentarian: plain_expense.nomeSenador,
                document_id: plain_expense.documento,
                type_document: document_types.conversions[plain_expense.tipoDocumento],
                subquota: expense_types.conversions[removeAccent(plain_expense.tipoDespesa?.toLowerCase()?.trim() || "")] || -1,
                detail_specification: plain_expense.detalhamento,
                supplier: plain_expense.fornecedor,
                identifier: plain_expense.cpfCnpj.split('').filter((char: any) => !isNaN(char)).join('').replace(/ /g, ''),
                emission_date: plain_expense.data,
                liquid_value: plain_expense.valorReembolsado,
                insert_date: new Date(),
                senator_id: senator_id
            })
        }
    }

    const chunks = paginate(expenses, EXPENSES_TRANSACTIONS_BATCH_SIZE)
    let chunk = chunks.next()

    let promises = []

    while(!chunk.done && chunk.value) {
        if(promises.length > CONCURRENT_EXPENSES_TRANSACTIONS) {
            await Promise.all(promises)
            promises = []
        }

        promises.push(writeExpenses(chunk.value))
        chunk = chunks.next()
    }

    logger.info(`End for year ${year}`)
}

async function writeExpenses(data: any[]) {
    await database.begin(async sql => {
        const chunks = paginate(data, 1600)
        let chunk = chunks.next()

        const promises = []

        while(!chunk.done && chunk.value) {
            promises.push(sql`
                INSERT INTO senado_expense ${database(chunk.value)} ON CONFLICT DO NOTHING
            `)
            chunk = chunks.next()
        }

        await Promise.all(promises)
    })
}

async function updatePreMadeData() {
    logger.info("Updating other tables")
    await database`
        INSERT INTO senado_supplier (identifier, name)
        SELECT DISTINCT identifier, supplier
        FROM senado_expense
        WHERE identifier IS NOT NULL AND identifier <> ''
        ON CONFLICT DO NOTHING
    `

    await database`
        WITH despesas AS (
            SELECT year, 
            month, 
            supplier,
            name_parlamentarian,
            senator_id,
            SUM(liquid_value) AS total
            FROM senado_expense
            GROUP BY year, month, supplier, name_parlamentarian, senator_id
        )
        INSERT INTO senado_expenses_total (year, month, supplier, senator_name, senator_id, total)
        SELECT year, month, supplier, name_parlamentarian, senator_id, total FROM despesas ON CONFLICT DO NOTHING;
    `
    logger.info("Done.")
}

async function downloadExpensesStartingFromYear(startingYear: number) {
    await new Promise(async (resolve, reject) => {
        const endingYear = new Date().getFullYear()
        
        let year = startingYear

        while(year <= endingYear) {
            await saveExpensesForYear(year)
            year += 1
        }

        await updatePreMadeData()

        resolve(true)
    })
}

export default {
    save_senators,
    saveExpensesForYear,
    downloadExpensesStartingFromYear
}