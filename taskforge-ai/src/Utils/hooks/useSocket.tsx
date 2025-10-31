"use client";
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Socket } from "socket.io-client";
import { connectSocket } from "../connectSocket";

export type SocketContextValue = {
  socket: Socket | null;
  connected: boolean;
  initSocket: (token?: string) => void;
  disconnectSocket: () => void;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);
export const useSocket = (): SocketContextValue => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  const attachListeners = (socketInstance: Socket) => {
    socketInstance.on("connect", () => {
      console.log("🔌 Connected:", socketInstance.id);
      setConnected(true);
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("⚠️ Disconnected:", reason);
      setConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("❌ Socket error:", err.message);
    });
  };

  const initSocket = (token?: string) => {
    if (!token) token = localStorage.getItem("Token") || "";
    if (!token) return console.warn("⚠️ No token found for socket init");

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const instance = connectSocket(token);
    socketRef.current = instance;
    attachListeners(instance);
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("Token");
    if (token) initSocket(token);
    return () => disconnectSocket();
  }, []);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        connected,
        initSocket,
        disconnectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
