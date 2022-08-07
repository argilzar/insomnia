import { DynamicModule } from "@nestjs/common";

export abstract class BaseBuilder {
  protected config: DynamicModule;

  withConfig(config: DynamicModule): this {
    this.config = config;
    return this;
  }

  abstract build(): DynamicModule;
}
