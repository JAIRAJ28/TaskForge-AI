import { io, Socket } from "socket.io-client";

const SOCKET_URL = 'http://localhost:5001/'

export function connectSocket(token: string): Socket {
  return io(SOCKET_URL, {
    transports: ["websocket"],
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1500,
    auth: { token },
  });
}
