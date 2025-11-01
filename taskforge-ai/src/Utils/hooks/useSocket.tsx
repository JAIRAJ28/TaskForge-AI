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
  authenticated: boolean;
  initSocket: (token?: string) => void;
  disconnectSocket: () => void;
};

const SocketContext = createContext<SocketContextValue | undefined>(undefined);

export const useSocket = (): SocketContextValue => {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket must be used within a SocketProvider");
  return ctx;
};

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  const attachListeners = (socketInstance: Socket, token: string) => {
    socketInstance.on("connect", () => {
      console.log("🔌 Socket connected:", socketInstance.id);
      setConnected(true);
      // Send authentication request to backend
      socketInstance.emit("authenticate", { token });
    });

    socketInstance.on("auth-success", () => {
      console.log("✅ Socket authenticated successfully");
      setAuthenticated(true);
    });

    socketInstance.on("auth-failed", (msg: string) => {
      console.error("❌ Socket authentication failed:", msg);
      setAuthenticated(false);
      socketInstance.disconnect();
    });

    socketInstance.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
      setConnected(false);
      setAuthenticated(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("❌ Socket connection error:", err.message);
    });
  };

  const initSocket = (token?: string) => {
    if (!token) token = localStorage.getItem("Token") || "";
    if (!token) {
      console.warn("⚠️ No token found for socket initialization");
      return;
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const instance = connectSocket(token);
    socketRef.current = instance;
    attachListeners(instance, token);
  };

  const disconnectSocket = () => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnected(false);
      setAuthenticated(false);
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
        authenticated,
        initSocket,
        disconnectSocket,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
