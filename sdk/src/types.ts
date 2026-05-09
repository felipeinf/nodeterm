export type MaybePromise<T> = T | Promise<T>;

export type Actor = {
  id: string;
  name?: string;
};

export type ControlError = {
  message: string;
  code?: string;
};

export type ControlRequest<
  TPayload = unknown,
  TMeta = Record<string, unknown>
> = {
  id: string;
  source: string;
  actor?: Actor;
  payload: TPayload;
  meta?: TMeta;
  receivedAt: Date;
};

export type ControlResponse<
  TPayload = unknown,
  TMeta = Record<string, unknown>
> = {
  requestId: string;
  ok: boolean;
  payload?: TPayload;
  error?: ControlError;
  meta?: TMeta;
  completedAt: Date;
  session?: Session;
};

export type OutputSessionEvent = {
  type: "output";
  stream: "stdout" | "stderr";
  data: string;
};

export type InputSessionEvent = {
  type: "input";
  data: string;
};

export type ResizeSessionEvent = {
  type: "resize";
  cols: number;
  rows: number;
};

export type ErrorSessionEvent = {
  type: "error";
  message: string;
  code?: string;
};

export type DoneSessionEvent = {
  type: "done";
  exitCode?: number;
};

export type CloseSessionEvent = {
  type: "close";
  reason?: string;
};

export type SessionEvent =
  | OutputSessionEvent
  | InputSessionEvent
  | ResizeSessionEvent
  | ErrorSessionEvent
  | DoneSessionEvent
  | CloseSessionEvent;

export type SessionEventType = SessionEvent["type"];
export type SessionEventOf<TType extends SessionEventType> = Extract<SessionEvent, { type: TType }>;
export type SessionListener<TEvent extends SessionEvent = SessionEvent> = (event: TEvent) => void;
export type Unsubscribe = () => void;

export type SessionSubscribeOptions = {
  replay?: boolean;
};

export type SessionResponseOptions<
  TPayload = unknown,
  TMeta = Record<string, unknown>
> = {
  ok?: boolean;
  payload?: TPayload;
  meta?: TMeta;
};
