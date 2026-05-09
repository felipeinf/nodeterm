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
