import { useSocketContext, SOCKET_STATUS } from "../contexts/SocketContext";

/**
 * Public realtime API for components. The only sanctioned way to reach the
 * socket — never consume SocketContext directly, so swapping internals later
 * never breaks callers.
 */
const useSocket = () => {
  const { status, ...rest } = useSocketContext();

  return {
    ...rest,
    status,
    isConnected: status === SOCKET_STATUS.CONNECTED,
    isConnecting: status === SOCKET_STATUS.CONNECTING,
    isReconnecting: status === SOCKET_STATUS.RECONNECTING,
  };
};

export default useSocket;
