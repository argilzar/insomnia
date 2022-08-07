import { Injectable, LoggerService } from "@nestjs/common";
import { InjectLogger } from "../logger/decorator/logger.decorator";
import { ClientProxy } from "@nestjs/microservices";
import { EVENT_INGESTION_TOPIC, METADATA_PRODUCER_NAME } from "../constants";
import { ChannelEvent } from "../messages/channel-event";
import { ValidKey } from "../simple-authenticator/simple-authenticator.service";
import * as dayjs from "dayjs";
import * as utc from "dayjs/plugin/utc";

dayjs.extend(utc);

@Injectable()
export class PublicWebhookSinkService {
  constructor(
    @InjectLogger(PublicWebhookSinkService.name)
    private readonly logger: LoggerService,
    private readonly client: ClientProxy,
  ) {}

  public async storeEvent(
    validKey: ValidKey,
    aggregator: string,
    eventType: any,
    eventPayload: any,
    validTime?: Date,
  ) {
    const metadata = {} as { [key: string]: string };
    metadata[METADATA_PRODUCER_NAME] = validKey.name;

    this.logger.debug(
      `Storing event ${eventType} for ${aggregator} at ${dayjs()
        .utc()
        .format()} with metadata ${JSON.stringify(metadata)}`,
    );

    await this.client.emit<ChannelEvent>(EVENT_INGESTION_TOPIC, {
      dataMesh: validKey.dataMesh,
      aggregator,
      eventType,
      metadata,
      serializedPayload: JSON.stringify(eventPayload),
      validTime: dayjs(validTime).utc().format(),
    });
  }
}
