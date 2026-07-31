import express from "express";
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  broadcastNotification,
} from "../controllers/notificationController.js";


import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

/**
 * @description সকল রাউট প্রোটেক্টেড (লগইন করা ইউজার ছাড়া কেউ অ্যাক্সেস পাবে না)
 */
router.use(authenticate);


router.route("/").get(getNotifications);
router.route("/mark-all").put(markAllAsRead);
router.route("/broadcast").post(authorizeAdmin, broadcastNotification);
router.route("/:id/read").put(markAsRead);
router.route("/:id").delete(deleteNotification);

export default router;
