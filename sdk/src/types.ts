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
