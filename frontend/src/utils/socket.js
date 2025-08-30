import { io } from "socket.io-client";
import { getToken } from "../context/AuthContext";

let socket = null;

export const createSocket = () => {
  if (socket) return socket;

  const token = getToken();

  socket = io(process.env.SOCKET_IO_URL || "http://localhost:5000", {
    path: "/socket.io",
    auth: {
      token,
    },
    autoConnect: true,
    transports: ["websocket"],
  });

  return socket;
};

export const disconnectSocket = (sock) => {
  if (sock) {
    sock.disconnect();
    socket = null;
  }
};
