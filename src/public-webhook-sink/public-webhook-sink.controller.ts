import {
  BadRequestException,
  Body,
  Controller,
  Headers,
  Param,
  Post,
  Query,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectLogger } from "../logger/decorator/logger.decorator";
import { LoggerService } from "../logger/logger/logger.service";
import * as _ from "lodash";
import { SimpleAuthenticatorService } from "../simple-authenticator/simple-authenticator.service";
import { PublicWebhookSinkService } from "./public-webhook-sink.service";

@Controller()
export class PublicWebhookSinkController {
  constructor(
    @InjectLogger(PublicWebhookSinkController.name)
    private readonly logger: LoggerService,
    private readonly authentication: SimpleAuthenticatorService,
    private readonly sinkService: PublicWebhookSinkService,
  ) {}

  @Post("/:aggregator/:eventType")
  async storeEvent(
    @Param("aggregator") aggregator: string,
    @Param("eventType") eventType: any,
    @Body() event: any,
    @Query("Identifier") identifier: string,
    @Query("validTime") validTime?: Date,
  ) {
    if (_.isEmpty(identifier)) {
      this.logger.error("No Identifier header found");
      throw new BadRequestException("No Identifier header found");
    }

    //TODO: validate Identifier header against a valid data mesh identifier

    this.logger.debug(
      `Received event ${eventType} for ${identifier}/${aggregator}`,
      event,
    );

    if (!event || !_.isPlainObject(event) || _.isEmpty(event)) {
      this.logger.error(
        `Invalid event ${eventType} for ${identifier}/${aggregator}`,
        event,
      );
      throw new BadRequestException(
        `Invalid event ${eventType} for ${identifier}/${aggregator}`,
      );
    }

    await this.sinkService.storeEvent(
      identifier,
      aggregator,
      eventType,
      event,
      validTime,
    );
  }
}
