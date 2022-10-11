import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { InjectLogger } from "../logger/decorator/logger.decorator";
import { LoggerService } from "../logger/logger/logger.service";
import * as _ from "lodash";
import { PublicWebhookSinkService } from "./public-webhook-sink.service";
import { ModuleOptions } from "@jbiskur/nestjs-async-module";
import { PublicWebhookSinkOptions } from "./public-webhook-sink-options.interface";

@Controller()
export class PublicWebhookSinkController {
  constructor(
    @InjectLogger(PublicWebhookSinkController.name)
    private readonly logger: LoggerService,
    private readonly sinkService: PublicWebhookSinkService,
    private readonly options: ModuleOptions<PublicWebhookSinkOptions>,
  ) {}

  @Post("/:aggregator/:eventType")
  async storeEvent(
    @Param("aggregator") aggregator: string,
    @Param("eventType") eventType: any,
    @Body() event: any,
    @Query("validTime") validTime?: Date,
  ) {
    this.logger.debug(
      `Received event ${eventType} for analytics/${aggregator}`,
      event,
    );

    if (!event || !_.isPlainObject(event) || _.isEmpty(event)) {
      this.logger.error(
        `Invalid event ${eventType} for analytics/${aggregator}`,
        event,
      );
      throw new BadRequestException(
        `Invalid event ${eventType} for analytics/${aggregator}`,
      );
    }
    const identifier = this.options.get().producerId;
    await this.sinkService.storeEvent(
      identifier,
      aggregator,
      eventType,
      event,
      validTime,
    );
  }
}
