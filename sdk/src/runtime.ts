import type {
  Connector,
  ControlRuntime,
  RuntimeHandler
} from "./types.js";

export type RuntimeOptions<
  TRequestPayload = unknown,
  TResponsePayload = unknown,
  TRequestMeta = Record<string, unknown>,
  TResponseMeta = Record<string, unknown>
> = {
  connectors: readonly Connector<TRequestPayload, TResponsePayload, TRequestMeta, TResponseMeta>[];
  handler: RuntimeHandler<TRequestPayload, TResponsePayload, TRequestMeta, TResponseMeta>;
};

export function createRuntime<
  TRequestPayload = unknown,
  TResponsePayload = unknown,
  TRequestMeta = Record<string, unknown>,
  TResponseMeta = Record<string, unknown>
>(
  options: RuntimeOptions<TRequestPayload, TResponsePayload, TRequestMeta, TResponseMeta>
): ControlRuntime {
  return new DefaultRuntime(options);
}

class DefaultRuntime<
  TRequestPayload,
  TResponsePayload,
  TRequestMeta,
  TResponseMeta
> implements ControlRuntime {
  private running = false;

  constructor(
    private readonly options: RuntimeOptions<TRequestPayload, TResponsePayload, TRequestMeta, TResponseMeta>
  ) {}

  async start() {
    if (this.running) return;

    await Promise.all(this.options.connectors.map((connector) => {
      return connector.start((request) => this.handle(request));
    }));

    this.running = true;
  }

  async stop() {
    if (!this.running) return;

    await Promise.all(this.options.connectors.map((connector) => connector.stop()));
    this.running = false;
  }

  isRunning() {
    return this.running;
  }

  private async handle(
    request: import("./types.js").ControlRequest<TRequestPayload, TRequestMeta>
  ): Promise<import("./types.js").ControlResponse<TResponsePayload, TResponseMeta>> {
    throw new Error("not implemented");
  }
}
