import express from "express";
import Redis from "ioredis";
import client from "prom-client";

// --- Config ---
const PORT = process.env.PORT || 3000;
const REDIS_HOST = process.env.REDIS_HOST || "redis";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379", 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "";
const APP_NAME = process.env.APP_NAME || "node-redis-app";

// --- Redis client ---
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD || undefined,
  lazyConnect: true,
  retryStrategy: (times) => Math.min(times * 50, 2000),
});

// --- Prometheus metrics ---
client.collectDefaultMetrics({ prefix: `${APP_NAME}_` });

const httpRequestCounter = new client.Counter({
  name: `${APP_NAME}_http_requests_total`,
  help: "Total HTTP requests",
  labelNames: ["method", "route", "status"],
});
const httpDuration = new client.Histogram({
  name: `${APP_NAME}_http_request_duration_seconds`,
  help: "HTTP request duration in seconds",
  labelNames: ["method", "route", "status"],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const app = express();

// simple middleware to time requests
app.use((req, res, next) => {
  const end = httpDuration.startTimer({ method: req.method, route: req.path });
  res.on("finish", () => {
    end({ status: String(res.statusCode) });
    httpRequestCounter.inc({ method: req.method, route: req.path, status: String(res.statusCode) });
  });
  next();
});

// health endpoints
app.get("/healthz", (_req, res) => res.status(200).send("ok"));
app.get("/readyz", async (_req, res) => {
  try {
    await redis.ping();
    res.status(200).send("ready");
  } catch {
    res.status(500).send("redis not ready");
  }
});

// app routes using Redis (stateful)
app.get("/", async (_req, res) => {
  const hits = await redis.get("hits");
  res.send(`Hello from ${APP_NAME}! Total hits so far: ${hits || 0}\n`);
});

app.post("/hit", async (_req, res) => {
  const n = await redis.incr("hits");
  res.send(`hit recorded. total=${n}\n`);
});

app.get("/count", async (_req, res) => {
  const n = await redis.get("hits");
  res.send(`${n || 0}\n`);
});

// expose metrics
app.get("/metrics", async (_req, res) => {
  res.set("Content-Type", client.register.contentType);
  res.end(await client.register.metrics());
});

// start
(async () => {
  try {
    await redis.connect();
    app.listen(PORT, () => console.log(`listening on :${PORT}`));
  } catch (e) {
    console.error("startup error", e);
    process.exit(1);
  }
})();

