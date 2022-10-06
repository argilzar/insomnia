import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { configuration, validation } from "./config/app.configuration";
import { LoggerModuleBuilder } from "./logger/builder/logger-module.builder";
import { PublicWebhookSinkModule } from "./public-webhook-sink/public-webhook-sink.module";

const config = ConfigModule.forRoot({
  load: [configuration],
  validationSchema: validation,
});

@Module({
  imports: [
    config,
    new LoggerModuleBuilder().withConfig(config).build(),
    PublicWebhookSinkModule.registerAsync({
      imports: [config],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        servers: configService.get<string[]>("nats.servers"),
        producerId: configService.get<string>("dataMesh.producerId"),
        retention: configService.get<string>("dataMesh.retention"),
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
