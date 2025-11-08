import Food from "../models/foodModel.js";
import { v2 as cloudinary } from "cloudinary";

/* =======================================
   ✅ GET ALL FOODS
======================================= */
export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.status(200).json(foods);
  } catch (error) {
    console.error("❌ Error fetching foods:", error);
    res.status(500).json({ message: "Failed to fetch foods" });
  }
};

/* =======================================
   ✅ ADD NEW FOOD (with Cloudinary upload)
======================================= */
export const addFood = async (req, res) => {
  try {
    const { name, category, type, price, available } = req.body;

    // 🧩 Validation
    if (!name || !price)
      return res.status(400).json({ message: "Name and price are required" });

    if (isNaN(price))
      return res.status(400).json({ message: "Price must be a valid number" });

    let imageData = null;

    // 📸 Upload to Cloudinary (if file is present)
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "restaurant_foods",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      imageData = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // 💾 Save new food
    const food = await Food.create({
      name,
      category,
      type,
      price: Number(price),
      available: available !== "false",
      image: imageData,
    });

    // 🔥 Emit real-time update
    const io = req.app.get("io");
    if (io) io.emit("newFoodAdded", food);

    res.status(201).json({ message: "✅ Food added successfully", food });
  } catch (error) {
    console.error("❌ Error adding food:", error);
    res.status(500).json({ message: "Failed to add food" });
  }
};

/* =======================================
   ✅ UPDATE FOOD (Cloudinary + details)
======================================= */
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, category, type, price, available } = req.body;

    const food = await Food.findById(id);
    if (!food) return res.status(404).json({ message: "Food not found" });

    // 🧩 Validation
    if (price && isNaN(price))
      return res.status(400).json({ message: "Price must be a valid number" });

    // 🧹 Delete old image and upload new one (if applicable)
    if (req.file) {
      if (food.image?.public_id) {
        await cloudinary.uploader.destroy(food.image.public_id);
      }

      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "restaurant_foods",
            transformation: [
              { width: 800, height: 800, crop: "limit" },
              { quality: "auto", fetch_format: "auto" },
            ],
          },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(req.file.buffer);
      });

      food.image = {
        url: result.secure_url,
        public_id: result.public_id,
      };
    }

    // 📝 Update other fields
    food.name = name || food.name;
    food.category = category || food.category;
    food.type = type || food.type;
    food.price = price ? Number(price) : food.price;
    food.available =
      available !== undefined ? available === "true" || available === true : food.available;

    await food.save();

    // 🔥 Emit real-time update
    const io = req.app.get("io");
    if (io) io.emit("foodUpdated", food);

    res.status(200).json(food);
  } catch (error) {
    console.error("❌ Error updating food:", error);
    res.status(500).json({ message: "Failed to update food" });
  }
};

/* =======================================
   ✅ DELETE FOOD (and its Cloudinary image)
======================================= */
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findByIdAndDelete(id);

    if (!food) return res.status(404).json({ message: "Food not found" });

    // 🧹 Delete from Cloudinary
    if (food.image?.public_id) {
      await cloudinary.uploader.destroy(food.image.public_id);
    }

    // 🔥 Notify clients
    const io = req.app.get("io");
    if (io) io.emit("foodDeleted", id);

    res.status(200).json({ message: "🗑️ Food deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting food:", error);
    res.status(500).json({ message: "Failed to delete food" });
  }
};
