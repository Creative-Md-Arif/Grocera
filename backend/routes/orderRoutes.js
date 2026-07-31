import express from "express";
const router = express.Router();
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  findOrderById,
  markOrderAsPaid,
  updateOrderStatus,
  createManualOrder,
} from "../controllers/orderController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// ১. Create Order (Public - গেস্ট এবং লগইন করা সবাই অর্ডার করতে পারবে)
router
  .route("/")
  .post(createOrder)
  .get(authenticate, authorizeAdmin, getAllOrders);

router.route("/manual").post(authenticate, authorizeAdmin, createManualOrder);

router.route("/mine").get(authenticate, getUserOrders);

router.route("/:id").get(findOrderById);

router.route("/:id/pay").put(markOrderAsPaid);

router
  .route("/:id/status")
  .put(authenticate, authorizeAdmin, updateOrderStatus);

export default router;
