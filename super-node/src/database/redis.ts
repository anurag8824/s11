import { createClient } from "redis";

export const redisReplica = createClient({
  //  url:  "redis://:wvGLXqhDvbPcpDv7UrnIglB@172.236.19.246:6379",
  url:  process.env.REDIS_URL_REPLICA,
});
export const redisReplicaSub = redisReplica.duplicate();
redisReplica.on("error", (err) => console.log("Redis replica Error", err));
redisReplica.on("connect", () => console.log("Redis connected"));
(async () => {
  await redisReplica.connect();
  await redisReplicaSub.connect();
})();

export const redisSuperNode = createClient({
  url:"redis://localhost:6379",
  // process.env.REDIS_URL_SUPER_NODE_FOR_BMa
});

redisSuperNode.on("error", (err) =>
  console.log("redisSuperNode Client Error:===", err.message)
);
redisSuperNode.on("connect", () => console.log("redisSuperNode connected"));
(async () => {
  await redisSuperNode.connect();
})();

const redis = createClient({
  url:"redis://localhost:6379",
  // process.env.REDIS_URL ||
});
redis.on("error", (err) => console.log("Redis Client Error:===", err));
redis.on("connect", () => console.log("Redis connected"));
(async () => {
  await redis.connect();
})();

export default redis;
