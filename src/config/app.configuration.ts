import * as Joi from "joi";

export const configuration = () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  logger: {
    level: process.env.LOG_LEVEL || "info",
    pretty: process.env.LOG_PRETTY_PRINT === "true",
    useLabels: process.env.LOG_LEVEL_LABELS === "true",
  },
  nats: {
    servers: process.env.NATS_SERVERS.split(","),
    queue: process.env.NATS_QUEUE,
  },
});

export const validation = Joi.object({
  PORT: Joi.number().integer().min(0).default(3000),
  LOG_LEVEL: Joi.string()
    .valid("debug", "info", "warn", "error")
    .default("info"),
  LOG_PRETTY_PRINT: Joi.boolean().default(false),
  LOG_LEVEL_LABELS: Joi.boolean().default(false),
  NATS_SERVERS: Joi.string().default("nats://localhost:4222"),
  NATS_QUEUE: Joi.string().default("ingestion-channel"),
});
