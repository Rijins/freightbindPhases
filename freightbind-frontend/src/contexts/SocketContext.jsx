import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useAuth from "../hooks/useAuth";
import {
  getSocketClient,
  destroySocketClient,
} from "../socket/socketClient";
import SocketEventManager from "../socket/socketEventManager";
import { SOCKET_AUTH_ERROR_CODES, SOCKET_EVENTS } from "../utils/constants";

// Development-only inspector. Statically replaced with `null` in production
// builds, so Vite drops the dynamic import and its chunk entirely.
const SocketDebugPanel = import.meta.env.DEV
  ? lazy(() => import("../components/SocketDebug/SocketDebug"))
  : null;

// Frontend socket status machine. Mirrors the Socket.IO client lifecycle:
//   disconnected -> connecting -> connected
//                        |              v (network loss / backend restart)
//                        +-------> reconnecting -> connected | disconnected
// Auth failures stop at disconnected — retrying an invalid token is a loop.

export const SOCKET_STATUS = Object.freeze({
  DISCONNECTED: "disconnected",
  CONNECTING: "connecting",
  CONNECTED: "connected",
  RECONNECTING: "reconnecting",
});

// The Socket.IO manager retries reconnectionAttempts times (≈90s) per cycle
// before emitting "reconnect_failed". A backend that is down for longer —
// e.g. nodemon restarting, or the frontend started before the backend — would
// otherwise kill realtime permanently until a refresh. Instead, restart a
// fresh cycle automatically, bounded so a dead backend is never hammered
// forever: RESTART_CYCLES_MAX full cycles, spaced RESTART_DELAY_MS apart.
const RESTART_CYCLES_MAX = 5;
const RESTART_DELAY_MS = 10000;

const SocketContext = createContext(null);

const AUTH_ERROR_MESSAGES = Object.freeze({
  [SOCKET_AUTH_ERROR_CODES.MISSING_TOKEN]: "Not signed in. Please log in again.",
  [SOCKET_AUTH_ERROR_CODES.INVALID_TOKEN]: "Your session is not valid. Please log in again.",
  [SOCKET_AUTH_ERROR_CODES.EXPIRED_TOKEN]: "Your session has expired. Please log in again.",
  [SOCKET_AUTH_ERROR_CODES.ACCOUNT_INACTIVE]: "Your account is inactive. Contact an administrator.",
});

const AUTH_REASON_HINTS = Object.freeze([
  { pattern: /expired/i, code: SOCKET_AUTH_ERROR_CODES.EXPIRED_TOKEN },
  { pattern: /not authorized|no token/i, code: SOCKET_AUTH_ERROR_CODES.MISSING_TOKEN },
  { pattern: /invalid/i, code: SOCKET_AUTH_ERROR_CODES.INVALID_TOKEN },
  { pattern: /inactive/i, code: SOCKET_AUTH_ERROR_CODES.ACCOUNT_INACTIVE },
]);

// Server rejects a handshake with connect_error carrying data.code (sockets/
// auth.js). Fall back to matching the message text for defensive parsing.
const resolveAuthErrorCode = (error) => {
  const code = error?.data?.code;
  if (code && SOCKET_AUTH_ERROR_CODES[code]) return code;

  const message = error?.message || "";
  const hint = AUTH_REASON_HINTS.find((entry) => entry.pattern.test(message));
  return hint ? hint.code : null;
};

const SocketProvider = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [status, setStatus] = useState(SOCKET_STATUS.DISCONNECTED);
  const [lastError, setLastError] = useState(null);
  const [socketId, setSocketId] = useState(null);
  const [transport, setTransport] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  // One manager for the provider's lifetime; all app listeners flow through it.
  const eventManagerRef = useRef(new SocketEventManager());
  const socketRef = useRef(null);
  // Auto-restart bookkeeping: timer for the next retry cycle and how many
  // full cycles have run since the last successful connect.
  const restartTimerRef = useRef(null);
  const cycleRef = useRef(0);

  const connect = useCallback(() => {
    const socket = socketRef.current;
    if (!socket) return;
    if (socket.connected) return;
    // socket.active stays truthy after the first connect() (it mirrors
    // listener subscription state, not connection state), so gate on the
    // manager's lifecycle instead: open/opening means a connection is in
    // flight and must not be started twice.
    if (socket.io.readyState !== "closed") return;
    setStatus(SOCKET_STATUS.CONNECTING);
    setLastError(null);
    socket.connect();
  }, []);

  const disconnect = useCallback(() => {
    const socket = socketRef.current;
    if (socket?.connected || socket?.active) socket.disconnect();
    setStatus(SOCKET_STATUS.DISCONNECTED);
  }, []);

  const clearRestartTimer = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }
  }, []);

  const reconnect = useCallback(() => {
    clearRestartTimer();
    cycleRef.current = 0;
    disconnect();
    connect();
  }, [clearRestartTimer, disconnect, connect]);

  // Wire the socket for the current auth session. Logout or a new token
  // tears the old socket down; a full teardown also happens on unmount.
  useEffect(() => {
    if (!isAuthenticated || !token) {
      clearRestartTimer();
      cycleRef.current = 0;
      destroySocketClient();
      socketRef.current = null;
      eventManagerRef.current.offAll();
      setStatus(SOCKET_STATUS.DISCONNECTED);
      setLastError(null);
      setSocketId(null);
      setTransport(null);
      setReconnectAttempts(0);
      return undefined;
    }

    const socket = getSocketClient(token);
    socketRef.current = socket;
    setStatus(SOCKET_STATUS.CONNECTING);

    const handleConnect = () => {
      cycleRef.current = 0;
      setStatus(SOCKET_STATUS.CONNECTED);
      setLastError(null);
      setSocketId(socket.id);
      setTransport(socket.io.engine?.transport?.name || null);
      setReconnectAttempts(0);
    };

    const handleDisconnect = (reason) => {
      // "io server disconnect" and "io client disconnect" never auto-reconnect.
      setStatus(SOCKET_STATUS.DISCONNECTED);
      setSocketId(null);
      if (reason === "io server disconnect" || reason === "io client disconnect") {
        setLastError(null);
      }
    };

    const handleConnectError = (error) => {
      const code = resolveAuthErrorCode(error);
      if (code) {
        // Auth failures are terminal — do not loop on an invalid token.
        // Disconnect BEFORE writing lastError: socket.disconnect() fires the
        // "disconnect" handler synchronously, which would wipe the message.
        socket.disconnect();
        setStatus(SOCKET_STATUS.DISCONNECTED);
        setLastError(AUTH_ERROR_MESSAGES[code]);
        return;
      }
      // Transport-level failure: the manager keeps retrying on its own, so
      // reflect that in the status instead of stopping at disconnected.
      setStatus(SOCKET_STATUS.RECONNECTING);
      setLastError("Cannot reach the realtime server. Retrying…");
    };

    const handleReconnectAttempt = (attempt) => {
      setStatus(SOCKET_STATUS.RECONNECTING);
      setReconnectAttempts(attempt);
    };

    const handleReconnectFailed = () => {
      // The manager has exhausted this cycle's retry budget. Instead of
      // stopping permanently, start a fresh cycle (bounded) so the socket
      // self-heals whenever the backend comes back.
      if (cycleRef.current < RESTART_CYCLES_MAX) {
        cycleRef.current += 1;
        setStatus(SOCKET_STATUS.RECONNECTING);
        setLastError(
          `The realtime server could not be reached. Retrying in ${RESTART_DELAY_MS / 1000}s…`
        );
        restartTimerRef.current = setTimeout(() => socket.connect(), RESTART_DELAY_MS);
        return;
      }
      setStatus(SOCKET_STATUS.DISCONNECTED);
      setLastError("The realtime server could not be reached.");
    };

    // "connect" fires for both the initial connection and reconnections.
    // Reconnect events are emitted by the Manager (socket.io), not the
    // socket itself, so those listeners live on the manager instance.
    const socketListeners = [
      [SOCKET_EVENTS.CONNECT, handleConnect],
      [SOCKET_EVENTS.DISCONNECT, handleDisconnect],
      [SOCKET_EVENTS.CONNECT_ERROR, handleConnectError],
    ];
    const managerListeners = [
      [SOCKET_EVENTS.RECONNECT_ATTEMPT, handleReconnectAttempt],
      [SOCKET_EVENTS.RECONNECT, handleConnect],
      [SOCKET_EVENTS.RECONNECT_FAILED, handleReconnectFailed],
    ];

    for (const [eventName, handler] of socketListeners) {
      socket.on(eventName, handler);
    }
    for (const [eventName, handler] of managerListeners) {
      socket.io.on(eventName, handler);
    }
    eventManagerRef.current.attach(socket);
    socket.connect();

    return () => {
      clearRestartTimer();
      for (const [eventName, handler] of socketListeners) {
        socket.off(eventName, handler);
      }
      for (const [eventName, handler] of managerListeners) {
        socket.io.off(eventName, handler);
      }
      eventManagerRef.current.detach(socket);
      destroySocketClient();
      socketRef.current = null;
    };
  }, [token, isAuthenticated]);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      eventManager: eventManagerRef.current,
      status,
      socketId,
      transport,
      reconnectAttempts,
      lastError,
      connect,
      disconnect,
      reconnect,
    }),
    [status, socketId, transport, reconnectAttempts, lastError, connect, disconnect, reconnect]
  );

  return (
    <SocketContext.Provider value={value}>
      {children}
      {SocketDebugPanel && (
        <Suspense fallback={null}>
          <SocketDebugPanel />
        </Suspense>
      )}
    </SocketContext.Provider>
  );
};

export const useSocketContext = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }
  return context;
};

export { SocketContext, SocketProvider, AUTH_ERROR_MESSAGES };
