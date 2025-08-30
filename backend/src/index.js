import express from "express";
import http from "http";
import { Server as IOServer } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { verifyTokenSocket } from "./utils/jwt.js";
import socketHandler from "./sockets/socketHandler.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
  })
);

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/conversations", messageRoutes);

const server = http.createServer(app);

const io = new IOServer(server, {
  path: process.env.SOCKET_IO_PATH || "/socket.io",
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
  },
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    return next(new Error("Authentication error: Missing token"));
  }
  try {
    const user = verifyTokenSocket(token);
    socket.user = user;
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});

io.on("connection", (socket) => {
  socketHandler(io, socket);
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});
