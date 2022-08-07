import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { configuration, validation } from "./config/app.configuration";
import { LoggerModuleBuilder } from "./logger/builder/logger-module.builder";
import { PublicWebhookSinkModule } from "./public-webhook-sink/public-webhook-sink.module";
import { SimpleAuthenticatorService } from "./simple-authenticator/simple-authenticator.service";

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
      }),
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
