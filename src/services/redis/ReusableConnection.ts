import ioredis from "ioredis";

let GlobalRedisConnection = global.GLOBAL_REDIS_CONN

if(!GlobalRedisConnection) {
    GlobalRedisConnection = new ioredis(process.env.FISCALIZAJA_REDIS_URL)
    global.GLOBAL_REDIS_CONN = GlobalRedisConnection
}


export default GlobalRedisConnection

declare global {
    var GLOBAL_REDIS_CONN: ioredis
}