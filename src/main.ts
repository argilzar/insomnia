import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { configuration } from "./config/app.configuration";
import { createSimpleLogger } from "./logger/factories";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
  const logger = createSimpleLogger(configuration());
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.enableCors();
  app.useLogger(logger);

  const config = await app.resolve(ConfigService);
  const port = config.get<number>("port");

  await app.listen(port, () => {
    logger.log(`Listening on port ${port}`);
  });
}

bootstrap();
