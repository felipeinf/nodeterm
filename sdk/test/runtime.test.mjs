import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRuntime } from "../dist/index.js";
import { MemoryConnector } from "../dist/testing/index.js";

describe("createRuntime", () => {
  it("starts and stops all connectors", async () => {
    const connectorA = new MemoryConnector("a");
    const connectorB = new MemoryConnector("b");
    const runtime = createRuntime({
      connectors: [connectorA, connectorB],
      async handler(request) {
        return {
          requestId: request.id,
          ok: true,
          completedAt: new Date()
        };
      }
    });

    await runtime.start();
    assert.equal(runtime.isRunning(), true);
    assert.equal(connectorA.isStarted(), true);
    assert.equal(connectorB.isStarted(), true);

    await runtime.stop();
    assert.equal(runtime.isRunning(), false);
    assert.equal(connectorA.isStarted(), false);
    assert.equal(connectorB.isStarted(), false);
  });

  it("passes a request to the handler and returns a simple response", async () => {
    const connector = new MemoryConnector("memory");
    const runtime = createRuntime({
      connectors: [connector],
      async handler(request) {
        return {
          requestId: request.id,
          ok: true,
          payload: { echoed: request.payload.text },
          completedAt: new Date()
        };
      }
    });

    await runtime.start();
    const response = await connector.send(
      { text: "hello" },
      {
        id: "req-1",
        source: "test",
        actor: { id: "user-1", name: "User One" },
        meta: { channel: "telegram" },
        receivedAt: new Date("2026-01-01T00:00:00.000Z")
      }
    );

    assert.equal(response.requestId, "req-1");
    assert.equal(response.ok, true);
    assert.deepEqual(response.payload, { echoed: "hello" });
    await runtime.stop();
  });

  it("preserves payload, actor, source, and meta without policy changes", async () => {
    const connector = new MemoryConnector("memory");
    let captured;
    const runtime = createRuntime({
      connectors: [connector],
      async handler(request) {
        captured = request;
        return {
          requestId: request.id,
          ok: true,
          completedAt: new Date()
        };
      }
    });

    const receivedAt = new Date("2026-01-02T00:00:00.000Z");
    await runtime.start();
    await connector.send(
      { command: "anything --unsafe" },
      {
        id: "req-2",
        source: "custom-tool",
        actor: { id: "actor-1", name: "Feli" },
        meta: { any: ["shape", 123] },
        receivedAt
      }
    );

    assert.deepEqual(captured, {
      id: "req-2",
      source: "custom-tool",
      actor: { id: "actor-1", name: "Feli" },
      payload: { command: "anything --unsafe" },
      meta: { any: ["shape", 123] },
      receivedAt
    });
    await runtime.stop();
  });

  it("returns session events to connectors, including replayed events", async () => {
    const connector = new MemoryConnector("memory");
    const runtime = createRuntime({
      connectors: [connector],
      async handler(request, context) {
        const session = context.createSession(request, { id: "session-1" });
        session.emit({ type: "output", stream: "stdout", data: "started\n" });
        session.emit({ type: "done", exitCode: 0 });
        return session.response();
      }
    });

    await runtime.start();
    const response = await connector.send({ job: "stream" }, { id: "req-3" });
    const events = [];
    response.session.onEvent((event) => events.push(event));

    assert.equal(response.ok, true);
    assert.equal(response.session.id, "session-1");
    assert.deepEqual(events, [
      { type: "output", stream: "stdout", data: "started\n" },
      { type: "done", exitCode: 0 }
    ]);
    await runtime.stop();
  });

  it("routes input, resize, and close events to the session", async () => {
    const connector = new MemoryConnector("memory");
    const received = [];
    const runtime = createRuntime({
      connectors: [connector],
      async handler(request, context) {
        const session = context.createSession(request);
        session.on("input", (event) => received.push(event));
        session.on("resize", (event) => received.push(event));
        session.on("close", (event) => received.push(event));
        return session.response();
      }
    });

    await runtime.start();
    const response = await connector.send({ job: "interactive" });
    response.session.emit({ type: "input", data: "ls\n" });
    response.session.emit({ type: "resize", cols: 120, rows: 40 });
    response.session.emit({ type: "close", reason: "client disconnected" });

    assert.deepEqual(received, [
      { type: "input", data: "ls\n" },
      { type: "resize", cols: 120, rows: 40 },
      { type: "close", reason: "client disconnected" }
    ]);
    await runtime.stop();
  });
