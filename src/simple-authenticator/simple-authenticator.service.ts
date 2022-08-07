import { Injectable, OnApplicationBootstrap } from "@nestjs/common";
import * as fs from "fs";
import * as path from "path";
import { InjectLogger } from "../logger/decorator/logger.decorator";
import { LoggerService } from "../logger/logger/logger.service";

export interface ValidKey {
  dataMesh: string;
  name: string;
  key: string;
}

@Injectable()
export class SimpleAuthenticatorService implements OnApplicationBootstrap {
  private validKeys: ValidKey[] = [];

  constructor(
    @InjectLogger(SimpleAuthenticatorService.name)
    private readonly logger: LoggerService,
  ) {}

  public onApplicationBootstrap() {
    try {
      const keysFile = JSON.parse(
        fs.readFileSync(
          path.join(__dirname, "..", "assets", "authorized_keys.json"),
          "utf8",
        ),
      );

      this.validKeys = keysFile.keys.map((key) => ({
        dataMesh: key.dataMesh,
        name: key.name,
        key: key.key,
      }));

      if (this.validKeys.length === 0) {
        this.logger.warn("No valid keys found");
      }
    } catch (e) {
      this.logger.error(`Could not read authorized_keys.json: ${e}`);
    }
  }

  public validate(authorization: string): ValidKey {
    return this.validKeys.find((key) => {
      if (key.key === authorization) {
        return key;
      }
    });
  }
}
