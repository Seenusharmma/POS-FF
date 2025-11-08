import express from "express";
import {
  createOrder,
  getOrders,
  createMultipleOrders,
  updateOrderStatus,
  deleteOrder,
} from "../controllers/orderController.js";

const router = express.Router();

router.get("/", getOrders);
router.post("/create", createOrder);
router.post("/create-multiple", createMultipleOrders);
router.put("/:id", updateOrderStatus);
router.delete("/:id", deleteOrder); // ✅ new route

export default router;
