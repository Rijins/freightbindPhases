// Smoke test for the frontend socket event manager (no network, no React).
// Run from freightbind-frontend:  node scripts/eventManagerSmokeTest.js
// Covers: duplicate-listener prevention, symmetric off, offAll cleanup,
// attach/detach symmetry, and non-function handler rejection.

import assert from "node:assert/strict";
import SocketEventManager from "../src/socket/socketEventManager.js";

let failures = 0;
const test = (name, fn) => {
  try {
    fn();
    console.log(`  ok - ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`  FAIL - ${name}\n    ${error.message}`);
  }
};

const createFakeSocket = () => {
  const calls = { on: [], off: [] };
  const socket = {
    on: (event, handler) => calls.on.push([event, handler]),
    off: (event, handler) => calls.off.push([event, handler]),
  };
  return { socket, calls };
};

console.log("socketEventManager smoke test");

test("registering the same (event, handler) twice registers once", () => {
  const manager = new SocketEventManager();
  const handler = () => {};
  manager.on("a", handler).on("a", handler).on("a", handler);
  assert.equal(manager.size, 1);
});

test("off() removes exactly one handler and updates size", () => {
  const manager = new SocketEventManager();
  const first = () => {};
  const second = () => {};
  manager.on("a", first).on("a", second);
  manager.off("a", first);
  assert.equal(manager.size, 1);
  manager.off("a", second);
  assert.equal(manager.size, 0);
});

test("offAll(event) clears only that event", () => {
  const manager = new SocketEventManager();
  manager.on("a", () => {}).on("a", () => {}).on("b", () => {});
  const removed = manager.offAll("a");
  assert.equal(removed, 2);
  assert.equal(manager.size, 1);
});

test("offAll() with no event clears everything and reports the count", () => {
  const manager = new SocketEventManager();
  manager.on("a", () => {}).on("b", () => {}).on("b", () => {});
  const removed = manager.offAll();
  assert.equal(removed, 3);
  assert.equal(manager.size, 0);
});

test("unknown event/handler in off() is a safe no-op", () => {
  const manager = new SocketEventManager();
  manager.on("a", () => {});
  manager.off("a", () => {}).off("nope", () => {}).offAll("nope");
  assert.equal(manager.size, 1);
});

test("non-function handlers are ignored", () => {
  const manager = new SocketEventManager();
  manager.on("a", null).on("a", "not-a-fn").on("a", 42);
  assert.equal(manager.size, 0);
});

test("attach() wires every registered listener exactly once", () => {
  const manager = new SocketEventManager();
  const handler = () => {};
  manager.on("a", handler).on("b", handler);
  const { socket, calls } = createFakeSocket();
  manager.attach(socket);
  assert.equal(calls.on.length, 2);
});

test("attach() after duplicate registration still wires once", () => {
  const manager = new SocketEventManager();
  const handler = () => {};
  manager.on("a", handler).on("a", handler).on("a", handler);
  const { socket, calls } = createFakeSocket();
  manager.attach(socket);
  assert.equal(calls.on.length, 1);
});

test("detach() is symmetric with attach()", () => {
  const manager = new SocketEventManager();
  const handler = () => {};
  manager.on("a", handler).on("b", handler);
  const { socket, calls } = createFakeSocket();
  manager.attach(socket);
  manager.detach(socket);
  assert.equal(calls.off.length, 2);
});

test("attach()/detach() are safe on a null socket", () => {
  const manager = new SocketEventManager();
  manager.on("a", () => {});
  manager.attach(null);
  manager.detach(null);
  assert.equal(manager.size, 1);
});

test("manager is reusable after offAll", () => {
  const manager = new SocketEventManager();
  const handler = () => {};
  manager.on("a", handler);
  manager.offAll();
  manager.on("a", handler).on("a", handler);
  assert.equal(manager.size, 1);
});

console.log(failures === 0 ? "\nAll socket event manager checks passed." : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
