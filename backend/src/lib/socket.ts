import { Server } from "socket.io";
import { Server as HttpServer } from "http";

let io: Server;

export function initSocket(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on("register", (address: string) => {
      const room = address.toLowerCase();
      socket.join(room);
      console.log(`📡 Registered address: ${room} | socket: ${socket.id}`);
      console.log(`📡 All rooms:`, [...socket.rooms]);
    });

    socket.on("disconnect", () => {
      console.log(`❌ Client disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
}

export function emitTransactionUpdate(address: string, transaction: object): void {
  console.log(`📡 Emitting transaction:update to room: ${address.toLowerCase()}`);
  const room = getIO().to(address.toLowerCase());
  console.log(`📡 Room sockets:`, getIO().sockets.adapter.rooms.get(address.toLowerCase()));
  room.emit("transaction:update", transaction);
}