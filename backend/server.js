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

// ✅ __dirname setup for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize Express & HTTP server
const app = express();
const server = createServer(app);

// ✅ Connect MongoDB
connectDB();

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("✅ Cloudinary connected:", cloudinary.config().cloud_name);

// ✅ Setup Socket.IO with secure CORS
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",                // for local dev
      "https://food-fantasy-cgu.vercel.app",  // for production frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

// ✅ Express Middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://food-fantasy-cgu.vercel.app",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve local uploads (only used in dev)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Attach socket instance globally
app.set("io", io);

// ✅ API Routes
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Socket.IO Realtime Events
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

// ✅ Serve Frontend (Render-compatible)
if (process.env.NODE_ENV === "production") {
  // Use "../frontend/dist" because your build is outside backend folder
  const frontendPath = path.resolve(__dirname, "../frontend/dist");
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
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
  console.log(`✅ Server running on port ${PORT} — Environment: ${process.env.NODE_ENV}`);
});
