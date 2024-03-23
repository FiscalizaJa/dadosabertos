import { RouteOptions } from "fastify";
import HelloWorldController from "../controllers/HelloWorldController";

const routes: RouteOptions[] = [
    {
        method: "GET",
        url: "/",
        handler: HelloWorldController.SendHelloWorld
    }
]

export default routes