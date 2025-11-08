import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect("mongodb+srv://roshansharma7250:v5xmJvpbsxEYW1ek@cluster0.l4oud1b.mongodb.net/");
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.log("DB Connection Failed:", err.message);
  }
};
