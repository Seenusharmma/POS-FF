import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";

import { connectDB } from "./config/db.js";
import foodRoutes from "./routes/foodRoute.js";
import orderRoutes from "./routes/orderRoute.js";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import { fileURLToPath } from "url";



// ✅ __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Initialize Express + HTTP server
const app = express();
const server = createServer(app);

// ✅ Setup Socket.IO with CORS
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

// ✅ Connect to MongoDB
connectDB();

// ✅ Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploads if used locally (not needed for Cloudinary, but safe fallback)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Attach Socket.IO instance globally
app.set("io", io);

// ✅ Routes
app.use("/api/foods", foodRoutes);
app.use("/api/orders", orderRoutes);

// ✅ Realtime Socket.IO Events
io.on("connection", (socket) => {
  console.log("🟢 Client connected:", socket.id);

  socket.on("orderUpdated", (updatedOrder) => {
    io.emit("orderStatusChanged", updatedOrder);
  });

  socket.on("foodUpdated", (food) => {
    io.emit("foodUpdated", food);
  });

  socket.on("foodDeleted", (deletedFood) => {
    io.emit("foodDeleted", deletedFood);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});

// ✅ Serve React frontend (for production on Render/Vercel)
const frontendPath = path.join(__dirname, "frontend", "dist");
if (process.env.NODE_ENV === "production") {
  app.use(express.static(frontendPath));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(frontendPath, "index.html"));
  });
}

// ✅ Global Error Handler (for cleaner logs)
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: "Internal Server Error" });
});

// ✅ Start Server
const PORT =  8000;
server.listen(PORT, () =>
  console.log(`✅ Server running on port ${PORT}`)
);
