// Reusable listener registry for a Socket.IO client.
//
// Components should never call socket.on()/socket.off() directly — this
// manager deduplicates listeners (same event + same function = registered
// once), makes removal symmetric, and can wipe every listener the app owns
// in one call (provider unmount / socket teardown), which prevents leaks.

class SocketEventManager {
  constructor() {
    this.listeners = new Map();
    this.listenerCount = 0;
    this.attachedSocket = null;
  }

  /** Registers a listener. Registering the same function twice is a no-op. */
  on(eventName, handler) {
    if (typeof handler !== "function") return this;
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName).add(handler);
    return this;
  }

  /** Removes one listener. Unknown event/handler is a safe no-op. */
  off(eventName, handler) {
    const handlers = this.listeners.get(eventName);
    if (!handlers) return this;
    handlers.delete(handler);
    if (handlers.size === 0) this.listeners.delete(eventName);
    return this;
  }

  /**
   * Removes every listener for one event (or all events when omitted).
   * Returns the number of listeners removed.
   */
  offAll(eventName) {
    let removed = 0;
    if (eventName !== undefined) {
      removed = this.listeners.get(eventName)?.size || 0;
      this.listeners.delete(eventName);
      return removed;
    }
    for (const handlers of this.listeners.values()) {
      removed += handlers.size;
    }
    this.listeners.clear();
    return removed;
  }

  /**
   * Attaches every registered listener to a socket. Idempotent per socket:
   * calling attach() again with the same socket is a no-op, so late listener
   * registrations can call attach() without duplicating socket.on() calls.
   */
  attach(socket) {
    if (!socket) return this;
    if (this.attachedSocket === socket) return this;
    this.detach(this.attachedSocket);
    this.attachedSocket = socket;
    for (const [eventName, handlers] of this.listeners) {
      for (const handler of handlers) {
        socket.on(eventName, handler);
      }
    }
    return this;
  }

  /** Detaches every registered listener from a socket (and clears it). */
  detach(socket) {
    if (!socket) return this;
    for (const [eventName, handlers] of this.listeners) {
      for (const handler of handlers) {
        socket.off(eventName, handler);
      }
    }
    if (this.attachedSocket === socket) {
      this.attachedSocket = null;
    }
    return this;
  }

  /** Number of unique (event, handler) registrations. */
  get size() {
    let count = 0;
    for (const handlers of this.listeners.values()) {
      count += handlers.size;
    }
    return count;
  }
}

export default SocketEventManager;
