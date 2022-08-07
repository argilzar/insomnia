import {
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
    @Headers("Authorization") authorization: string,
    @Query("validTime") validTime?: Date,
  ) {
    if (_.isEmpty(authorization)) {
      this.logger.error("No authorization header found");
      throw new UnauthorizedException("No authorization header found");
    }

    const validKey = this.authentication.validate(authorization);

    if (!validKey) {
      this.logger.error("Invalid authorization key");
      throw new UnauthorizedException("Invalid authorization key");
    }

    this.logger.debug(
      `Received event ${eventType} for ${validKey.dataMesh}/${aggregator}`,
      event,
    );

    if (!event || !_.isPlainObject(event) || _.isEmpty(event)) {
      this.logger.error(
        `Invalid event ${eventType} for ${validKey.dataMesh}/${aggregator}`,
        event,
      );
    }

    await this.sinkService.storeEvent(
      validKey,
      aggregator,
      eventType,
      event,
      validTime,
    );
  }
}
