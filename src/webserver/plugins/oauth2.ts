import Oauth, { FastifyOAuth2Options } from "@fastify/oauth2";
import { FastifyRequest } from "fastify";
import dotenv from "dotenv";

dotenv.config()

export const options: FastifyOAuth2Options = {
    name: "googleOauth2",
    scope: ["profile", "email"],
    credentials: {
        client: {
            id: process.env.GOOGLE_CLIENT_ID!,
            secret: process.env.GOOGLE_SECRET_TOKEN
        },
        auth: Oauth.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: "/login/google",
    callbackUri: `${process.env.DADOSABERTOS_HOST!}/login/google/callback`,
    callbackUriParams: {
        access_type: "offline",
        prompt: "consent"
    }
}

export default Oauth