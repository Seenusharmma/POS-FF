import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import Food from "../models/foodModel.js";

const router = express.Router();

// ✅ Memory storage for direct Cloudinary upload
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ================================
// 🍽️ GET - Fetch All Foods
// ================================
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.status(200).json(foods);
  } catch (err) {
    console.error("❌ Error fetching foods:", err);
    res.status(500).json({ message: "Failed to fetch foods" });
  }
});

// ================================
// 🧑‍🍳 POST - Add New Food (with Cloudinary Upload)
// ================================
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { name, category, type, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    let imageData = null;

    // ✅ Upload image to Cloudinary (if provided)
    if (req.file) {
      const result = await cloudinary.uploader.upload_stream(
        {
          folder: "restaurant_foods",
          transformation: [{ width: 800, height: 600, crop: "limit" }], // auto-resize
        },
        async (error, result) => {
          if (error) throw error;
          imageData = {
            url: result.secure_url,
            public_id: result.public_id,
          };

          const newFood = await Food.create({
            name,
            category,
            type,
            price,
            image: imageData,
          });

          // ✅ Emit to all clients (real-time update)
          const io = req.app.get("io");
          io.emit("newFoodAdded", newFood);

          return res.status(201).json({ food: newFood });
        }
      );

      // ✅ Write file buffer to Cloudinary stream
      result.end(req.file.buffer);
    } else {
      // If no image provided
      const newFood = await Food.create({ name, category, type, price });
      const io = req.app.get("io");
      io.emit("newFoodAdded", newFood);
      res.status(201).json({ food: newFood });
    }
  } catch (err) {
    console.error("❌ Error adding food:", err);
    res.status(500).json({ message: "Failed to add food" });
  }
});

// ================================
// ✏️ PUT - Update Food
// ================================
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, type, price } = req.body;

    let updatedFields = { name, category, type, price };

    // ✅ If new image uploaded, replace old Cloudinary image
    if (req.file) {
      const food = await Food.findById(id);
      if (food?.image?.public_id) {
        await cloudinary.uploader.destroy(food.image.public_id);
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: "restaurant_foods",
            transformation: [{ width: 800, height: 600, crop: "limit" }],
          },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        uploadStream.end(req.file.buffer);
      });

      updatedFields.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    const updatedFood = await Food.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    const io = req.app.get("io");
    io.emit("foodUpdated", updatedFood);

    res.status(200).json({ food: updatedFood });
  } catch (err) {
    console.error("❌ Error updating food:", err);
    res.status(500).json({ message: "Failed to update food" });
  }
});

// ================================
// 🗑️ DELETE - Remove Food (with Cloudinary image delete)
// ================================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findById(id);

    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    // ✅ Delete image from Cloudinary (if exists)
    if (food.image?.public_id) {
      await cloudinary.uploader.destroy(food.image.public_id);
    }

    await Food.findByIdAndDelete(id);

    const io = req.app.get("io");
    io.emit("foodDeleted", id);

    res.status(200).json({ message: "Food deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting food:", err);
    res.status(500).json({ message: "Failed to delete food" });
  }
});

export default router;
