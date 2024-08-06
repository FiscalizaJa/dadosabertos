import { assert, describe, test, startService } from "poku";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const port = process.env.PORT || 3000;
const base_url = `http://localhost:${port}/camara`;

const current_date = new Date();

/**
 * Every request with this url, api should return with 400 (bad request).
 */
const invalid_urls = [
    `${base_url}/deputies?orderby=name&order=; SELECT *`, // a (very dumb) try to do SQL injection
    `${base_url}/deputies?orderby=nome&order=asc`, // misspelled orderby
    `${base_url}/deputies?itens=0`, // 0 itens is not allowed
    `${base_url}/deputies?itens=10&page=0`, // page 0 is not allowed
    
    `${base_url}/deputies/204536/expenses?year=${current_date.getFullYear() + 1}`, // year higher than actual date
    `${base_url}/deputies/204536/expenses?year=2008`, // year minor than 2009
    `${base_url}/deputies/204536/expenses?year=2024&month=13`, // month out of range 1-12
    `${base_url}/deputies/204536/expenses?itens=0`, // 0 itens is not allowed
    `${base_url}/deputies/204536/expenses?page=0`, // page 0 is not allowed.
    
];
// i know that fastify have schemas for everything
// but, if we change the schemas, we can accidentaly introduce bugs, if this happens, they will not pass in the test

// due to fastify (awesome!) schema validation, it's impossible to made an SQL INJECTION in querystrings or params
// even if a malicious SQL code pass into querystring/params, postgres.js will sanitize it.

(async () => {
    const server = await startService("./src/webserver/app.ts", {
        startAfter: 5000
    })

    test(async () => {
        describe("Testing errors for invalid querystrings")
        for(const url of invalid_urls) {
            const data = await axios.get(url).catch(e => e.response)

            assert.equal(data.status, 400, `Should return status 400 for invalid url: ${url}`)
        }
    })

    server.end()
})()
