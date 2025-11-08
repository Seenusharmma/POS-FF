import mongoose from "mongoose";

const foodSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: Number,
  image: String, // Cloudinary image URL
});

export default mongoose.model("Food", foodSchema);
