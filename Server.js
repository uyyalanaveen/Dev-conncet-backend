import express from "express";
import http from "http";
import routes from "./routes/Userroutes.js";
import cors from "cors";
import connectDb from "./config/db.js";
import { PORT } from "./config/env.js";
import path from "path";
import roomRouter from "./routes/RoomRoutes.js";
import cron from "node-cron";
import Room from "./models/Room.js";
import setupSignaling from "./signaling.js"; 

const app = express();
const server = http.createServer(app);
const io = setupSignaling(server); 

app.use(
  cors({
    origin: ["http://localhost:5173", "https://dev-connect-1.vercel.app"],
    credentials: true,
  })
);

app.use(express.json());

cron.schedule("* * * * *", async () => {
  console.log("🔍 Checking for inactive rooms...");
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const expiredRooms = await Room.find({
    participants: { $size: 0 },
    lastParticipantLeftAt: { $lt: tenMinutesAgo },
  });

  if (expiredRooms.length) {
    console.log(`🗑️ Deleting ${expiredRooms.length} expired rooms...`);
    await Room.deleteMany({ _id: { $in: expiredRooms.map((room) => room._id) } });
  }
});

app.use("/api", routes);
app.use("/api", roomRouter);

try {
  connectDb();
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
} catch (error) {
  console.error("❌ Error starting server:", error);
}
