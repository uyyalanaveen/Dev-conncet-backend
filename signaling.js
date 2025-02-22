import { Server } from "socket.io";
import Room from "./models/Room.js";

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
        
        // Get all users in the room except the sender
        const roomUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
          .filter(id => id !== socket.id);
        
        // Notify the new user about existing participants
        socket.emit("room-users", { users: roomUsers });
        
        // Notify others about the new user
        socket.to(roomId).emit("user-joined", { userId });
      } catch (error) {
        console.error("❌ Error joining room:", error.message);
      }
    });

    // WebRTC Offer
    socket.on("offer", ({ roomId, offer, senderId, receiverId }) => {
      socket.to(receiverId).emit("offer", { 
        offer, 
        senderId 
      });
    });

    // WebRTC Answer
    socket.on("answer", ({ roomId, answer, senderId, receiverId }) => {
      socket.to(receiverId).emit("answer", { 
        answer, 
        senderId 
      });
    });

    // ICE Candidate
    socket.on("ice-candidate", ({ roomId, candidate, senderId, receiverId }) => {
      socket.to(receiverId).emit("ice-candidate", { 
        candidate, 
        senderId 
      });
    });

    // User leaves room
    socket.on("leave-room", ({ roomId, userId }) => {
      socket.leave(roomId);
      console.log(`👤 User ${userId} left room: ${roomId}`);
      io.to(roomId).emit("user-left", { userId });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      io.emit("user-disconnected", { userId: socket.id });
    });
  });

  return io;
}