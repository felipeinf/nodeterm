# @nodeterm/sdk

Generic Node.js SDK for communication between a local machine and external tools.

The SDK only provides contracts, runtime orchestration, and session events. It does not execute commands, restrict commands, pick directories, manage shells, or know about Telegram. Product logic belongs in the application using the SDK.

## Install

```bash
npm install @nodeterm/sdk
```

## Simple Request/Response

```ts
import { createRuntime } from "@nodeterm/sdk";

const runtime = createRuntime({
  connectors: [connector],
  async handler(request) {
    return {
      requestId: request.id,
      ok: true,
      payload: {
        received: request.payload
      },
      completedAt: new Date()
    };
  }
});

await runtime.start();
```

## Streaming Session

Use sessions for long outputs, long-running processes, or interactive tools.

```ts
import { createRuntime } from "@nodeterm/sdk";

const runtime = createRuntime({
  connectors: [connector],
  async handler(request, context) {
    const session = context.createSession(request);

    session.emit({
      type: "output",
      stream: "stdout",
      data: "started\n"
    });

    session.emit({
      type: "done",
      exitCode: 0
    });

    return session.response();
  }
});

await runtime.start();
```

Session events emitted before a connector subscribes are replayed by default, so short-lived handlers can emit and return without losing output.
