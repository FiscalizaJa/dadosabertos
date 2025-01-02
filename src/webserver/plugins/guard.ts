import { FastifyInstance } from "fastify";
import Auth from "../../services/auth/queryHandler";
import fp from "fastify-plugin";
import sessionUtils from "../../services/auth/sessionUtils";

const auth = new Auth()

function Guard(app: FastifyInstance, options: never, done: any) {
    
    app.decorateRequest("user", null)
    app.decorateRequest("invalid_ws", false)

    app.addHook("onRequest", (req, res, done) => {
        const config = req.routeOptions.config

        if(config.useGuard === true) {
            const jwtToken = req.headers.authorization || ""

            sessionUtils.getJWTpayload(jwtToken).then(user => {
                req.user = user
                done()
            }).catch(error => {
                if(req.ws) {
                    req.user = null
                    req.invalid_ws = true
                    done()
                } else {
                    console.error(error)
                    return res.status(401).send("Access not allowed")
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