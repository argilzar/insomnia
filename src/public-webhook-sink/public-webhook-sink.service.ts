import { Injectable, LoggerService } from "@nestjs/common";
import { InjectLogger } from "../logger/decorator/logger.decorator";
import { ClientProxy } from "@nestjs/microservices";
import {
  EVENT_INGESTION_TOPIC,
  METADATA_PRODUCER_NAME,
  METADATA_TTL_ON_STORED_EVENT,
  NOTIFY_ON_STORED_EVENT,
} from "../constants";
import { ChannelEvent } from "../messages/channel-event";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";
import { ModuleOptions } from "@jbiskur/nestjs-async-module";
import { PublicWebhookSinkOptions } from "./public-webhook-sink-options.interface";

dayjs.extend(utc);

@Injectable()
export class PublicWebhookSinkService {
  constructor(
    @InjectLogger(PublicWebhookSinkService.name)
    private readonly logger: LoggerService,
    private readonly client: ClientProxy,
    private readonly options: ModuleOptions<PublicWebhookSinkOptions>,
  ) {}

  public async storeEvent(
    identifier: string,
    aggregator: string,
    eventType: any,
    eventPayload: any,
    validTime?: Date,
  ) {
    const metadata = {} as { [key: string]: string };
    metadata[METADATA_PRODUCER_NAME] = this.options.get().producerId;
    metadata[METADATA_TTL_ON_STORED_EVENT] = this.calculateTTL().toString();
    metadata[NOTIFY_ON_STORED_EVENT] = "true";

    this.logger.debug(
      `Storing event ${eventType} for ${aggregator} at ${dayjs()
        .utc()
        .format()} with metadata ${JSON.stringify(metadata)}`,
    );

    await this.client.emit<ChannelEvent>(EVENT_INGESTION_TOPIC, {
      dataMesh: identifier,
      aggregator,
      eventType,
      metadata,
      serializedPayload: JSON.stringify(eventPayload),
      validTime: dayjs(validTime).utc().format(),
    });
  }

  private calculateTTL(): number {
    const ttl = this.options.get().retention;

    const prefix = ttl.at(-1);

    switch (prefix) {
      case "d":
        return parseInt(ttl.slice(0, -1)) * 24 * 60 * 60;
      case "h":
        return parseInt(ttl.slice(0, -1)) * 60 * 60;
      case "m":
        return parseInt(ttl.slice(0, -1)) * 60;
      case "s":
        return parseInt(ttl.slice(0, -1));
    }
  }
}
