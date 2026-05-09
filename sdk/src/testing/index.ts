import { randomUUID } from "node:crypto";
import type {
  Actor,
  Connector,
  ConnectorHandler,
  ControlRequest,
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

  async send(
    payload: TRequestPayload,
    options: MemoryRequestOptions<TRequestMeta> = {}
  ): Promise<ControlResponse<TResponsePayload, TResponseMeta>> {
    return this.dispatch({
      id: options.id ?? randomUUID(),
      source: options.source ?? this.name,
      ...(options.actor === undefined ? {} : { actor: options.actor }),
      payload,
      ...(options.meta === undefined ? {} : { meta: options.meta }),
      receivedAt: options.receivedAt ?? new Date()
    });
  }

  async dispatch(
    request: ControlRequest<TRequestPayload, TRequestMeta>
  ): Promise<ControlResponse<TResponsePayload, TResponseMeta>> {
    if (!this.handler) {
      throw new Error(`MemoryConnector "${this.name}" is not started.`);
    }

    const response = await this.handler(request);
    this.responses.push(response);
    return response;
  }
}
