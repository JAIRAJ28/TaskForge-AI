import { io, Socket } from "socket.io-client";
import { BASE_URL } from "../Service/Api";

const SOCKET_URL = BASE_URL

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
