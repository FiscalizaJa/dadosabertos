import { randomBytes } from "crypto";

/**
 * Simple but secure token generation
 * - First, we generate an flat token based on "length"
 * - Second, we generate a portion of random bytes for every character of "complementaryData" and put in a random position of the flat token.
 * - Third, we created a secure token that is very, very, very hard to brute force.
 */
export default function genToken(encoding: BufferEncoding, length: number, complementaryData: string) {
    let randomToken = randomBytes(length).toString(encoding)

    for(const _ in complementaryData.split("")) {
        const complementaryToken = randomBytes(Math.round(length * 0.20)).toString(encoding)
        const position = Math.floor(Math.random() * randomToken.length + 1) - 1
        randomToken = [randomToken.slice(0, position), complementaryToken, randomToken.slice(position)].join('')
    }

    return randomToken
}