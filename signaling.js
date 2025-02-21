import { Server } from "socket.io";
import Room from "./models/Room.js"; // Import Room model for validation

export default function setupSignaling(server) {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://dev-connect-1.vercel.app"],
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`✅ User connected: ${socket.id}`);

    // User joins a room
    socket.on("join-room", async ({ roomId, userId }) => {
      try {
        const roomExists = await Room.findById(roomId);
        if (!roomExists) {
          socket.emit("error", { message: "Invalid room ID" });
          return;
        }

        socket.join(roomId);
        console.log(`👤 User ${userId} joined room: ${roomId}`);
        socket.to(roomId).emit("new-user", { userId });
      } catch (error) {
        console.error("❌ Error joining room:", error.message);
      }
    });

    // WebRTC Offer (SDP)
    socket.on("offer", ({ roomId, offer, senderId }) => {
      socket.to(roomId).emit("offer", { offer, senderId });
    });

    // WebRTC Answer (SDP)
    socket.on("answer", ({ roomId, answer, senderId }) => {
      socket.to(roomId).emit("answer", { answer, senderId });
    });

    // WebRTC ICE Candidate
    socket.on("ice-candidate", ({ roomId, candidate, senderId }) => {
      socket.to(roomId).emit("ice-candidate", { candidate, senderId });
    });

    // User leaves a room
    socket.on("leave-room", ({ roomId, userId }) => {
      socket.leave(roomId);
      console.log(`👤 User ${userId} left room: ${roomId}`);
      socket.to(roomId).emit("user-left", { userId });

      // Check if the room is empty
      const room = io.sockets.adapter.rooms.get(roomId);
      if (!room || room.size === 0) {
        console.log(`🚫 Room ${roomId} is now empty`);
        io.emit("room-empty", { roomId });
      }
    });

    // Handle user disconnection
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      socket.broadcast.emit("user-disconnected", { userId: socket.id });
    });
  });

  return io;
}
