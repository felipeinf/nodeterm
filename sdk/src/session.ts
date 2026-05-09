import { randomUUID } from "node:crypto";
import type {
  ControlRequest,
  Session,
  SessionEvent,
  SessionListener,
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
