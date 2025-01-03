import Downloader from "./downloader";
import database from "./database";
import axios from "axios";
import logger from "../../../logger";
import sleep from "../../../utils/sleep";
import config from "./loader.config.json";
import { JSONParser } from "@streamparser/json-node";
import paginate from "../../../utils/paginate";
import nullishEmptyString from "../../../utils/nullishEmptyString";
import checkDateValidity from "../../../utils/checkDateValidity";
import fs from "fs";

import WikipediaArticlesList from "./Wikipedia";

const downloader = new Downloader();
const wikipediaArticles = new WikipediaArticlesList()

const CONCURRENT_DEPUTIES_FETCHES = config.deputies.concurrenct_fetches
const DELAY_BETWEEN_FETCHES = config.deputies.delay_between

const CONCURRENT_EXPENSES_TRANSACTIONS = config.expenses.transactions.concurrency
const EXPENSES_TRANSACTIONS_BATCH_SIZE = config.expenses.transactions.batch_size

// Aqui haverá queries direto no banco de dados, pois funções de insert/update não serão feitas em nenhum outro momento

async function fetchDeputies() {
    const request = await axios.get("https://dadosabertos.camara.leg.br/api/v2/deputados", {
        headers: {
            'Content-Type': "application/json"
        }
    })

    return request.data
}

async function fetchDeputy(id: number) {
    const request = await axios.get(`https://dadosabertos.camara.leg.br/api/v2/deputados/${id}`, {
        headers: {
            'Content-Type': "application/json"
        }
    })

    return request.data
}

async function saveDeputies() {
    logger.info("Fetching deputies from https://dadosabertos.camara.leg.br")

    const wikiLinks = await wikipediaArticles.mountArticlesList()
    const deputies_request = await fetchDeputies()
    const deputies = deputies_request.dados

    const detailed_deputies = []
    const offices = []
    const links = []

    let promises = []

    for (const deputy of deputies) {
        if(promises.length > CONCURRENT_DEPUTIES_FETCHES) {
            const resolved_promises = await Promise.all(promises)

            for(const resolved_promise of resolved_promises) {
                const data = resolved_promise.dados

                detailed_deputies.push({
                    id: data.id,
                    name: data.ultimoStatus.nome,
                    full_name: data.nomeCivil,
                    gender: data.sexo,
                    party: data.ultimoStatus.siglaPartido,
                    cpf: data.cpf,
                    birth_date: data.dataNascimento,
                    birth_uf: data.ufNascimento,
                    office: {
                        name: data.ultimoStatus.gabinete.nome,
                        building: data.ultimoStatus.gabinete.predio,
                        room: data.ultimoStatus.gabinete.sala,
                        floor: data.ultimoStatus.gabinete.andar,
                        phone: data.ultimoStatus.gabinete.telefone,
                        email: data.ultimoStatus.gabinete.email
                    },
                    website: data.urlWebsite,
                    social_urls: data.redeSocial
                })
            }

            promises = []
            await sleep(DELAY_BETWEEN_FETCHES)
        }

        promises.push(fetchDeputy(deputy.id))
    }

    const deputies_data = detailed_deputies.map(d => {
        if(wikiLinks[d.name]) {
            links.push({
                url: wikiLinks[d.name],
                type: "Wikipedia",
                deputy_id: d.id
            })
        }

        offices.push({
            ...d.office,
            deputy_id: d.id
        })
        
        d.website && links.push({
            url: d.website,
            type: "website",
            deputy_id: d.id
        })

        for(const link of d.social_urls) {
            links.push({
                url: link,
                type: "social",
                deputy_id: d.id
            })
        }

        delete d.office
        delete d.website
        delete d.social_urls

        return d
    })

    logger.info("All data prepared. Now, we will write.")

    await database`
        INSERT INTO camara_deputy ${database(deputies_data)}
    `

    await Promise.all([
        database`
            INSERT INTO camara_deputy_office ${database(offices)}
        `,
        database`
            INSERT INTO camara_deputy_links ${database(links)}
        `
    ])

    logger.info("Done with saving.")
    database.end()
}

function saveExpensesForYear(year: number) {
    return new Promise(async (resolve, reject) => {
        logger.info(`Downloading expenses for year ${year} from https://dadosabertos.camara.leg.br`)
        await downloader.download_expenses(year)
        logger.info(`Download complete. Starting data writing`)
    
        const stream = fs.createReadStream(`./data/Ano-${year}.json`)
        const parser = new JSONParser({ emitPartialTokens: false, paths: ["$.dados.*"] })
    
        stream.pipe(parser)
    
        const deputy_ids = await database`
            SELECT id FROM camara_deputy
        `
        const deputy_list = {}
        for (const deputy of deputy_ids) {
            deputy_list[deputy.id] = deputy.id
        }
    
        const OBJECT_KEYCOUNT = [31, 32]
        // alguns objectos possuem o "idDeputado" e outros não, portanto, o tamanho é entre 31 e 32 propriedades.
    
        let count = 0
    
        let expenses = [] // reatribuir libera a array antigo para a coleta de lixo, evitando o alto uso de memória ram.
        let promises = []
    
        parser.on("data", async (data) => {
            if (OBJECT_KEYCOUNT.includes(count)) {
                count = 0
                if(expenses.length >= EXPENSES_TRANSACTIONS_BATCH_SIZE) {
                    parser.pause()
                    if(promises.length > CONCURRENT_EXPENSES_TRANSACTIONS) {
                        await Promise.all(promises)
                        promises = []
                    }
    
                    promises.push(
                        writeExpenses(expenses)
                    )
    
                    expenses = []
                    parser.resume()
                } else {
                    data.value = nullishEmptyString(data.value)

                    if(data.value.idDeputado) {
                        data.value.numeroDeputadoID = data.value.idDeputado
                    }
                    if(data.value.cnpjCPF) {
                        data.value.cnpjCPF = data.value.cnpjCPF.split('').filter((char: any) => !isNaN(char)).join('').replace(/ /g, '')
                    }

                    if(!data.value.dataEmissao || !checkDateValidity(data.value.dataEmissao)) {
                        // reconstrói o data emissao com base no mês e ano da despesa
                        const date = new Date()
                        date.setFullYear(data.value.ano)
                        date.setMonth(data.value.mes)

                        data.value.dataEmissao = date
                    }

                    if(deputy_list[data.value?.numeroDeputadoID]) {
                        expenses.push({
                            difid: Object.values(data.value).join("-"),
                            name_parlamentarian: data.value?.nomeParlamentar,
                            wallet: data.value?.numeroCarteiraParlamentar,
                            subquota: data.value?.numeroSubCota,
                            number_specification_subquota: data.value?.numeroEspecificacaoSubCota,
                            detail_specification: data.value?.descricaoEspecificacao,
                            supplier: data.value?.fornecedor,
                            identifier: data.value?.cnpjCPF,
                            number: data.value?.numero,
                            type_document: data.value?.tipoDocumento,
                            emission_date: data.value?.dataEmissao,
                            value_document: data.value?.valorDocumento,
                            value_gloss: data.value?.valorGlosa,
                            liquid_value: data.value?.valorLiquido,
                            month: data.value?.mes,
                            year: data.value?.ano,
                            parcel: data.value?.parcela,
                            passenger: data.value?.passageiro,
                            section: data.value?.trecho,
                            lot: data.value?.lote,
                            reimbursement: Number(data.value?.ressarcimento) || null,
                            refund: Number(data.value?.restituicao) || null,
                            document_id: data.value?.idDocumento,
                            url_document: data.value?.urlDocumento,
                            insert_date: new Date(),
                            deputy_id: data.value?.numeroDeputadoID
                        })
                    }
                }
            } else {
                count += 1
            }
        })
    
        parser.on("end", async () => {
            if(expenses.length) {
                await writeExpenses(expenses)
            }
    
            logger.info(`End for year ${year}`)

            resolve(true)
        })
    })
}

function writeExpenses(expenses: any) {
    return new Promise((resolve, reject) => {
        database.begin(async sql => {
            const chunks = paginate(expenses, 1600)
            let chunk = chunks.next()

            while(!chunk.done && chunk.value) {
                await sql`
                    INSERT INTO camara_expense ${sql(chunk.value)} ON CONFLICT DO NOTHING
                `
                chunk = chunks.next()
            }

            resolve(true)
        })
    })
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

async function updatePreMadeData() {
    logger.info("Updating other tables")
    await database`
        INSERT INTO camara_supplier (identifier, name)
        SELECT DISTINCT identifier, supplier
        FROM camara_expense
        WHERE identifier IS NOT NULL AND identifier <> ''
        ON CONFLICT (name) DO NOTHING
    `

    await database`
        WITH cte AS (
            SELECT id, url_document,
                ROW_NUMBER() OVER (PARTITION BY url_document ORDER BY id DESC) AS rn
            FROM camara_expense
            WHERE url_document IS NOT NULL AND url_document != ''
        )
        DELETE FROM camara_expense
        WHERE id IN (SELECT id FROM cte WHERE rn > 1)
    `

    await database`
        WITH despesas AS (
            SELECT year, 
            month, 
            supplier,
            name_parlamentarian,
            deputy_id,
            SUM(liquid_value) AS total
            FROM camara_expense
            GROUP BY year, month, supplier, name_parlamentarian, deputy_id
        )
        INSERT INTO camara_expenses_total (year, month, supplier, deputy_name, deputy_id, total)
        SELECT year, month, supplier, name_parlamentarian, deputy_id, total FROM despesas ON CONFLICT DO NOTHING;
    `
    logger.info("Done.")
}

export default {
    saveDeputies,
    saveExpensesForYear,
    downloadExpensesStartingFromYear,
    updatePreMadeData
}