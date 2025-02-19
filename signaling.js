import { Server } from "socket.io";

const setupSignaling = (server) => {
  const io = new Server(server, {
    cors: {
      origin: ["http://localhost:5173", "https://dev-connect-1.vercel.app"],
      methods: ["GET", "POST"]
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("join-room", (roomId) => {
      socket.join(roomId);
      socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("offer", (data) => {
      if (io.sockets.adapter.rooms.has(data.roomId)) {
        socket.to(data.roomId).emit("receive-offer", data);
      }
    });

    socket.on("answer", (data) => {
      if (io.sockets.adapter.rooms.has(data.roomId)) {
        socket.to(data.roomId).emit("receive-answer", data);
      }
    });

    socket.on("ice-candidate", (data) => {
      if (io.sockets.adapter.rooms.has(data.roomId)) {
        socket.to(data.roomId).emit("receive-ice-candidate", data);
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
      const rooms = Array.from(socket.rooms);
      rooms.forEach((room) => socket.leave(room));
    });
  });

  return io;
};

export default setupSignaling;
