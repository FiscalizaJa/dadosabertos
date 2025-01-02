import client from "./MeiliSearch";
import CamaraQueryHandler from "../dadosabertos/camara/queryHandler";
import SenadoQueryHandler from "../dadosabertos/senado/queryHandler";
import config from "./loader.config.json";
import crypto from "crypto";
import logger from "../../logger";

const camara = new CamaraQueryHandler()
const senado = new SenadoQueryHandler()

const PARLAMENTARIAN_BATCH_SIZE = config.parlamentarians.batchSize
const SUPPLIER_BATCH_SIZE = config.suppliers.batchSize
const SUPPLIER_CONCURRENT_REQUESTS = config.suppliers.concurrent_requests

async function readyUpIndexes() {
    await client.createIndex("deputies", {
        primaryKey: "id"
    })
    await client.createIndex("senators", {
        primaryKey: "id"
    })

    await client.createIndex("camara_suppliers", {
        primaryKey: "id"
    })
    await client.createIndex("senado_suppliers", {
        primaryKey: "id"
    })
}

async function syncCamaraData() {
    const deputies_index = client.index("deputies")
    const suppliers_index = client.index("camara_suppliers")

    await deputies_index.deleteAllDocuments()
    await suppliers_index.deleteAllDocuments()

    const dataGenerator = camara.getAllDeputiesWithoutFiltersGenerator(PARLAMENTARIAN_BATCH_SIZE)
    const suppliersGenerator = camara.getAllSuppliersWithoutFiltersGenerator(SUPPLIER_BATCH_SIZE)

    let promises = []

    logger.info("Sync deputies on MeiliSearch")
    for await (const data of dataGenerator) {
        const dataToSave = data.map(d => {
            return {
                id: d.id,
                name: d.name,
                full_name: d.full_name,
                cpf: d.cpf
            }
        })

        promises.push(deputies_index.addDocuments(dataToSave))
    }
    logger.info("Sync complete.")

    await Promise.all(promises)
    promises = []

    let totalSuppliers = 0

    logger.info("Sync camara suppliers with MeiliSearch")
    for await (const data of suppliersGenerator) {

        const dataToSave = data.map(d => {
            totalSuppliers += 1

            return {
                id: d.id,
                identifier: d.identifier,
                name: d.name
            }
        })

        if(promises.length >= SUPPLIER_CONCURRENT_REQUESTS) {
            await Promise.all(promises)
            promises = []
        }

        promises.push(suppliers_index.addDocuments(dataToSave))
    }

    await Promise.all(promises)
    logger.info(`Sync complete - ${totalSuppliers} items.`)

}

async function syncSenadoData() {
    const senators_index = client.index("senators")
    const suppliers_index = client.index("senado_suppliers")

    await senators_index.deleteAllDocuments()
    await suppliers_index.deleteAllDocuments()

    const dataGenerator = senado.getAllSenatorsWithoutFiltersGenerator(PARLAMENTARIAN_BATCH_SIZE)
    const suppliersGenerator = senado.getAllSuppliersWithoutFiltersGenerator(SUPPLIER_BATCH_SIZE)

    let promises = []

    logger.info("Sync senators on MeiliSearch")
    for await (const data of dataGenerator) {
        const dataToSave = data.map(d => {
            return {
                id: d.id,
                name: d.name,
                full_name: d.full_name,
                cpf: d.cpf
            }
        })

        promises.push(senators_index.addDocuments(dataToSave))
    }
    logger.info("Sync complete.")

    await Promise.all(promises)
    promises = []

    let totalSuppliers = 0

    logger.info("Sync camara suppliers with MeiliSearch")
    for await (const data of suppliersGenerator) {

        const dataToSave = data.map(d => {
            totalSuppliers += 1

            return {
                id: d.id,
                identifier: d.identifier,
                name: d.name
            }
        })

        if(promises.length >= SUPPLIER_CONCURRENT_REQUESTS) {
            await Promise.all(promises)
            promises = []
        }

        promises.push(suppliers_index.addDocuments(dataToSave))
    }

    await Promise.all(promises)
    logger.info(`Sync complete - ${totalSuppliers} items.`)
}

async function syncAll() {
    await readyUpIndexes()
    await syncCamaraData()
    await syncSenadoData()
}

export {
    readyUpIndexes,
    syncCamaraData,
    syncSenadoData,
    syncAll
}