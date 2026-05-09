import type {
  Actor,
  Connector,
  ConnectorHandler,
  ControlResponse
} from "../types.js";

export type MemoryRequestOptions<TMeta = Record<string, unknown>> = {
  id?: string;
  source?: string;
  actor?: Actor;
  meta?: TMeta;
  receivedAt?: Date;
};

export class MemoryConnector<
  TRequestPayload = unknown,
  TResponsePayload = unknown,
  TRequestMeta = Record<string, unknown>,
  TResponseMeta = Record<string, unknown>
> implements Connector<TRequestPayload, TResponsePayload, TRequestMeta, TResponseMeta> {
  readonly responses: ControlResponse<TResponsePayload, TResponseMeta>[] = [];
  private handler: ConnectorHandler<TRequestPayload, TResponsePayload, TRequestMeta, TResponseMeta> | undefined;
  private started = false;

  constructor(readonly name = "memory") {}

  async start(handler: ConnectorHandler<TRequestPayload, TResponsePayload, TRequestMeta, TResponseMeta>) {
    this.handler = handler;
    this.started = true;
  }

  async stop() {
    this.handler = undefined;
    this.started = false;
  }

  isStarted() {
    return this.started;
  }
