import axios, { AxiosInstance } from "axios";
import fs from "fs";
import decompress from "decompress";

import { finished } from "stream";
import { promisify } from "util";

import http from "http";
import https from "https"

const Finished = promisify(finished)

class Downloader {
    public agent: AxiosInstance

    constructor() {
        this.agent = axios.create({
            maxRedirects: 2,
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true })
        })
    }

    async download_deputies() {
        let time = Date.now()

        const stream = fs.createWriteStream("./data/deputados.json")
        const request = await this.agent.get("https://dadosabertos.camara.leg.br/arquivos/deputados/json/deputados.json", {
            responseType: "stream"
        })
        request.data.pipe(stream)
        await Finished(stream)

        time = Date.now() - time

        return {
            timeTaken: time
        }
    }

    async download_expenses(year: number): Promise<{ timeTaken: number }> {
        return new Promise(async (resolve, reject) => {
            let time = Date.now()
   
            const stream = fs.createWriteStream(`./data/despesas-${year}.json.zip`) 
            const request = await this.agent.get(`https://www.camara.leg.br/cotas/Ano-${year}.json.zip`, {
                responseType: "stream"
            })
            request.data.pipe(stream)
            await Finished(stream)
    
            await decompress(`./data/despesas-${year}.json.zip`, `data`)
            fs.unlinkSync(`./data/despesas-${year}.json.zip`)
    
            time = Date.now() - time
    
            resolve({ timeTaken: time })
        })
    }

}

export default Downloader