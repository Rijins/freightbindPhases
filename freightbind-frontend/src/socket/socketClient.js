import { io } from "socket.io-client";
import { SOCKET_URL } from "../utils/constants";

// The ONE Socket.IO client for the entire app. Created lazily per JWT and
// reused until the token changes or the provider tears it down. Never call
// `io()` again anywhere else — import getSocketClient() instead.

const DEFAULT_OPTIONS = Object.freeze({
  // The provider controls when to connect — no implicit connections at import.
  autoConnect: false,
  reconnection: true,
  // Give the backend time to answer; a timeout surfaces as connect_error.
  timeout: 10000,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  // Cap attempts so a dead backend cannot hammer the network forever.
  reconnectionAttempts: 20,
});

let activeClient = null;
let activeToken = null;

/**
 * Returns the singleton socket for the given JWT.
 *
 * The instance is keyed by token: a different token (login as another user,
 * re-login after expiry) tears down the old socket and builds a fresh one —
 * reusing a stale socket would reconnect with the previous user's identity.
 * Callers must still connect() it (the provider owns the lifecycle).
 */
const getSocketClient = (token) => {
  if (activeClient && activeToken === token) return activeClient;

  if (activeClient) {
    activeClient.removeAllListeners();
    activeClient.disconnect();
    activeClient = null;
  }

  if (!token) return null;

  activeToken = token;
  activeClient = io(SOCKET_URL, {
    ...DEFAULT_OPTIONS,
    auth: { token },
  });

  return activeClient;
};

/** True while a client exists for the same token the app last used. */
const isSocketActive = (token) => Boolean(activeClient && activeToken === token);

/** Full teardown — used on provider unmount and logout. Never reconnects. */
const destroySocketClient = () => {
  if (!activeClient) {
    activeToken = null;
    return;
  }
  activeClient.removeAllListeners();
  activeClient.disconnect();
  activeClient = null;
  activeToken = null;
};

export { getSocketClient, isSocketActive, destroySocketClient };
