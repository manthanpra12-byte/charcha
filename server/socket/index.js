import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import registerMessageHandlers from "./messageHandler.js";

const setupSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: process.env.CLIENT_URL },
  });

  // This runs BEFORE a connection is accepted: it is the "login check" for sockets.
  // The client must send its JWT like:  io(url, { auth: { token } })
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findById(decoded.id);
      if (!user) {
        return next(new Error("User not found"));
      }

      // Store the trusted identity on the socket
      socket.userId = user._id.toString();
      socket.username = user.username;
      next();
    } catch (err) {
      next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    // Every user joins a private room named after their id.
    // To message someone we simply emit to their room. This also handles several open tabs.
    socket.join(`user:${socket.userId}`);
    console.log(`Socket connected: ${socket.username}`);

    registerMessageHandlers(io, socket);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: ${socket.username}`);
    });
  });

  return io;
};

export default setupSocket;
