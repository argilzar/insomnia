import {
  BadRequestException,
  Body,
  CACHE_MANAGER,
  Controller,
  Get,
  Headers,
  Inject,
  Param,
  Post,
  Query,
} from "@nestjs/common";
import { Cache } from "cache-manager";
import { InjectLogger } from "../logger/decorator/logger.decorator";
import { LoggerService } from "../logger/logger/logger.service";
import * as _ from "lodash";
import { PublicWebhookSinkService } from "./public-webhook-sink.service";
import { ModuleOptions } from "@jbiskur/nestjs-async-module";
import { PublicWebhookSinkOptions } from "./public-webhook-sink-options.interface";
import { RealIP } from "nestjs-real-ip";
import * as bcrypt from "bcrypt";

@Controller()
export class PublicWebhookSinkController {
  constructor(
    @InjectLogger(PublicWebhookSinkController.name)
    private readonly logger: LoggerService,
    private readonly sinkService: PublicWebhookSinkService,
    private readonly options: ModuleOptions<PublicWebhookSinkOptions>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Get("/getBrowserInfo")
  async get(
    @RealIP() ip: string,
    @Headers("user-agent") ua: string,
    @Headers("host") host: string,
  ) {
    const salt = await this.getSaltValue();
    const domain = "a.fo";
    return {
      ip,
      domain,
      host,
      ua,
      fingerprint: await bcrypt.hash(ip + ua + domain, salt),
    };
  }

  @Post("/:aggregator/:eventType")
  async storeEvent(
    @Param("aggregator") aggregator: string,
    @Param("eventType") eventType: any,
    @Body() event: any,
    @RealIP() ip: string,
    @Query("validTime") validTime?: Date,
  ) {
    this.logger.debug(
      `Received event ${eventType} for analytics/${aggregator} from ip${ip}`,
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

  async getSaltValue(): Promise<string> {
    const date_ob = new Date();
    const date = ("0" + date_ob.getDate()).slice(-2);
    const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    const year = date_ob.getFullYear();
    const saltKey = `salt-key-${year}-${month}-${date}`;

    this.logger.debug(`Current salt key: ${saltKey}`);

    const saltValue: string = await this.cacheManager.get(saltKey);
    if (!saltValue) {
      const salt = await bcrypt.genSalt();
      await this.cacheManager.set(saltKey, salt, 60 * 60 * 24); //One day it will switch keys automatically next day
      return salt;
    } else {
      return saltValue;
    }
  }
}
