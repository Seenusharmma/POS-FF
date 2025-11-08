import dotenv from "dotenv";
dotenv.config();

import express from "express";
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import Food from "../models/foodModel.js";

const router = express.Router();

// ✅ Use memory storage for direct Cloudinary uploads
const storage = multer.memoryStorage();
const upload = multer({ storage });

/* ================================
   🥗 GET - Fetch All Foods
================================ */
router.get("/", async (req, res) => {
  try {
    const foods = await Food.find();
    res.json(foods);
  } catch (error) {
    console.error("❌ Error fetching foods:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   🥗 POST - Upload New Food (with auto-size optimization)
================================ */
router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Image file is required" });

    // ⚙️ Automatically optimize image (resize + compress)
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "foods",
        transformation: [
          { width: 800, height: 800, crop: "limit" }, // max 800x800px
          { quality: "auto", fetch_format: "auto" },  // auto compression & format
        ],
      },
      async (error, result) => {
        if (error) {
          console.error("❌ Cloudinary Upload Error:", error);
          return res.status(500).json({ message: "Upload failed" });
        }

        const newFood = new Food({
          name: req.body.name,
          category: req.body.category,
          type: req.body.type,
          price: req.body.price,
          available: req.body.available ?? true,
          image: result.secure_url,
        });

        await newFood.save();
        res.status(201).json(newFood);
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    console.error("❌ POST /foods error:", error);
    res.status(500).json({ message: "Server error", error });
  }
});

/* ================================
   ✏️ PUT - Update Existing Food (auto-resize on new image)
================================ */
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    // ✅ If new image uploaded, replace Cloudinary image
    if (req.file) {
      // Delete old image from Cloudinary
      if (food.image && food.image.includes("cloudinary.com")) {
        const parts = food.image.split("/");
        const fileName = parts[parts.length - 1];
        const publicId = fileName.split(".")[0];
        await cloudinary.uploader.destroy(`foods/${publicId}`);
      }

      // ⚙️ Upload new image with optimization
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "foods",
          transformation: [
            { width: 800, height: 800, crop: "limit" },
            { quality: "auto", fetch_format: "auto" },
          ],
        },
        async (error, result) => {
          if (error) return res.status(500).json({ message: "Upload failed" });

          food.name = req.body.name || food.name;
          food.category = req.body.category || food.category;
          food.type = req.body.type || food.type;
          food.price = req.body.price || food.price;
          food.available = req.body.available ?? food.available;
          food.image = result.secure_url;

          await food.save();
          res.json(food);
        }
      );

      uploadStream.end(req.file.buffer);
    } else {
      // No image change — just update text fields
      food.name = req.body.name || food.name;
      food.category = req.body.category || food.category;
      food.type = req.body.type || food.type;
      food.price = req.body.price || food.price;
      food.available = req.body.available ?? food.available;

      await food.save();
      res.json(food);
    }
  } catch (error) {
    console.error("❌ PUT /foods/:id error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/* ================================
   🗑️ DELETE - Remove Food + Image from Cloudinary
================================ */
router.delete("/:id", async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    // ✅ Delete Cloudinary image if exists
    if (food.image && food.image.includes("cloudinary.com")) {
      const parts = food.image.split("/");
      const fileName = parts[parts.length - 1];
      const publicId = fileName.split(".")[0];
      await cloudinary.uploader.destroy(`foods/${publicId}`);
    }

    await Food.findByIdAndDelete(req.params.id);
    res.json({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE /foods/:id error:", error);
    res.status(500).json({ message: "Failed to delete food" });
  }
});

export default router;
