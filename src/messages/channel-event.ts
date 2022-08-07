/* eslint-disable */
export const protobufPackage = "EventSource";

/** Bitemporal stored event https://en.wikipedia.org/wiki/Bitemporal_modeling */
export interface ChannelEvent {
  /** The timeuuid at which the event was recorded */
  eventId?: string | undefined;
  /** uuid of the data mesh */
  dataMesh: string;
  /** aggregator name (e.g. "website A") */
  aggregator: string;
  /** event type (e.g. "letter clicked") */
  eventType: string;
  /** metadata related to the event (e.g. url, user id, etc.) */
  metadata: { [key: string]: string };
  /** event data serialized to a string */
  serializedPayload: string;
  /** event timestamp, when this event is valid */
  validTime: string;
}

export interface ChannelEvent_MetadataEntry {
  key: string;
  value: string;
}

export const EVENT_SOURCE_PACKAGE_NAME = "EventSource";
