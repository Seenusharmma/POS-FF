import Food from "../models/foodModel.js";
import path from "path";
import fs from "fs";

// ✅ Get all foods
export const getFoods = async (req, res) => {
  try {
    const foods = await Food.find().sort({ createdAt: -1 });
    res.status(200).json(foods);
  } catch (error) {
    console.error("Error fetching foods:", error);
    res.status(500).json({ message: "Failed to fetch foods" });
  }
};

// ✅ Add a new food item
export const addFood = async (req, res) => {
  try {
    const { name, category, type, price, available } = req.body;
    let image = null;

    if (req.file) image = req.file.filename;

    const food = new Food({
      name,
      category,
      type,
      price,
      available: available !== "false", // default true
      image,
    });
    await food.save();

    // 🔥 Emit real-time event
    const io = req.app.get("io");
    if (io) io.emit("newFoodAdded", food);

    res.status(201).json({ message: "Food added successfully", food });
  } catch (error) {
    console.error("Error adding food:", error);
    res.status(500).json({ message: "Failed to add food" });
  }
};

// ✅ Update food details or availability
export const updateFood = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (req.file) updateData.image = req.file.filename;

    const food = await Food.findByIdAndUpdate(id, updateData, { new: true });

    if (!food) return res.status(404).json({ message: "Food not found" });

    // 🔥 Emit real-time event to all clients
    const io = req.app.get("io");
    if (io) io.emit("foodUpdated", food);

    res.status(200).json(food);
  } catch (error) {
    console.error("Error updating food:", error);
    res.status(500).json({ message: "Failed to update food" });
  }
};

// ✅ Delete a food item
export const deleteFood = async (req, res) => {
  try {
    const { id } = req.params;
    const food = await Food.findByIdAndDelete(id);

    if (!food) return res.status(404).json({ message: "Food not found" });

    // 🧹 Remove old image
    if (food.image) {
      const filePath = path.join("uploads", food.image);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // 🔥 Notify all clients
    const io = req.app.get("io");
    if (io) io.emit("foodDeleted", id);

    res.status(200).json({ message: "Food deleted successfully" });
  } catch (error) {
    console.error("Error deleting food:", error);
    res.status(500).json({ message: "Failed to delete food" });
  }
};
