import { FastifyInstance } from "fastify";
import Auth from "../../services/auth/queryHandler";
import fp from "fastify-plugin";

const auth = new Auth()

function Guard(app: FastifyInstance, options: never, done: any) {
    
    app.decorateRequest("user", null)
    app.decorateRequest("invalid_ws", false)

    app.addHook("onRequest", (req, res, done) => {
        const config = req.routeOptions.config

        if(config.useGuard === true) {
            const maskToken = req.headers.authorization || ""

            auth.getUserInfoFromDatabaseByMaskToken(maskToken).then(data => {
                if(data.expired) {
                    // refresh access token
                    auth.getCompleteSessionFromMaskToken(maskToken).then((Token: any) => {
                        auth.getUserRefreshTokenFromDatabaseByid(data.data?.id).then((refresh_token: any) => {
                            app.googleOauth2.getNewAccessTokenUsingRefreshToken({ access_token: Token.access_token, refresh_token: refresh_token.refresh_token, expires_at: Token.expires_at }).then(token_data => {
                                auth.updateMaskTokenAccessToken(maskToken, token_data.token.access_token, token_data.token.expires_at).then(() => {
                                    req.user = data.data
                                    done()
                                }).catch(error => {
                                    if(req.ws) {
                                        req.user = null
                                        req.invalid_ws = true
                                        done()
                                    } else {
                                        console.error(error)
                                        return res.status(422).send("Unprocessable Entity")
                                    }
                                })
                            })
                        })
                    })
                } else {
                    req.user = data.data
                    done()
                }
            }).catch(e => {
                if(e.code) {
                    if(req.ws) {
                        req.user = null
                        req.invalid_ws = true
                        done()
                    } else {
                        return res.status(401).send(e)
                    }
                } else {
                    if(req.ws) {
                        req.user = null
                        req.invalid_ws = true
                        done()
                    } else {
                        return res.status(422).send({
                            error: "Encontramos um erro e não podemos prosseguir com a request.",
                            code: "unknown_error"
                        })
                    }
                }
            })
        } else {
            done()
        }
    })

    done()
}

export default fp(Guard, {
    name: "FiscalizaJa Guard"
})