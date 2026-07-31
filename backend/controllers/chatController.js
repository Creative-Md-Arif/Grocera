import mongoose from "mongoose";
import asyncHandler from "../middlewares/asyncHandler.js";
import { Chat, Message } from "../models/chatModel.js";
import User from "../models/userModel.js";
import fs from "fs";
import path from "path";

const accessChat = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const admin = await User.findOne({ isAdmin: true });
  if (!admin) {
    return res.status(404).json({ error: "No admin available to chat" });
  }
  const adminId = admin._id;

  let chat = await Chat.findOne({
    participants: { $all: [userId, adminId] },
  }).populate("participants", "-password");

  if (chat) {
    return res.json(chat);
  }

  chat = await Chat.create({ participants: [userId, adminId] });
  chat = await chat.populate("participants", "-password");

  res.status(201).json(chat);
});

const fetchChats = asyncHandler(async (req, res) => {
  const query = req.user.isAdmin ? {} : { participants: req.user._id };

  const chats = await Chat.find(query)
    .populate("participants", "-password")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.json(chats);
});

const fetchMessages = asyncHandler(async (req, res) => {
  const messages = await Message.find({ chatId: req.params.chatId })
    .populate("sender", "username avatar isAdmin")
    .sort({ createdAt: 1 });

  res.json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.fields;
  const sender = req.user._id;

  if (!chatId || !mongoose.isValidObjectId(chatId)) {
    return res.status(400).json({ error: "Valid Chat ID is required" });
  }

  let imageUrl = "";

  if (req.files && req.files.image) {
    const image = req.files.image;
    const uploadDir = path.join(process.cwd(), "uploads");

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }

    const fileName = `chat_${Date.now()}_${image.name}`;
    const filePath = path.join(uploadDir, fileName);

    fs.copyFileSync(image.path, filePath);
    imageUrl = `/uploads/${fileName}`;
  }

  const newMessage = await Message.create({
    chatId,
    sender,
    content: content || "",
    imageUrl,
  });

  await Chat.findByIdAndUpdate(chatId, {
    lastMessage: content ? content.substring(0, 30) : "📷 Image",
    lastMessageTime: new Date(),
  });

  const io = req.app.get("io");
  if (io) {
    io.to(chatId).emit("receiveMessage", newMessage);
  }

  res.status(201).json(newMessage);
});

export { accessChat, fetchChats, fetchMessages, sendMessage };
