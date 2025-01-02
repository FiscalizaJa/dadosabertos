import { RouteOptions } from "fastify";
import LoginController from "../controllers/AuthController";

const routes: RouteOptions[] = [
    {
        method: "POST",
        url: "/auth/register",
        handler: LoginController.Register,
        schema: {
            hide: true
        }
    },
    {
        method: "GET",
        url: "/auth/activate/:ac_token",
        handler: LoginController.ActivateAccount,
        schema: {
            hide: true
        }
    },
    {
        method: "POST",
        url: "/auth/login",
        handler: LoginController.Login,
        schema: {
            hide: true
        }
    },
    {
        method: "GET",
        url: "/auth/profile",
        handler: LoginController.SessionUserinfo,
        config: {
            useGuard: true
        },
        schema: {
            hide: true,
            headers: {
                type: "object",
                properties: {
                    authorization: {
                        type: "string"
                    }
                },
                required: ["authorization"]
            }
        }
    }
]

export default routes