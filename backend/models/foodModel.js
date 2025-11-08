import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: { type: String },
    type: { type: String },
    price: { type: Number, required: true },
    available: { type: Boolean, default: true },
    image: {
      url: { type: String },
      public_id: { type: String },
    },
  },
  { timestamps: true }
);

export default mongoose.model("Food", foodSchema);
