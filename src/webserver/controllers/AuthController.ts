import type { FastifyRequest, FastifyReply } from "fastify";
import Auth from "../../services/auth/queryHandler";
import dotenv from "dotenv";
import axios from "axios";
import genToken from "../../utils/genToken";
import sessionUtils from "../../services/auth/sessionUtils";

dotenv.config()

const auth = new Auth()

async function Register(req: FastifyRequest, res: FastifyReply) {
    const body = req.body as any
    const email = body.email
    const password = body.password
    const name = body.name
    
    const user = await auth.getUserInfoFromDatabaseByEmail(email)

    if(user) {
        return res.status(422).send({
            error: "User already exists"
        })
    }

    const activation_token = genToken("hex", 8, email)

    const hashed_password = await sessionUtils.hashPassword(password)

    await auth.createUserInDatabase({
        email: email,
        name: name,
        password: hashed_password,
        activated: false,
        activation_token: activation_token
    })

    return res.status(201).send("Created")
}

async function ActivateAccount(req: FastifyRequest, res: FastifyReply) {
    const params = req.params as { ac_token: string }
    const token = params.ac_token

    const result = await auth.activateAccountByActivationToken(token)

    if(result) {
        return "OK"
    } else {
        res.status(404).send({
            error: "Account not found"
        })
    }
}

async function Login(req: FastifyRequest, res: FastifyReply) {
    const body = req.body as any
    const email = body.email
    const plain_password = body.password

    const user = await auth.getUserInfoFromDatabaseByEmail(email)

    if(!user) {
        return res.status(404).send({
            error: "User not found",
            code: "user_not_found"
        })
    }

    if(!user.activated) {
        return res.status(401).send({
            error: "User not activated",
            code: "user_not_activated"
        })
    }

    const validPassword = await sessionUtils.validateHash(plain_password, user.password)

    if(!validPassword) {
        return res.status(401).send({
            error: "Invalid password"
        })
    }

    delete user.password // em hipotese alguma isso pode ir pro jwt

    const token = await sessionUtils.generateJWT(user)

    return res.status(200).send({
        token
    })
}

async function SessionUserinfo(req: FastifyRequest, res: FastifyReply) {
    return {
        data: req.user
    }
}

export default {
    Register,
    Login,
    ActivateAccount,
    SessionUserinfo
}

// TODO: migrar para auth proprio