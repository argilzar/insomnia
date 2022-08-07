/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "EventSource";

export interface SearchInput {
  dataMesh: string;
  aggregator: string;
  eventTypes: string[];
  timebucket: string;
  afterEventId?: string | undefined;
  beforeEventId?: string | undefined;
  cursor?: string | undefined;
  limit?: number | undefined;
}

export interface StoredEventResult {
  events: StoredEvent[];
  cursor?: string | undefined;
  fetchedEvents: number;
}

/** Bitemporal stored event https://en.wikipedia.org/wiki/Bitemporal_modeling */
export interface StoredEvent {
  /** time uuid of the event, when it was stored */
  eventId: string;
  /** uuid of the data mesh */
  dataMesh: string;
  /** aggregator name (e.g. "website A") */
  aggregator: string;
  /** event type (e.g. "letter clicked") */
  eventType: string;
  /** timebucket of the event, when it was stored */
  timeBucket: string;
  /** metadata related to the event (e.g. url, user id, etc.) */
  metadata: { [key: string]: string };
  /** event data serialized to a string */
  serializedPayload: string;
  /** event timestamp, when this event is valid */
  validTime: string;
}

export interface StoredEvent_MetadataEntry {
  key: string;
  value: string;
}

export const EVENT_SOURCE_PACKAGE_NAME = "EventSource";

export interface EventSourceClient {
  getEvents(request: SearchInput, ...rest: any): Observable<StoredEventResult>;
}

export interface EventSourceController {
  getEvents(
    request: SearchInput,
    ...rest: any
  ):
    | Promise<StoredEventResult>
    | Observable<StoredEventResult>
    | StoredEventResult;
}

export function EventSourceControllerMethods() {
  return function (constructor: Function) {
    const grpcMethods: string[] = ["getEvents"];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(
        constructor.prototype,
        method,
      );
      GrpcMethod("EventSource", method)(
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
      GrpcStreamMethod("EventSource", method)(
        constructor.prototype[method],
        method,
        descriptor,
      );
    }
  };
}

export const EVENT_SOURCE_SERVICE_NAME = "EventSource";
