import { randomUUID } from "node:crypto";
import type {
  ControlRequest,
  ControlResponse,
  Session,
  SessionEvent,
  SessionEventOf,
  SessionEventType,
  SessionListener,
  SessionResponseOptions,
  SessionSubscribeOptions,
  Unsubscribe
} from "./types.js";

export class LocalSession implements Session {
  readonly id: string;
  readonly requestId: string;
  private events: SessionEvent[] = [];
  private listeners = new Set<SessionListener>();

  constructor(request: ControlRequest, options: { id?: string } = {}) {
    this.id = options.id ?? randomUUID();
    this.requestId = request.id;
  }

  emit(event: SessionEvent) {
    this.events.push(event);

    for (const listener of this.listeners) {
      listener(event);
    }
  }

  onEvent(listener: SessionListener, options: SessionSubscribeOptions = {}): Unsubscribe {
    const replay = options.replay ?? true;
    this.listeners.add(listener);

    if (replay) {
      for (const event of this.events) {
        listener(event);
      }
    }

    return () => {
      this.listeners.delete(listener);
    };
  }

  on<TType extends SessionEventType>(
    type: TType,
    listener: SessionListener<SessionEventOf<TType>>,
    options?: SessionSubscribeOptions
  ): Unsubscribe {
    return this.onEvent((event) => {
      if (event.type === type) {
        listener(event as SessionEventOf<TType>);
      }
    }, options);
  }

  history() {
    return Object.freeze([...this.events]);
  }

  response<TPayload = undefined, TMeta = Record<string, unknown>>(
    options: SessionResponseOptions<TPayload, TMeta> = {}
  ): ControlResponse<TPayload, TMeta> {
    return {
      requestId: this.requestId,
      ok: options.ok ?? true,
      ...(options.payload === undefined ? {} : { payload: options.payload }),
      ...(options.meta === undefined ? {} : { meta: options.meta }),
      completedAt: new Date(),
      session: this
    };
  }
}
