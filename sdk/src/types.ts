export type MaybePromise<T> = T | Promise<T>;

export type Actor = {
  id: string;
  name?: string;
};

export type ControlError = {
  message: string;
  code?: string;
};
