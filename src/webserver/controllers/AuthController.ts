import type { FastifyRequest, FastifyReply } from "fastify";
import Auth from "../../services/auth/queryHandler";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config()

const auth = new Auth()

function LoginWithGoogle(req: FastifyRequest, res: FastifyReply) {
    if(!this.googleOauth2.getAccessTokenFromAuthorizationCodeFlow) {
        return res.status(422).send({
            error: "Não podemos te identificar agora, por favor, faça login novamente.",
            code: "cannot_identify_now"
        })
    }

    this.googleOauth2.getAccessTokenFromAuthorizationCodeFlow(req, async (err: any, result: any) => {
        if(err) {
            console.error(err)
            return res.status(422).send({
                error: "Não foi possível processar sua solicitação.",
                code: "unprocessable_entity"
            })
        } else {
            const access_token = result.token.access_token
            const refresh_token = result.token.refresh_token
            const ttl = result.token.expires_at

            const userinfo: any = await auth.getFreshUserInfoFromAccess_token(access_token)
            
            if(!userinfo.email) {
                await this.googleOauth2.revokeToken(access_token)
                await this.googleOauth2.revokeToken(refresh_token)
                return res.status(400).send({
                    error: "Não foi possível obter acesso ao seu email. Nós precisamos dele para poder te identificar em nosso sistema. Revogamos a sua sessão, por favor, faça login novamente autorizando acesso ao email.",
                    code: "email_not_granted"
                })
            }

            await auth.createUserInDatabase({
                id: userinfo.id,
                email: userinfo.email,
                name: userinfo.name,
                activated: userinfo.verified_email,
                avatar_url: userinfo.picture,
                refresh_token: refresh_token || ""
            })

            const maskToken = await auth.findMaskTokenForAccessToken(access_token) || await auth.createMaskTokenFromAccessToken(access_token, refresh_token || "", userinfo.id, ttl)
            
            return res.redirect(`${process.env.FRONTEND_URL!}/logged?token=${maskToken}`)
        }
    })
}

async function SessionUserinfo(req: FastifyRequest, res: FastifyReply) {
    return {
        data: req.user
    }
}

export default {
    LoginWithGoogle,
    SessionUserinfo
}

function revokeAccessToken(access_token: string) {
    /* O plugin do Fastify é muito mal documentado e fica dando um erro totalmente do cara####, perdi a paciência e fiz minha própria função pra revogar o access token */
    return new Promise((resolve, reject) => {
        axios.post('https://oauth2.googleapis.com/revoke', null, {
            params: {
                token: access_token,
            },
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }).then(response => resolve(response.data)).catch(e => reject(e))
    })
}