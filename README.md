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

## Interactive Input

Connectors can send input, resize, and close events through the same session channel. A future CLI can map these events to `node-pty`, while a Telegram connector can map them to chat messages.

```ts
async handler(request, context) {
  const session = context.createSession(request);

  session.on("input", (event) => {
    process.stdout.write(event.data);
  });

  session.on("resize", (event) => {
    console.log(`resize ${event.cols}x${event.rows}`);
  });

  session.on("close", () => {
    console.log("session closed");
  });

  return session.response();
}
```

## Test Connector

`MemoryConnector` is exported from `@nodeterm/sdk/testing` for tests and examples.

```ts
import { createRuntime } from "@nodeterm/sdk";
import { MemoryConnector } from "@nodeterm/sdk/testing";

const connector = new MemoryConnector();
const runtime = createRuntime({
  connectors: [connector],
  async handler(request) {
    return {
      requestId: request.id,
      ok: true,
      payload: request.payload,
      completedAt: new Date()
    };
  }
});

await runtime.start();
const response = await connector.send({ text: "hello" });
```

## Development

```bash
cd sdk
npm install
npm run build
npm test
npm pack --dry-run
```
