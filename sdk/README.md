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
