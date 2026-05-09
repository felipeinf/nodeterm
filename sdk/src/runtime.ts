import type {
  Connector,
  ControlRequest,
  ControlResponse,
  ControlRuntime,
  RuntimeContext,
  RuntimeHandler
} from "./types.js";
import { LocalSession } from "./session.js";

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
    request: ControlRequest<TRequestPayload, TRequestMeta>
  ): Promise<ControlResponse<TResponsePayload, TResponseMeta>> {
    const context: RuntimeContext = {
      createSession(sessionRequest, options) {
        return new LocalSession(sessionRequest, options);
      }
    };

    try {
      return await this.options.handler(request, context);
    } catch (error) {
      return {
        requestId: request.id,
        ok: false,
        error: {
          message: error instanceof Error ? error.message : String(error)
        },
        completedAt: new Date()
      };
    }
  }
}
