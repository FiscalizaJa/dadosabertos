import axios, { AxiosInstance } from "axios";
import fs from "fs";

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

    async download_expenses(year: number) {
        return new Promise(async (resolve, reject) => {
            let time = Date.now()
   
            const stream = fs.createWriteStream(`./data/despesas-senado-${year}.json`) 

            const request = await this.agent.get(`https://adm.senado.gov.br/adm-dadosabertos/api/v1/senadores/despesas_ceaps/${year}`, {
                responseType: "stream"
            })
            request.data.pipe(stream)
            await Finished(stream)
    
            time = Date.now() - time
    
            resolve({ timeTaken: time })  
        })
    }
}

export default Downloader