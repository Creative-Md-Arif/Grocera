import express from "express";
import formidable from "express-formidable";
import {
  accessChat,
  fetchChats,
  fetchMessages,
  sendMessage,
} from "../controllers/chatController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = express.Router();
router.route("/").post(authenticate, accessChat);
router.route("/").get(authenticate, fetchChats);
router.route("/:chatId/messages").get(authenticate, fetchMessages);
router.route("/:chatId/messages").post(authenticate, formidable(), sendMessage);
export default router;
