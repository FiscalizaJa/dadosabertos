import { RouteOptions } from "fastify";
import LoginController from "../controllers/AuthController";

const routes: RouteOptions[] = [
    {
        method: "GET",
        url: "/login/google/callback",
        handler: LoginController.LoginWithGoogle,
        schema: {
            hide: true
        }
    },
    {
        method: "GET",
        url: "/profile",
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