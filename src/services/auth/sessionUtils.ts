import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { User } from "../../interfaces/User";
import { promisify } from "util";

dotenv.config()

const SALT_COST = 11
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

async function hashPassword(plain_password: string) {
    const salt = await bcrypt.genSalt(SALT_COST)
    const hashedPassword = await bcrypt.hash(plain_password, salt)

    return hashedPassword
}

async function validateHash(plain_password: string, hashed_password: string) {
    const isValid = await bcrypt.compare(plain_password, hashed_password)

    return isValid
}

function generateJWT(user: User): Promise<string> {
    return new Promise((resolve, reject) => {
        jwt.sign(user, JWT_SECRET_KEY, { expiresIn: "30 days" }, (err, token) => {
            if(err) {
                reject(err)
            } else {
                resolve(token)
            }
        })
    })
}

function getJWTpayload(token: string): Promise<User> {
    return new Promise((resolve, reject) => {
        jwt.verify(token, JWT_SECRET_KEY, {}, (err, payload) => {
            if(err) {
                reject(err)
            } else {
                resolve(payload as User)
            }
        })
    })    
}

export default {
    hashPassword,
    validateHash,
    generateJWT,
    getJWTpayload
}

// TODO: exportar e substituir o auth com Google por isso
// TODO: função para verificar a conta pelo link enviado por email.