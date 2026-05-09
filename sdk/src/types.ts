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

export type Session = {
  readonly id: string;
  readonly requestId: string;
  emit(event: SessionEvent): void;
  onEvent(listener: SessionListener, options?: SessionSubscribeOptions): Unsubscribe;
  on<TType extends SessionEventType>(
    type: TType,
    listener: SessionListener<SessionEventOf<TType>>,
    options?: SessionSubscribeOptions
  ): Unsubscribe;
  history(): readonly SessionEvent[];
  response<TPayload = undefined, TMeta = Record<string, unknown>>(
    options?: SessionResponseOptions<TPayload, TMeta>
  ): ControlResponse<TPayload, TMeta>;
};

export type RuntimeContext = {
  createSession(request: ControlRequest, options?: { id?: string }): Session;
};

export type RuntimeHandler<
  TRequestPayload = unknown,
  TResponsePayload = unknown,
  TRequestMeta = Record<string, unknown>,
  TResponseMeta = Record<string, unknown>
> = (
  request: ControlRequest<TRequestPayload, TRequestMeta>,
  context: RuntimeContext
) => MaybePromise<ControlResponse<TResponsePayload, TResponseMeta>>;

export type ConnectorHandler<
  TRequestPayload = unknown,
  TResponsePayload = unknown,
  TRequestMeta = Record<string, unknown>,
  TResponseMeta = Record<string, unknown>
> = (
  request: ControlRequest<TRequestPayload, TRequestMeta>
) => Promise<ControlResponse<TResponsePayload, TResponseMeta>>;

export type Connector<
  TRequestPayload = unknown,
  TResponsePayload = unknown,
  TRequestMeta = Record<string, unknown>,
  TResponseMeta = Record<string, unknown>
> = {
  name: string;
  start(handler: ConnectorHandler<TRequestPayload, TResponsePayload, TRequestMeta, TResponseMeta>): Promise<void>;
  stop(): Promise<void>;
};

export type ControlRuntime = {
  start(): Promise<void>;
  stop(): Promise<void>;
  isRunning(): boolean;
};
