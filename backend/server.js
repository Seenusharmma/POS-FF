import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import foodRoutes from "./routes/foodRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { v2 as cloudinary } from "cloudinary";
import path from "path";
import { fileURLToPath } from "url";

// ✅ __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize Express & HTTP Server
const app = express();
const server = createServer(app);

// ✅ Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: "https://food-fantasy-cgu.vercel.app/",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ✅ Connect MongoDB
connectDB();

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("✅ Cloudinary connected:", cloudinary.config().cloud_name);

// ✅ Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Local static fallback (dev only)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Attach socket to app (for real-time events)
app.set("io", io);

// ✅ API Routes
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Socket.IO Event Listeners
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("orderUpdated", (updatedOrder) => {
    io.emit("orderStatusChanged", updatedOrder);
  });

  socket.on("foodUpdated", (food) => {
    io.emit("foodUpdated", food);
  });

  socket.on("foodDeleted", (id) => {
    io.emit("foodDeleted", id);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ✅ Serve Frontend (Render/Vercel support)
if (process.env.NODE_ENV === "production") {
  const frontendPath = path.join(__dirname, "frontend", "dist");
  app.use(express.static(frontendPath));
  app.use((req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server
const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
