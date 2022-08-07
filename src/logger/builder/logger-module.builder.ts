import { LoggerModule } from "../logger.module";
import { BaseBuilder } from "../../builder/base.builder";
import { ConfigService } from "@nestjs/config";

export class LoggerModuleBuilder extends BaseBuilder {
  build() {
    return LoggerModule.forRootAsync({
      imports: [this.config],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        level: config.get<string>("logger.level"),
        useLevelLabels: config.get<boolean>("logger.useLabels"),
        pretty: config.get<boolean>("logger.pretty"),
      }),
    });
  }
}
