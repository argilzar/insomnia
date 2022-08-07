/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";
import { StoredEvent } from "./stored-event";

export const protobufPackage = "DataPump";

export interface ProcessResult {
  success: boolean;
  error: string;
}

export const DATA_PUMP_PACKAGE_NAME = "DataPump";

export interface DataPumpServiceClient {
  processEvent(request: StoredEvent, ...rest: any): Observable<ProcessResult>;
}

export interface DataPumpServiceController {
  processEvent(
    request: StoredEvent,
    ...rest: any
  ): Promise<ProcessResult> | Observable<ProcessResult> | ProcessResult;
}

export function DataPumpServiceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["processEvent"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod("DataPumpService", method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcStreamMethod("DataPumpService", method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const DATA_PUMP_SERVICE_NAME = "DataPumpService";
