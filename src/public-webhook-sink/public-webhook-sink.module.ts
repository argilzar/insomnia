import { DynamicModule, Module } from "@nestjs/common";
import {
  AsyncOptions,
  createAsyncModule,
  createOptionsToken,
} from "@jbiskur/nestjs-async-module";
import { PublicWebhookSinkOptions } from "./public-webhook-sink-options.interface";
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from "@nestjs/microservices";
import { PublicWebhookSinkService } from "./public-webhook-sink.service";
import { PublicWebhookSinkController } from "./public-webhook-sink.controller";
import { SimpleAuthenticatorService } from "../simple-authenticator/simple-authenticator.service";

const optionsToken = createOptionsToken();

@Module({
  providers: [
    {
      provide: ClientProxy,
      inject: [optionsToken],
      useFactory: (options: PublicWebhookSinkOptions) =>
        ClientProxyFactory.create({
          transport: Transport.NATS,
          options: {
            servers: options.servers,
          },
        }),
    },
    PublicWebhookSinkService,
    SimpleAuthenticatorService,
  ],
  controllers: [PublicWebhookSinkController],
})
export class PublicWebhookSinkModule extends createAsyncModule<PublicWebhookSinkOptions>(
  optionsToken,
) {
  public static registerAsync(
    options: AsyncOptions<PublicWebhookSinkOptions>,
  ): DynamicModule {
    return super.registerAsync(options, PublicWebhookSinkModule);
  }
}
